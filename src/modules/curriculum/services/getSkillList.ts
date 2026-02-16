import prisma from "../../../db";
import { getMergedRequiredCourseNos } from "./mergeOverride";

export type SkillListItem = {
  skillID: string;
  name: string;
};

export async function getSkillList(program: string, curriculumYear: number) {
  const merged = await getMergedRequiredCourseNos(program, curriculumYear);

  if (!merged) {
    return {
      curriculum_year: String(curriculumYear),
      program: String(program).toUpperCase(),
      skill_list: [],
    };
  }

  const courseNos = merged.courseNos;

  const courseSkills = courseNos.length
    ? await prisma.courseSkill.findMany({
        where: { courseNo: { in: courseNos } },
        select: { skills: true },
      })
    : [];

  // dedupe by skillID only (name can be duplicated)
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
    curriculum_year: String(merged.year),
    program: merged.curriculumProgram,
    skill_list,
  };
}