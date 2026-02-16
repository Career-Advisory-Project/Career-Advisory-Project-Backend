import { Elysia } from "elysia";
import { listCurriculums } from "./services/listCurriculums";

export const curriculumModule = new Elysia({ prefix: "/admin" })
  .get("/curriculum", async ({ cookie, set , headers }) => {
    const cookieToken = cookie["cmu-entraid-example-token"]?.value;
    
    // i cant use cookie to test i dont know why wa
    const testToken =
        process.env.NODE_ENV !== "production" ? headers["x-dev-token"] : undefined;

    const token = cookieToken ?? testToken;
    if (!token) {
        set.status = 401;
        return { message: "Unauthorized" };
    }

    return await listCurriculums();
  });