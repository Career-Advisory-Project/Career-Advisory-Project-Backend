export function getCurrentAcademicYear(): number {
  return new Date().getFullYear() + 543 - 2; //2566 (scan 2565,2564)
}

export function matchTeacher(sec: any, teacherID: string): boolean {
    if (sec.teacher === teacherID) return true;
    if (sec.teacher?.id === teacherID) return true;
    if (sec.teacherId === teacherID) return true;

    if (Array.isArray(sec.coTeachers)) {
        return sec.coTeachers.some(
        (t: any) => t === teacherID || t?.id === teacherID
        );
    }

    return false;
}
