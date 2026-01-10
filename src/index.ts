import { Elysia } from "elysia";
import { courseRoute } from './modules/course';
import { swagger } from '@elysiajs/swagger'
import { auth } from "./modules/auth";
<<<<<<< HEAD
=======
import { allCourse } from "./modules/alL_course";
>>>>>>> 33969c129fbc98da89e0f4ce9bc0b5a1b8a49012
import cors from "@elysiajs/cors";
import { courseSkillController } from "./modules/skill/controller";

const app = new Elysia().get("/", async() => {
  return "Hello Elysia"})
  .use(swagger())
  .use(cors({
  origin:true,
  credentials:true,
  allowedHeaders: ['Content-Type', 'Authorization']
  }))
  .use(courseRoute)
  .use(auth)
  .use(courseSkillController)

  .listen({
    port: 3000,
    hostname: '0.0.0.0' 
  });


console.log(`Test login url: ${process.env.CMU_ENTRAID_URL}`)
console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);