import prisma from "../../../db";
import { getMergedRequiredCourseNos } from "./mergeOverride";
import { normalizeCourseNo } from "../model";

export type RequiredCourseItem = {
  courseNo: string;
  name: string;
  credit: string;
};

function buildCreditMapFromCurr(curr: any): Map<string, number> {
  const allow = new Set(["core", "major required"]);
  const map = new Map<string, number>();

  for (const g of curr.coreAndMajorGroups ?? []) {
    const name = String(g.groupName ?? "").trim().toLowerCase();
    if (!allow.has(name)) continue;

    for (const c of g.requiredCourses ?? []) {
      const courseNo = normalizeCourseNo(c.courseNo);
      const credits = Number(c.credits);
      if (courseNo && Number.isFinite(credits)) map.set(courseNo, credits);
    }
  }

  for (const g of curr.geGroups ?? []) {
    for (const c of g.requiredCourses ?? []) {
      const courseNo = normalizeCourseNo(c.courseNo);
      const credits = Number(c.credits);
      if (courseNo && Number.isFinite(credits)) map.set(courseNo, credits);
    }
  }

  return map;
}

async function fillMissingCreditsFromOtherCurriculums(
  creditMap: Map<string, number>,
  missingCourseNos: string[]
) {
  if (missingCourseNos.length === 0) return;

  const currs = await prisma.curriculum.findMany({
    select: {
      coreAndMajorGroups: true,
      geGroups: true,
    },
  });

  const global = new Map<string, number>();
  for (const curr of currs) {
    const m = buildCreditMapFromCurr(curr);
    for (const [k, v] of m.entries()) {
      if (!global.has(k)) global.set(k, v);
    }
  }

  for (const courseNo of missingCourseNos) {
    const c = global.get(courseNo);
    if (Number.isFinite(c)) creditMap.set(courseNo, c!);
  }
}

export async function getRequiredCourseList(program: string, curriculumYear: number) {
  const merged = await getMergedRequiredCourseNos(program, curriculumYear);

  if (!merged) {
    return {
      curriculum_year: String(curriculumYear),
      program: String(program).toUpperCase(),
      course_list: [] as RequiredCourseItem[],
    };
  }

  const courseNos = (merged.courseNos ?? []).map(normalizeCourseNo).filter(Boolean);

  const curr = await prisma.curriculum.findFirst({
    where: {
      curriculumProgram: merged.curriculumProgram,
      year: merged.year,
      isCOOPPlan: merged.isCOOPPlan,
    },
    select: {
      curriculumProgram: true,
      year: true,
      coreAndMajorGroups: true,
      geGroups: true,
    },
  });

  const creditMap = curr ? buildCreditMapFromCurr(curr) : new Map<string, number>();
  const missing = courseNos.filter((c) => !creditMap.has(c));
  
  await fillMissingCreditsFromOtherCurriculums(creditMap, missing);
  
  const courses = courseNos.length
    ? await prisma.course.findMany({
        where: { courseNo: { in: courseNos } },
        select: { courseNo: true, name: true },
      })
    : [];

  const nameMap = new Map(courses.map((c) => [normalizeCourseNo(c.courseNo), c.name]));

  const course_list: RequiredCourseItem[] = courseNos
    .map((courseNo) => ({
      courseNo,
      name: nameMap.get(courseNo) ?? "-",
      credit: String(creditMap.get(courseNo) ?? "-"),
    }))
    .sort((a, b) => Number(a.courseNo) - Number(b.courseNo));

  return {
    curriculum_year: String(merged.year),
    program: merged.curriculumProgram,
    course_list,
  };
}