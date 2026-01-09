import prisma from '../../db';
import { scanTeacherCourse } from './scan/scanTeacherCourse';

export async function getTeacherCourse(teacherID: string) {
  const record = await prisma.teacherCourse.findUnique({
    where: { teacherID },
  });

  if (!record) {
    scanTeacherCourse(teacherID).catch(() => {});

    return {
      ok: false,
      statusCode: 404,
      message: 'Teacher ID not found on the record',
    };
  }

  return {
    ok: true,
    id: record.teacherID,
    titleTH: record.titleTH,
    titleEN: record.titleEN,
    firstNameTH: record.firstNameTH,
    firstNameEN: record.firstNameEN,
    lastNameTH: record.lastNameTH,
    lastNameEN: record.lastNameEN,
    courses: record.courses,
    updatedAt: record.updatedAt,
  };
}
