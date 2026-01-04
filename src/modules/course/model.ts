export interface Teacher {
    id: string;
    titleTH: string;
    titleEN: string;
    firstNameTH: string;
    firstNameEN: string;
    lastNameTH: string;
    lastNameEN: string;
}

export interface courseDetails {
    courseNo: string;
    courseNameTH: string;
    courseNameEN: string;
    detailTH: string;
    detailEN: string;
    credit: any;
}

export interface TeacherCourseResponse {
    ok: boolean;
    teacher: Teacher;
    teacherCourse: courseDetails[];
}
