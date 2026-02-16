import prisma from "../../../db";
import { getMergedRequiredCourseNos } from "./mergeOverride";

export type RequiredCourseItem = {
  courseNo: string;
  name: string;
  credit: string;
};

function buildRequiredCreditMap(curr: any): Map<string, number> {
  const allow = new Set(["core", "major required"]);
  const map = new Map<string, number>();

  for (const g of curr.coreAndMajorGroups ?? []) {
    const name = String(g.groupName ?? "").trim().toLowerCase();
    if (!allow.has(name)) continue;

    for (const c of g.requiredCourses ?? []) {
      const courseNo = String(c.courseNo);
      const credits = Number(c.credits);
      if (!Number.isNaN(credits)) map.set(courseNo, credits);
    }
  }

  for (const g of curr.geGroups ?? []) {
    for (const c of g.requiredCourses ?? []) {
      const courseNo = String(c.courseNo);
      const credits = Number(c.credits);
      if (!Number.isNaN(credits)) map.set(courseNo, credits);
    }
  }

  return map;
}

export async function getRequiredCourseList(program: string, curriculumYear: number) {
  const merged = await getMergedRequiredCourseNos(program, curriculumYear);

  if (!merged) {
    return {
      curriculum_year: String(curriculumYear),
      program: String(program).toUpperCase(),
      course_list: [],
    };
  }

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

  if (!curr) {
    return {
      curriculum_year: String(curriculumYear),
      program: String(program).toUpperCase(),
      course_list: [],
    };
  }

  const courseNos = (merged.courseNos ?? []).map(String);
  const creditMap = buildRequiredCreditMap(curr);

  const courses = courseNos.length
    ? await prisma.course.findMany({
        where: { courseNo: { in: courseNos } },
        select: { courseNo: true, name: true },
      })
    : [];

  const nameMap = new Map(courses.map((c) => [String(c.courseNo), c.name]));

  const course_list: RequiredCourseItem[] = courseNos
    .map((courseNo) => ({
      courseNo,
      name: nameMap.get(courseNo) ?? "-",
      credit: String(creditMap.get(courseNo) ?? "-"),
    }))
    .sort((a, b) => Number(a.courseNo) - Number(b.courseNo));

  return {
    curriculum_year: String(curr.year),
    program: String(curr.curriculumProgram).toUpperCase(),
    course_list,
  };
}