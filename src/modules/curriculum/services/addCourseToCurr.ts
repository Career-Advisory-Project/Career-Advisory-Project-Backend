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
        isCOOPPlan: false
    },
    select: {
        curriculumProgram: true, 
        year: true, 
        isCOOPPlan: true
    },
  });
  if (nonCoop) return nonCoop;

  const coop = await prisma.curriculum.findFirst({
    where: {
        curriculumProgram: program, 
        year, 
        isCOOPPlan: true
    },
    select: {
        curriculumProgram: true, 
        year: true, 
        isCOOPPlan: true
    },
  });
  return coop ?? null;
}

export async function addCoursesToCurriculum(
  program: string,
  curriculumYear: number,
  courses: string[]
) {
  const prog = String(program).toUpperCase();
  const year = curriculumYear;

  const courseNos = uniq(courses.map(normalizeCourseNo).filter(Boolean));
  if (courseNos.length === 0) 
    return { ok: true };

  // decide which curriculum version we attach override to
  const base = await findCurriculumBestEffort(prog, year);
  if (!base) {
    // no curriculum in DB loey
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
        removedCourseNos: true
    },
  });

  if (!existing) {
    await prisma.curriculumOverride.create({
      data: {
        ...overrideWhere,
        addedCourseNos: courseNos,
        removedCourseNos: [],
      },
    });
    return { ok: true };
  }

  const currentAdded = (existing.addedCourseNos ?? []).map(String);
  const currentRemoved = (existing.removedCourseNos ?? []).map(String);
  const newAdded = uniq([...currentAdded, ...courseNos]);

  // if a course is in currentRemoved but now added again, it means we un-remove it, so we remove it from removedCourseNos
  const addSet  = new Set(courseNos);
  const newRemoved = currentRemoved.filter((c) => !addSet.has(String(c)));

  await prisma.curriculumOverride.update({
    where: {
        id: existing.id 
    },
    data: {
      addedCourseNos: newAdded,
      removedCourseNos: newRemoved,
    },
  });

  return { ok: true };
}