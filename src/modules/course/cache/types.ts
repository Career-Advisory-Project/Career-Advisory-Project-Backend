export type CacheStatus = 'processing' | 'done' | 'error';

export interface TeacherCourseCache {
    status: CacheStatus;
    data?: any;
    error?: string;
    updatedAt: number;
}
