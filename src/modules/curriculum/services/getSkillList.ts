import prisma from "../../../db";
import { getMergedRequiredCourseNos } from "./mergeOverride";
import { CourseSkillService } from "../../skill/service";

export type SkillListItem = {
  skillID: string;
  name: string;
  max_level: number;
};

export async function getSkillList(program: string, curriculumYear: number) {
  const merged = await getMergedRequiredCourseNos(program, curriculumYear);

  if (!merged) {
    return {
      curriculum_year: String(curriculumYear),
      program: String(program).toUpperCase(),
      skill_list: [] as SkillListItem[],
    };
  }

  const courseNos = merged.courseNos ?? [];
  if (courseNos.length === 0) {
    return {
      curriculum_year: String(merged.year),
      program: merged.curriculumProgram,
      skill_list: [] as SkillListItem[],
    };
  }

  let maxLevels: Array<{ skillID: string; skillName: string; maxLevel: number }> = [];
  try {
    maxLevels = await CourseSkillService.getMaxLevel(courseNos);
  } catch {
    maxLevels = [];
  }

  const skill_list: SkillListItem[] = maxLevels
    .map((x) => ({
      skillID: String(x.skillID),
      name: String(x.skillName ?? "-"),
      max_level: Number(x.maxLevel ?? 0),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    curriculum_year: String(merged.year),
    program: merged.curriculumProgram,
    skill_list,
  };
}