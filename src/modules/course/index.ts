import { Elysia, t } from 'elysia';
import { getTeacherCourseService } from './service';

export const courseModule = new Elysia({ prefix: '/course' })
  .get(
    '/:teacherID',
    async ({ params, query, set }) => {
      const data = await getTeacherCourseService(
        params.teacherID,
        query.courseID
      );

      if (!data) {
        set.status = 404;
        return { success: false, detail: 'teacher not found' };
      }

      return data;
    },
    {
      params: t.Object({ teacherID: t.String() }),
      query: t.Object({ courseID: t.Optional(t.String()) }),
    }
  );
