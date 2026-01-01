export interface CourseDetail {
  courseNo: string;
  name: string;
  descTH: string;
  descENG: string;
  credit: number;
}

export interface TeacherCourseResponse {
  success: boolean;
  teacherID: string;
  titleTH: string;
  titleEN: string;
  firstNameTH: string;
  firstNameEN: string;
  lastNameTH: string;
  lastNameEN: string;
  type: string;
  teacherCourse: CourseDetail[];
}
