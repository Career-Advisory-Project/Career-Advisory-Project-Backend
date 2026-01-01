import type { TeacherCourseResponse, CourseDetail } from './model';

const BASE_URL = process.env.CPE_API_BASE_URL!;
const API_KEY = process.env.CPE_API_KEY!;

const headers = {
  Authorization: `Bearer ${API_KEY}`,
};

const CURRENT_YEAR = 2567;
const CURRENT_SEMESTER = 2;

export const getTeacherCourseService = async (
  teacherID: string,
  courseID?: string
): Promise<TeacherCourseResponse | null> => {
  try {
    // fetch instructor info
    const teacherRes = await fetch(`${BASE_URL}/teacher/${teacherID}`, {
      headers,
    });

    if (!teacherRes.ok) return null;
    const teacherResJson = await teacherRes.json();
    const teacher = teacherResJson.teacher;


    // try to list all courses but its not working yet
    let courseList: string[] = [];

    if (courseID) {
      courseList = [courseID];
    } else {
      const curriculumYear = 2563;
      const curRes = await fetch(
        `${BASE_URL}/curriculum?year=${curriculumYear}&curriculumProgram=CPE&isCOOPPlan=false`,
        { headers }
      );
      const curData = await curRes.json();
      courseList = curData?.courses?.map((c: any) => c.courseNo) ?? [];
      console.log('Fetched course list:', courseList); //for debugging ja
    }

    // check each course if the teacher is teaching
    const teacherCourse: CourseDetail[] = [];

    for (const courseNo of courseList) {
      try {
        const secRes = await fetch(
          `${BASE_URL}/course/sections?courseNo=${courseNo}&year=${CURRENT_YEAR}&semester=${CURRENT_SEMESTER}`,
          { headers }
        );

        const secData = await secRes.json();
        if (!secData?.courses) continue;

        const isTeaching = secData.courses.some((c: any) =>
          c.section.some(
            (s: any) =>
              s.teacher?.id === teacherID ||
              s.coTeachers?.some((ct: any) => ct.id === teacherID)
          )
        );

        if (!isTeaching) continue;

        const detailRes = await fetch(
          `${BASE_URL}/course/detail?courseNo=${courseNo}`,
          { headers }
        );
        const detail = await detailRes.json();

        teacherCourse.push({
          courseNo,
          name: detail.nameTH,
          descTH: detail.descTH,
          descENG: detail.descEN,
          credit: detail.credit,
        });
      } catch {
        // skip errors for individual courses
      }
    }

    return {
      ok: true,
      teacherID,
      teacher: {
        id: teacherID,
        titleTH: teacher.titleTH,
        titleEN: teacher.titleEN,
        firstNameTH: teacher.firstNameTH,
        firstNameEN: teacher.firstNameEN,
        lastNameTH: teacher.lastNameTH,
        lastNameEN: teacher.lastNameEN,
        type: teacher.type,
      },
      teacherCourse,
    };
  } catch (err) {
    console.error(err);
    return null;
  }
};
