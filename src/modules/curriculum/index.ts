import { Elysia } from "elysia";
import { listCurriculums } from "./services/getListCurriculums";
import { getRequiredCourseList } from "./services/getRequiredCourseList";

function requireAdminToken(cookie: any, headers: any) {
  const cookieToken = cookie["cmu-entraid-example-token"]?.value;

  const devToken =
    process.env.NODE_ENV !== "production"
      ? headers["x-dev-token"]
      : undefined;

  return cookieToken ?? devToken;
}

export const curriculumModule = new Elysia({ prefix: "/admin" })
  .get("/curriculum", async ({ cookie, set , headers }) => {
    const token = requireAdminToken(cookie, headers);
    if (!token) {
        set.status = 401;
        return { message: "Unauthorized" };
    }

    return await listCurriculums();
  })

  .get("/curriculum/:program/:curriculum_year/courses", async ({ params, cookie, headers, set }) => {
    const token = requireAdminToken(cookie, headers);
    if (!token) {
        set.status = 401;
        return { message: "Unauthorized" };
    }

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

    return await getRequiredCourseList(program, curriculumYear);
  });