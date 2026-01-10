import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";
import { courseSkillController } from "./modules/skill/controller";



const app = new Elysia().get("/", async() => {
    return "Hello Elysia"})
    .use(cors({ origin: true }))
    .use(courseSkillController)
    .use(
      swagger()
    )
  .listen(3000);



console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);