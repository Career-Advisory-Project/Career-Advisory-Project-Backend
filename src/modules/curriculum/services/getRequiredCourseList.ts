import prisma from "../../../db";
import { getMergedRequiredCourseNos } from "./mergeOverride";
import { normalizeCourseNo } from "../model";

export type RequiredCourseItem = {
  courseNo: string;
  name: string;
  credit: string;
  recommendSemester: string;
  recommendYear: string;
};

type CourseMeta = {
  credit: number;
  recommendSemester: number | null;
  recommendYear: number | null;
};

function buildCourseMetaMapFromCurr(curr: any): Map<string, CourseMeta> {
  const map = new Map<string, CourseMeta>();
  const addCourses = (courses: any[] | undefined | null) => {
    for (const c of courses ?? []) {
      const courseNo = normalizeCourseNo(c.courseNo);
      const credit = Number(c.credits);

      if (!courseNo || !Number.isFinite(credit) || map.has(courseNo)) continue;

      map.set(courseNo, {
        credit,
        recommendSemester:
          c.recommendSemester === null || c.recommendSemester === undefined
            ? null
            : Number(c.recommendSemester),
        recommendYear:
          c.recommendYear === null || c.recommendYear === undefined
            ? null
            : Number(c.recommendYear),
      });
    }
  };

  // cover both requiredCourses and electiveCourses in coreAndMajorGroups
  for (const g of curr.coreAndMajorGroups ?? []) {
    addCourses(g.requiredCourses);
    addCourses(g.electiveCourses);
  }

  // cover both requiredCourses and electiveCourses in geGroups
  for (const g of curr.geGroups ?? []) {
    addCourses(g.requiredCourses);
    addCourses(g.electiveCourses);
  }

  return map;
}

async function fillMissingCourseMetaFromOtherCurriculums(
  metaMap: Map<string, CourseMeta>,
  missingCourseNos: string[]
) {
  if (missingCourseNos.length === 0) return;

  const currs = await prisma.curriculum.findMany({
    select: {
      coreAndMajorGroups: true,
      geGroups: true,
    },
  });

  const global = new Map<string, CourseMeta>();
  for (const curr of currs) {
    const m = buildCourseMetaMapFromCurr(curr);
    for (const [k, v] of m.entries()) {
      if (!global.has(k)) global.set(k, v);
    }
  }

  for (const courseNo of missingCourseNos) {
    const meta = global.get(courseNo);
    if (meta) metaMap.set(courseNo, meta);
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

  const metaMap = curr ? buildCourseMetaMapFromCurr(curr) : new Map<string, CourseMeta>();
  const missing = courseNos.filter((c) => !metaMap.has(c));

  await fillMissingCourseMetaFromOtherCurriculums(metaMap, missing);

  const courses = courseNos.length
    ? await prisma.course.findMany({
        where: { courseNo: { in: courseNos } },
        select: { courseNo: true, name: true },
      })
    : [];

  const nameMap = new Map(courses.map((c) => [normalizeCourseNo(c.courseNo), c.name]));

  const course_list: RequiredCourseItem[] = courseNos
    .map((courseNo) => {
      const meta = metaMap.get(courseNo);

      return {
        courseNo,
        name: nameMap.get(courseNo) ?? "-",
        credit: String(meta?.credit ?? "-"),
        recommendSemester:
          meta?.recommendSemester !== null && meta?.recommendSemester !== undefined
            ? String(meta.recommendSemester)
            : "-",
        recommendYear:
          meta?.recommendYear !== null && meta?.recommendYear !== undefined
            ? String(meta.recommendYear)
            : "-",
      };
    })
    .sort((a, b) => Number(a.courseNo) - Number(b.courseNo));

  return {
    curriculum_year: String(merged.year),
    program: merged.curriculumProgram,
    course_list,
  };
}