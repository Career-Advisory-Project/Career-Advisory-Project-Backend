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

export function uniq(arr: string[]): string[] {
  return Array.from(new Set(arr));
}

export function difference(base: string[], remove: string[]): string[] {
  const s = new Set(remove);
  return base.filter((x) => !s.has(x));
}

export function union(a: string[], b: string[]): string[] {
  return uniq([...a, ...b]);
}