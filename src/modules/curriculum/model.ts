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