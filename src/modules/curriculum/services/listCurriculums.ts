import prisma from "../../../db";

export async function listCurriculums() {
  const curriculums = await prisma.curriculum.findMany({
    where: {
      isCOOPPlan: false,
    },
    select: {
      curriculumProgram: true,
      year: true,
      allCourseNos: true,
      totalCourseCount: true,
    },
    orderBy: [
      { curriculumProgram: "asc" },
      { year: "desc" },
    ],
  });

  const results = [];

  for (const c of curriculums) {
    const courseNos = (c.allCourseNos ?? []).map(String);

    const courseSkills = courseNos.length
      ? await prisma.courseSkill.findMany({
          where: { courseNo: { in: courseNos } },
          select: { skills: true },
        })
      : [];

    const skillIdSet = new Set<string>();
    for (const cs of courseSkills) {
      for (const s of cs.skills ?? []) {
        if (s?.id) skillIdSet.add(String(s.id));
      }
    }

    results.push({
      program: c.curriculumProgram,
      curriculum_year: String(c.year),
      total_courses: c.totalCourseCount ?? courseNos.length,
      total_skills: skillIdSet.size,
    });
  }

  return { curriculums: results };
}