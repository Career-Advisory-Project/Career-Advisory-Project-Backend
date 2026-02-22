import prisma from "../../db";

export type CurriculumProgram = "CPE" | "ISNE";

export type CurriculumKey = {
  curriculumProgram: CurriculumProgram;
  year: number;
  isCOOPPlan: boolean;
};

export function normalizeKey(key: CurriculumKey): CurriculumKey {
  return {
    curriculumProgram: key.curriculumProgram,
    year: Number(key.year),
    isCOOPPlan: Boolean(key.isCOOPPlan),
  };
}

export function uniq(arr: string[]) {
  return Array.from(new Set(arr));
}

export function normalizeCourseNo(x: string) {
  return String(x ?? "").trim();
}

export async function curriculumYearExists(program: string, year: number) {
  const prog = String(program).toUpperCase();

  const found = await prisma.curriculum.findFirst({
    where: {
      curriculumProgram: prog,
      year,
    },
    select: { id: true },
  });

  return !!found;
}