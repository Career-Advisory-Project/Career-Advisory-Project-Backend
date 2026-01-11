import { Elysia, t } from 'elysia';
import { getTeacherCourse } from './service';
import { status } from 'elysia';

export const courseRoute = new Elysia({ prefix: '/course' })
    .get(
        '/:teacherID',
        async ({ params, set }) => {
            const { teacherID } = params;
            return await getTeacherCourse(teacherID);
        },
        {
            params: t.Object({
                teacherID: t.String(),
            }),
        }
  );
