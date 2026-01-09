import { Elysia, t } from 'elysia';
import { getTeacherCourse } from './service';

export const courseRoute = new Elysia({ prefix: '/course' })
    .get(
        '/:teacherID',
        async ({ params, set }) => {
            const { teacherID } = params;
            const result = await getTeacherCourse(teacherID);
            
            if (!result.ok) {
                set.status = 404;
                return result;
            }
            return result;
        },
        {
            params: t.Object({
                teacherID: t.String(),
            }),
        }
  );
