import prisma from "../../../db";

type PickedCurriculum = {
  curriculumProgram: string;
  year: number;
  isCOOPPlan: boolean;
  requiredCourseNos: string[];
  requiredCourseCount: number;
};

export async function listCurriculums() {
  const curriculums = await prisma.curriculum.findMany({
    select: {
      curriculumProgram: true,
      year: true,
      isCOOPPlan: true,
      requiredCourseNos: true,
      requiredCourseCount: true,
    },
    orderBy: [
      { curriculumProgram: "asc" },
      { year: "desc" },
    ],
  });

  const picked = new Map<string, PickedCurriculum>();

  for (const c of curriculums) {
    const program = String(c.curriculumProgram).toUpperCase();
    const year = Number(c.year);
    const key = `${program}-${year}`;

    const current: PickedCurriculum = {
      curriculumProgram: program,
      year,
      isCOOPPlan: Boolean(c.isCOOPPlan),
      requiredCourseNos: (c.requiredCourseNos ?? []).map(String),
      requiredCourseCount: Number(c.requiredCourseCount ?? 0),
    };

    const existing = picked.get(key);
    if (!existing) {
      picked.set(key, current);
      continue;
    }

    if (existing.isCOOPPlan === true && current.isCOOPPlan === false) {
      picked.set(key, current);
    }
  }

  const results = [];

  for (const c of picked.values()) {
    const courseNos = (c.requiredCourseNos ?? []).map(String);

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
      total_courses: c.requiredCourseCount || courseNos.length,
      total_skills: skillIdSet.size,
    });
  }

  results.sort((a, b) => {
    if (a.program !== b.program) return a.program.localeCompare(b.program);
    return Number(a.curriculum_year) - Number(b.curriculum_year);
  });

  return { curriculums: results };
}