import prisma from "../../../db";

export type AddCoursesBody = {
  curriculum_year: string;
  program: string;
  courses: string[];
};

function normalizeCourseNo(x: string) {
  return String(x ?? "").trim();
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr));
}

export async function addCoursesToCurriculum(
  program: string,
  curriculumYear: number,
  courses: string[]
) {
  const prog = String(program).toUpperCase();
  const year = Number(curriculumYear);

  const courseNos = uniq(courses.map(normalizeCourseNo).filter(Boolean));
  if (courseNos.length === 0) {
    return { ok: true }; // nothing to do
  }

  const existing = await prisma.curriculumOverride.findFirst({
    where: {
      curriculumProgram: prog,
      year,
      // assume we only override non-coop plan, since coop and non-coop have the same required courses
      isCOOPPlan: false, 
    },
    select: {
      id: true,
      addedCourseNos: true,
      removedCourseNos: true,
    },
  });

  if (!existing) {
    await prisma.curriculumOverride.create({
      data: {
        curriculumProgram: prog,
        year,
        isCOOPPlan: false,
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
  const removeSet = new Set(courseNos);
  const newRemoved = currentRemoved.filter((c) => !removeSet.has(String(c)));

  await prisma.curriculumOverride.update({
    where: { id: existing.id },
    data: {
      addedCourseNos: newAdded,
      removedCourseNos: newRemoved,
    },
  });

  return { ok: true };
}