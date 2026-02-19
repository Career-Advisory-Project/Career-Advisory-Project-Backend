import { Elysia, t } from "elysia";
import { CourseSkillModel } from "../skill/model";
import { CourseSkillService } from "../skill/service";

export const courseSkillController = new Elysia({ prefix: "/courseskills" })
  .post(
    "/",
    async ({ body, set }) => {
      try {
        return await CourseSkillService.createCourseSkill(
          body.courseNo,
          body.skillID,
          body.rubrics
        );
      } catch (error: any) {
        set.status = 400;
        return { error: error.message };
      }
    },
    {
      body: CourseSkillModel.CreateCourseSkillRequest,
    }
  )
  .get("/", async () => {
    return await CourseSkillService.getAll();
  })

  // GET a single course skill by ID
  .get(
    "/:courseNo",
    async ({ params: { courseNo }, set }) => {
      console.log("Hello")
      try {
        return await CourseSkillService.getByCourseNo(courseNo);
      } catch (error: any) {
        set.status = 404;
        return { error: error.message };
      }
    },
    {
      params: t.Object({ courseNo: t.String() }),
    }
  )

  .patch(
  "/",
  async ({ body, set }) => {
    try {
      return await CourseSkillService.updateCourseSkillRubrics(
        body.courseNo,
        body.skillID,
        body.rubrics
      );
    } catch (error: any) {
      set.status = 400;
      return { error: error.message };
    }
  },
  {
    body: CourseSkillModel.UpdateCourseSkillRubrics,
  }
)


  .delete(
    "/:id",
    async ({ params: { id }, set }) => {
      try {
        await CourseSkillService.delete(id);
        return { message: "Deleted successfully" };
      } catch (error: any) {
        set.status = 404;
        return { error: error.message };
      }
    },
    {
      params: t.Object({ id: t.String() }),
    }
  )

.delete(
  "/delete",
  async ({ body, set }) => {
    try {
      return await CourseSkillService.removeSkillFromCourse(
        body.courseNo,
        body.skillID
      );
    } catch (error: any) {
      set.status = 400;
      return { error: error.message };
    }
  },
  {
      body: CourseSkillModel.RemoveSkillInCourse,
  }
)
;
