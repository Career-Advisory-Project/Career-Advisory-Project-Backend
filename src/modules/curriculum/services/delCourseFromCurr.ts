import prisma from "../../../db";

function normalizeCourseNo(x: string) {
  return String(x ?? "").trim();
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr));
}

async function findCurriculumBestEffort(program: string, year: number) {
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
    },
  });

  return coop ?? null;
}

export async function delCoursesFromCurriculum(
  program: string,
  curriculumYear: number,
  courses: string[]
) {
  const prog = String(program).toUpperCase();
  const year = Number(curriculumYear);

  const courseNos = uniq(courses.map(normalizeCourseNo).filter(Boolean));
  if (courseNos.length === 0) return { ok: true };

  const base = await findCurriculumBestEffort(prog, year);
  if (!base) {
    throw new Error(`Curriculum not found: ${prog} ${year}`);
  }

  const baseSet = new Set(
    (base.requiredCourseNos ?? []).map(normalizeCourseNo).filter(Boolean)
  );

  const toRemove = courseNos.filter((c) => baseSet.has(c));
  const toUnadd = courseNos.filter((c) => !baseSet.has(c));

  const overrideWhere = {
    curriculumProgram: prog,
    year,
    isCOOPPlan: base.isCOOPPlan,
  };

  const existing = await prisma.curriculumOverride.findFirst({
    where: overrideWhere,
    select: {
      id: true,
      addedCourseNos: true,
      removedCourseNos: true,
    },
  });

  const currentAdded = (existing?.addedCourseNos ?? []).map(normalizeCourseNo).filter(Boolean);
  const currentRemoved = (existing?.removedCourseNos ?? []).map(normalizeCourseNo).filter(Boolean);

  // removed = currentRemoved + toRemove
  const newRemoved = uniq([...currentRemoved, ...toRemove]);

  // added = currentAdded - toUnadd
  const unaddSet = new Set(toUnadd);
  const newAdded = currentAdded.filter((c) => !unaddSet.has(c));

  if (!existing) {
    await prisma.curriculumOverride.create({
      data: {
        ...overrideWhere,
        addedCourseNos: [],
        removedCourseNos: newRemoved,
      },
    });
    return { ok: true };
  }

  if (newAdded.length === 0 && newRemoved.length === 0) {
    await prisma.curriculumOverride.delete({ where: { id: existing.id } });
    return { ok: true };
  }

  await prisma.curriculumOverride.update({
    where: { id: existing.id },
    data: {
      addedCourseNos: newAdded,
      removedCourseNos: newRemoved,
    },
  });

  return { ok: true };
}