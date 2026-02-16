import { Elysia } from "elysia";
import { courseRoute } from './modules/course';
import { swagger } from '@elysiajs/swagger'
import { auth } from "./modules/auth";
import  {validateUser}  from "./modules/validator";
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
  .use(auth)
  .onBeforeHandle(validateUser)
  .use(courseRoute)
  .use(courseSkillController)

  .listen({
    port: 3000,
    hostname: '0.0.0.0' 
  });


console.log(`Test login url: ${process.env.CMU_ENTRAID_URL}`)
console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);