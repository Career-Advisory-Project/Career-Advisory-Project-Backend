import { Elysia, t } from "elysia";
import { listCurriculums } from "./services/getListCurriculums";
import { getRequiredCourseList } from "./services/getRequiredCourseList";
import { getSkillList } from "./services/getSkillList";
import { addCoursesToCurriculum } from "./services/addCourseToCurr";
import prisma from "../../db";
import { delCoursesFromCurriculum } from "./services/delCourseFromCurr";
import { curriculumYearExists } from "./model";

export const curriculumModule = new Elysia({ prefix: "/admin" })
  .get("/curriculum", async () => {
    return await listCurriculums();
  })

  .get("/curriculum/:program/:curriculum_year/courses", async ({ params, set }) => {
    const program = String(params.program).toUpperCase();
    if (program !== "CPE" && program !== "ISNE") {
        set.status = 400;
        return { message: "Invalid program" };
    }

    const curriculumYear = Number(params.curriculum_year);
    if (!Number.isFinite(curriculumYear)) {
      set.status = 400;
      return { message: "Invalid curriculum_year" };
    }

    const exists = await curriculumYearExists(program, curriculumYear);
    if (!exists) {
      set.status = 404;
      return { message: "Curriculum not found" };
    }

    return await getRequiredCourseList(program, curriculumYear);
  })

  .get("/curriculum/:program/:curriculum_year/skills", async ({ params, set }) => {
    const program = String(params.program).toUpperCase();
    if (program !== "CPE" && program !== "ISNE") {
        set.status = 400;
        return { message: "Invalid program" };
    }

    const curriculumYear = Number(params.curriculum_year);
    if (!Number.isFinite(curriculumYear)) {
      set.status = 400;
      return { message: "Invalid curriculum_year" };
    }

    const exists = await curriculumYearExists(program, curriculumYear);
    if (!exists) {
      set.status = 404;
      return { message: "Curriculum not found" };
    }

    return await getSkillList(program, curriculumYear);
  })

  .post("/curriculum/courses", async ({ body, set }) => {
    const curriculumYear = Number(body.curriculum_year);
    if (!Number.isFinite(curriculumYear)) {
      set.status = 400;
      return { message: "Invalid curriculum_year" };
    }

    const program = String(body.program).toUpperCase();
    if (program !== "CPE" && program !== "ISNE") {
      set.status = 400;
      return { message: "Invalid program" };
    }

    const exists = await curriculumYearExists(program, curriculumYear);
    if (!exists) {
      set.status = 404;
      return { message: "Curriculum not found" };
    }

    const courses = body.courses.map((c) => String(c).trim()).filter(Boolean);
    if (courses.length === 0) return { ok: true };

    const found = await prisma.course.findMany({
        where: { courseNo: { in: courses } },
        select: { courseNo: true },
    });

    const foundSet = new Set(found.map((x) => String(x.courseNo)));
    const unknown = courses.filter((c) => !foundSet.has(c));

    if (unknown.length > 0) {
        set.status = 400;
            return {
            message: "Unknown courseNo",
            unknown_courses: unknown,
        };
    } 

    await addCoursesToCurriculum(program, curriculumYear, courses);
    return { ok: true };
  },
  {
    body: t.Object({
        curriculum_year: t.String(),
        program: t.String(),
        courses: t.Array(t.String()),
    }),
  })

  .delete("/curriculum/courses", async ({ body, set }) => {
    const curriculumYear = Number(body.curriculum_year);
    if (!Number.isFinite(curriculumYear)) {
        set.status = 400;
        return { message: "Invalid curriculum_year" };
    }

    const program = String(body.program).toUpperCase();
    if (program !== "CPE" && program !== "ISNE") {
        set.status = 400;
        return { message: "Invalid program" };
    }

    const exists = await curriculumYearExists(program, curriculumYear);
    if (!exists) {
      set.status = 404;
      return { message: "Curriculum not found" };
    }

    const courses = body.courses.map((c) => String(c).trim()).filter(Boolean);
    if (courses.length === 0) return { ok: true };

    // validate: courseNo must exist in Course collection
    const found = await prisma.course.findMany({
        where: { courseNo: { in: courses } },
        select: { courseNo: true },
    });

    const foundSet = new Set(found.map((x) => String(x.courseNo)));
    const unknown = courses.filter((c) => !foundSet.has(c));

    if (unknown.length > 0) {
        set.status = 400;
        return {
          message: "Unknown courseNo",
          unknown_courses: unknown,
        };
    }

    await delCoursesFromCurriculum(program, curriculumYear, courses);
    return { ok: true };
  },
  {
    body: t.Object({
        curriculum_year: t.String(),
        program: t.String(),
        courses: t.Array(t.String()),
    }),
  });