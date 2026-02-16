import prisma from "../../../db";

export type SkillListItem = {
  skillID: string;
  name: string;
};

// prefer non-coop first, if not have then use coop plan
// btw the required course are the same for coop and non-coop
async function findCurriculumBestEffort(program: string, curriculumYear: number) {
  const programUpper = String(program).toUpperCase();
  const nonCoop = await prisma.curriculum.findFirst({
    where: {
      curriculumProgram: programUpper,
      year: curriculumYear,
      isCOOPPlan: false,
    },
    select: {
      curriculumProgram: true,
      year: true,
      requiredCourseNos: true,
    },
  });
  
  if (nonCoop) return nonCoop;

  const coop = await prisma.curriculum.findFirst({
    where: {
      curriculumProgram: programUpper,
      year: curriculumYear,
      isCOOPPlan: true,
    },
    select: {
      curriculumProgram: true,
      year: true,
      requiredCourseNos: true,
    },
  });

  return coop ?? null;
}

export async function getSkillList(program: string, curriculumYear: number) {
  const curr = await findCurriculumBestEffort(program, curriculumYear);

  if (!curr) {
    return {
      curriculum_year: String(curriculumYear),
      program: String(program).toUpperCase(),
      skill_list: [],
    };
  }

  const courseNos = (curr.requiredCourseNos ?? []).map(String);

  const courseSkills = courseNos.length
    ? await prisma.courseSkill.findMany({
        where: { courseNo: { in: courseNos } },
        select: { skills: true },
      })
    : [];

  // dedupe by skillID only (name can be duplicated im not is it possible or not)
  const map = new Map<string, string>(); // skillID -> name (first seen)

  for (const cs of courseSkills) {
    for (const s of cs.skills ?? []) {
      if (!s?.id) continue;

      const skillID = String(s.id);
      if (map.has(skillID)) continue;

      const name = String(s.name ?? "-");
      map.set(skillID, name);
    }
  }

  const skill_list: SkillListItem[] = Array.from(map.entries())
    .map(([skillID, name]) => ({ skillID, name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    curriculum_year: String(curr.year),
    program: curr.curriculumProgram,
    skill_list,
  };
}