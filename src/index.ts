import { Elysia } from "elysia";
import { courseRoute } from './modules/course';
import { swagger } from '@elysiajs/swagger'
import { auth } from "./modules/auth";
import { allCourse } from "./modules/alL_course";
import cors from "@elysiajs/cors";
import { courseSkillController } from "./modules/skill/controller";

const app = new Elysia().get("/", async() => {
  return "Hello Elysia"})
  .use(swagger(
    {
          provider: "swagger-ui",
      path: "/swagger",
      documentation: {
      servers: [{ url: "/" }],
      },
    }
  ))
  .use(cors({
  origin:true,
  credentials:true,
  allowedHeaders: ['Content-Type', 'Authorization']
  }))
  .use(courseRoute)
  .use(auth)
  .use(allCourse)
  .use(courseSkillController)

  .listen(3000);


console.log(`Test login url: ${process.env.CMU_ENTRAID_URL}`)
console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);