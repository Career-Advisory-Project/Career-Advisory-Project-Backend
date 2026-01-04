import { getFromCache, setProcessing } from './cache/teacherCourse.cache';
import { scanTeacherCourse } from './scan/scanTeacherCourse';

export async function getTeacherCourse(teacherID: string) {
    const cached = getFromCache(teacherID);

    if (cached?.status === 'done') {
        return {
            ok: true,
            status: 'done',
            data: cached.data,
        };
    }

    if (cached?.status === 'processing') {
        return {
            ok: true,
            status: 'processing',
        };
    }

    if (cached?.status === 'error') {
        return {
            ok: false,
            status: 'error',
            message: cached.error,
        };
    }

    setProcessing(teacherID);
    scanTeacherCourse(teacherID);
    return { ok: true, status: 'processing' };
}
