import { Elysia } from "elysia";
import { courseRoute } from './modules/course';
import { swagger } from '@elysiajs/swagger'
import { auth } from "./modules/auth";
import { allCourse } from "./modules/all_course";
import cors from "@elysiajs/cors";

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
  .use(allCourse)
  .listen(3000);

console.log(`Test login url: ${process.env.CMU_ENTRAID_URL}`)
console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);