import prisma from "../../../db";

function normalizeCourseNo(x: string) {
  return String(x ?? "").trim();
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr));
}

// sort courseNo in ascending order
// if both are number then compare as number, otherwise compare as string
export function sortCourseNosAsc(courseNos: string[]) {
  return [...courseNos].sort((a, b) => {
    const an = Number(a);
    const bn = Number(b);
    const aNumOk = Number.isFinite(an);
    const bNumOk = Number.isFinite(bn);

    if (aNumOk && bNumOk) return an - bn;
    if (aNumOk && !bNumOk) return -1;
    if (!aNumOk && bNumOk) return 1;

    return a.localeCompare(b);
  });
}

export async function findCurriculumBestEffort(program: string, year: number) {
  const prog = String(program).toUpperCase();

  const nonCoop = await prisma.curriculum.findFirst({
    where: {
        curriculumProgram: prog,
        year,
        isCOOPPlan: false
    },
    select: {
      curriculumProgram: true,
      year: true,
      isCOOPPlan: true,
      requiredCourseNos: true,
      coreAndMajorGroups: true,
      geGroups: true,
    },
  });
  if (nonCoop) return nonCoop;

  const coop = await prisma.curriculum.findFirst({
    where: {
        curriculumProgram: prog,
        year,
        isCOOPPlan: true
    },
    select: {
      curriculumProgram: true,
      year: true,
      isCOOPPlan: true,
      requiredCourseNos: true,
      coreAndMajorGroups: true,
      geGroups: true,
    },
  });

  return coop ?? null;
}

export async function getMergedRequiredCourseNos(program: string, year: number) {
  const base = await findCurriculumBestEffort(program, year);
  if (!base) return null;

  const override = await prisma.curriculumOverride.findFirst({
    where: {
      curriculumProgram: base.curriculumProgram,
      year: base.year,
      isCOOPPlan: base.isCOOPPlan,
    },
    select: {
        addedCourseNos: true,
        removedCourseNos: true
    },
  });

  const baseNos = (base.requiredCourseNos ?? []).map(normalizeCourseNo).filter(Boolean);
  const added = (override?.addedCourseNos ?? []).map(normalizeCourseNo).filter(Boolean);
  const removedSet = new Set((override?.removedCourseNos ?? []).map(normalizeCourseNo).filter(Boolean));

  // base - removed + added
  const merged = uniq([
    ...baseNos.filter((c) => !removedSet.has(c)),
    ...added,
  ]);

  return {
    curriculumProgram: base.curriculumProgram,
    year: base.year,
    isCOOPPlan: base.isCOOPPlan,
    courseNos: sortCourseNosAsc(merged),
    baseCurriculum: base,
  };
}