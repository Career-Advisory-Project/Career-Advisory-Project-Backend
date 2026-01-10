import axios from 'axios';
import prisma from '../../../db';
import { scanTeacherCourse } from './scanTeacherCourse';

const BASE_URL = process.env.CPE_API_BASE_URL!;
const API_KEY = process.env.CPE_API_KEY!;

const headers = {
  Authorization: `Bearer ${API_KEY}`,
};

export async function scanAllTeachers() {
  console.log('---start scan all teachers');

  const res = await axios.get(`${BASE_URL}/teacher`, { headers });
  const teachers = res.data?.teachers ?? [];

  for (const teacher of teachers) {
    const teacherID = teacher.id;
    console.log(`--scanning teacher ${teacherID}`);

    try {
      const result = await scanTeacherCourse(teacherID);

      await prisma.teacherCourse.upsert({
        where: { teacherID },
        update: {
          titleTH: teacher.titleTH,
          titleEN: teacher.titleEN,
          firstNameTH: teacher.firstNameTH,
          firstNameEN: teacher.firstNameEN,
          lastNameTH: teacher.lastNameTH,
          lastNameEN: teacher.lastNameEN,
          courses: result.teacherCourse,
          updatedAt: new Date(),
        },
        create: {
          teacherID,
          titleTH: teacher.titleTH,
          titleEN: teacher.titleEN,
          firstNameTH: teacher.firstNameTH,
          firstNameEN: teacher.firstNameEN,
          lastNameTH: teacher.lastNameTH,
          lastNameEN: teacher.lastNameEN,
          courses: result.teacherCourse,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      console.log(`*saved ${teacherID}`);
    } catch (err) {
      console.error(`!!error scanning ${teacherID}`, err);
    }
  }
  console.log('-scan all teachers finished');
}
