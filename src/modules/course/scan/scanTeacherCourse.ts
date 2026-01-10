import axios from 'axios';
import { getCurrentAcademicYear, matchTeacher } from '../utils';

const BASE_URL = process.env.CPE_API_BASE_URL!;
const API_KEY = process.env.CPE_API_KEY!;

const headers = {
    Authorization: `Bearer ${API_KEY}`,
};

const YEARS_TO_SCAN = 2;
const SEMESTERS = [1, 2, 3] as const;

export async function scanTeacherCourse(teacherID: string) {
    const startTime = Date.now();
    let sectionRequestCount = 0;

    try {
      const teacherRes = await axios.get(
        `${BASE_URL}/teacher/${teacherID}`,
        { headers }
      );

      const teacher = teacherRes.data?.teacher;
      if (!teacher?.id) {
        throw new Error('teacher not found');
      }

      const courseRes = await axios.get(
        `${BASE_URL}/course/detail`,
        { headers }
      );

      const courseDetails = courseRes.data?.courseDetails ?? [];
      const courseMap = new Map<string, any>();
      courseDetails.forEach((c: any) =>
        courseMap.set(c.courseNo, c)
      );

      const foundCourseNo = new Set<string>();
      const sectionCache = new Map<string, boolean>();
      const currentYear = getCurrentAcademicYear();

      for (let i = 0; i < YEARS_TO_SCAN; i++) {
        const year = currentYear - i;

        for (const semester of SEMESTERS) {
          for (const course of courseDetails) {
            if (foundCourseNo.has(course.courseNo)) continue;

            const key = `${course.courseNo}-${year}-${semester}`;
            if (sectionCache.has(key)) {
              if (sectionCache.get(key)) {
                foundCourseNo.add(course.courseNo);
              }
              continue;
            }

            try {
              sectionRequestCount++;

              const res = await axios.get(
                `${BASE_URL}/course/sections`,
                {
                  headers,
                  params: {
                    courseNo: course.courseNo,
                    year,
                    semester,
                  },
                }
              );

              const sections = res.data?.sections ?? [];
              const matched = sections.some((sec: any) =>
                matchTeacher(sec, teacherID)
              );

              sectionCache.set(key, matched);
              if (matched) {
                foundCourseNo.add(course.courseNo);
              }
            } catch {
              sectionCache.set(key, false);
            }
          }
        }
      }

      const teacherCourse = Array.from(foundCourseNo).map(no => {
        const c = courseMap.get(no);
        return {
          courseNo: no,
          courseNameTH: c?.courseNameTH ?? null,
          courseNameEN: c?.courseNameEN ?? null,
          detailTH: c?.detailTH ?? null,
          detailEN: c?.detailEN ?? null,
          credit: c?.credits ?? null,
        };
      });

      const result = {
        teacher,
        teacherCourse,
      };

      if (process.env.NODE_ENV !== 'production') {
        console.log('scan finished');
        console.log('time used(ms):', Date.now() - startTime);
        console.log('section requests:', sectionRequestCount);
        console.log('found courses:', teacherCourse.length);
      }

      return result;
    } catch (err: any) {
      console.error('!!!scan error', err);
      throw err;
    }
}
