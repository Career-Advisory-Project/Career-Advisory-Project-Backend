import prisma from "../../../db";

function normalizeCourseNo(x: string) {
  return String(x ?? "").trim();
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr));
}

async function findCurriculumBestEffort(program: string, year: number) {
  const nonCoop = await prisma.curriculum.findFirst({
    where: {
      curriculumProgram: program,
      year,
      isCOOPPlan: false,
    },
    select: {
      curriculumProgram: true,
      year: true,
      isCOOPPlan: true,
    },
  });
  if (nonCoop) return nonCoop;

  const coop = await prisma.curriculum.findFirst({
    where: {
      curriculumProgram: program,
      year,
      isCOOPPlan: true,
    },
    select: {
      curriculumProgram: true,
      year: true,
      isCOOPPlan: true,
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

  // decide which curriculum version we attach override to
  const base = await findCurriculumBestEffort(prog, year);
  if (!base) {
    throw new Error(`Curriculum not found: ${prog} ${year}`);
  }

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

  // no override yet -> create one with removedCourseNos
  if (!existing) {
    await prisma.curriculumOverride.create({
      data: {
        ...overrideWhere,
        addedCourseNos: [],
        removedCourseNos: courseNos,
      },
    });
    return { ok: true };
  }

  const currentAdded = (existing.addedCourseNos ?? []).map(String);
  const currentRemoved = (existing.removedCourseNos ?? []).map(String);

  // remove courses (add to removed list)
  const newRemoved = uniq([...currentRemoved, ...courseNos]);

  // if a course was previously added but now removed -> un-add it
  const removeSet = new Set(courseNos);
  const newAdded = currentAdded.filter((c) => !removeSet.has(String(c)));

  await prisma.curriculumOverride.update({
    where: { id: existing.id },
    data: {
      addedCourseNos: newAdded,
      removedCourseNos: newRemoved,
    },
  });

  return { ok: true };
}