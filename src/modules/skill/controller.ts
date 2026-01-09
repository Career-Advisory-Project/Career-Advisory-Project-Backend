import { Elysia,t } from "elysia";
import { CourseSkillModel } from "../skill/model";
import { CourseSkillService } from "../skill/service";

export const courseSkillController = new Elysia({ prefix: "/courseskills" })
    .post("/", async ({ body, set }) => {
        try {
            return await CourseSkillService.createSnapshot(body.courseId, body.skillSelections);
        } catch (error: any) {
            set.status = 400;
            return { error: error.message };
        }
    }, {
        body: CourseSkillModel.CreateCourseSkillRequest
    })
    .get("/", async () => {
        return await CourseSkillService.getAll();
    })

    // GET a single course skill by ID
    .get("/:id", async ({ params: { id }, set }) => {
        try {
            return await CourseSkillService.getById(id);
        } catch (error: any) {
            set.status = 404;
            return { error: error.message };
        }
    }, {
        params: t.Object({ id: t.String() })
    })

    // POST remains the same...
    .post("/", async ({ body, set }) => {
        try {
            return await CourseSkillService.createSnapshot(body.courseId, body.skillSelections);
        } catch (error: any) {
            set.status = 400;
            return { error: error.message };
        }
    }, {
        body: CourseSkillModel.CreateCourseSkillRequest
    })

    .patch("/:id", async ({ params: { id }, body, set }) => {
        try {
            return await CourseSkillService.update(id, body);
        } catch (error: any) {
            set.status = 400;
            return { error: error.message };
        }
    }, {
        params: t.Object({ id: t.String() }),
        body: CourseSkillModel.UpdateCourseSkill // From model.ts
    })

    .patch("/:id/skills/:skillId/rubrics", async ({ params: { id, skillId }, body, set }) => {
        try {
            return await CourseSkillService.updateSkillRubrics(id, skillId, body.selectedRubricLevels);
        } catch (error: any) {
            set.status = 400;
            return { error: error.message };
        }
    }, {
        params: t.Object({
            id: t.String(),
            skillId: t.String()
        }),
        body: t.Object({
            selectedRubricLevels: t.Array(t.Integer())
        })
    })

    .delete("/:id", async ({ params: { id }, set }) => {
        try {
            await CourseSkillService.delete(id);
            return { message: "Deleted successfully" };
        } catch (error: any) {
            set.status = 404;
            return { error: error.message };
        }
    }, {
        params: t.Object({ id: t.String() })
    })

    .delete("/:id/skills/:skillId", async ({ params: { id, skillId }, set }) => {
        try {
            return await CourseSkillService.removeSkillFromCourse(id, skillId);
        } catch (error: any) {
            set.status = 400;
            return { error: error.message };
        }
    }, {
        params: t.Object({
            id: t.String(),
            skillId: t.String() 
        })
    });