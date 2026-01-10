import prisma from '../../db';
import { scanTeacherCourse } from './scan/scanTeacherCourse';
import { status } from 'elysia';

export async function getTeacherCourse(teacherID: string) {
  const record = await prisma.teacherCourse.findUnique({
    where: { teacherID },
  });

  if (!record) {
    scanTeacherCourse(teacherID).catch(() => {});
    return status(404, {
      ok: false,
      detail: 'Teacher ID not found on the record',
    });
  }

  const courseNos = (record.courses as any[]).map(
    (c) => c.courseNo
  );

  const coursesWithSkills = await prisma.course.findMany({
    where: {
      courseNo: { in: courseNos },
    }
  });

  const enrichedCourses = (record.courses as any[]).map((c) => ({
    ...c,
    skills:
      (coursesWithSkills as any[]).find(
        (dbCourse: any) => dbCourse.courseNo === c.courseNo
      )?.skills ?? [],
  }));

  return {
    ok: true,
    id: record.teacherID,
    titleTH: record.titleTH,
    titleEN: record.titleEN,
    firstNameTH: record.firstNameTH,
    firstNameEN: record.firstNameEN,
    lastNameTH: record.lastNameTH,
    lastNameEN: record.lastNameEN,
    courses: enrichedCourses,
    updatedAt: record.updatedAt,
  };
}
