import { Elysia, t } from 'elysia';
import { getTeacherCourse } from './service';
import { courseSearch } from "./search"

export const courseRoute = new Elysia({ prefix: '/course' })
    .get(
        '/:teacherID',
        async ({ params }) => {
            const { teacherID } = params;
            return await getTeacherCourse(teacherID);
        },
        {
            params: t.Object({
                teacherID: t.String(),
            }),
        }
    )
    .use(courseSearch)