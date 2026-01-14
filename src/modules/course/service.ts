import prisma from '../../db';
import { scanTeacherCourse } from './scan/scanTeacherCourse';
import { status } from 'elysia';

export async function getTeacherCourse(teacherID: string) {
  const teacher = await prisma.teacherCourse.findUnique({
    where: { teacherID },
  });

  if (!teacher) {
    scanTeacherCourse(teacherID).catch(() => {});
    return status(404, {
      ok: false,
      detail: 'Teacher not found',
    });
  }

  const courseNos = teacher.courseNos ?? [];

  const courses = await prisma.course.findMany({
    where: {
      courseNo: { in: courseNos },
    },
  });

  const courseMap = new Map(
    courses.map(c => [c.courseNo, c])
  );

  const resultCourses = courseNos.map((no) => {
    const c = courseMap.get(no);
    return {
      courseNo: no,
      name: c?.name ?? null,
      descTH: c?.descTH ?? null,
      descENG: c?.descENG ?? null,
    };
  });

  return {
    ok: true,
    id: teacher.teacherID,
    titleTH: teacher.titleTH,
    titleEN: teacher.titleEN,
    firstNameTH: teacher.firstNameTH,
    firstNameEN: teacher.firstNameEN,
    lastNameTH: teacher.lastNameTH,
    lastNameEN: teacher.lastNameEN,
    courses: resultCourses,
    updatedAt: teacher.updatedAt,
  };
}
