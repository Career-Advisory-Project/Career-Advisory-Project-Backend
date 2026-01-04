import { Elysia, t } from 'elysia';
import { getTeacherCourse } from './service';

export const courseModule = new Elysia({ prefix: '/course' })
    .get(
        '/:teacherID',
        async ({ params, set }) => {
            const result = await getTeacherCourse(params.teacherID);

            if (result?.status === 'processing') {
                set.status = 202;
                return result;
            }

            if (result?.ok === false) {
                set.status = 500;
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
