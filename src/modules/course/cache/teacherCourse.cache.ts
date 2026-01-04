import { TeacherCourseCache } from './types';

const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const cache = new Map<string, TeacherCourseCache>();

export function getFromCache(id: string): TeacherCourseCache | undefined {
    const entry = cache.get(id);
    if (!entry) return undefined;

    if (Date.now() - entry.updatedAt > TTL_MS) {
        cache.delete(id);
        return undefined;
    }

    return entry;
}

export function setProcessing(id: string) {
    cache.set(id, {
        status: 'processing',
        updatedAt: Date.now(),
    });
}

export function setDone(id: string, data: any) {
    cache.set(id, {
        status: 'done',
        data,
        updatedAt: Date.now(),
    });
}

export function setError(id: string, error: string) {
    cache.set(id, {
        status: 'error',
        error,
        updatedAt: Date.now(),
    });
}
