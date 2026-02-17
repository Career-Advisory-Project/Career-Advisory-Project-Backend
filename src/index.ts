import { Elysia } from "elysia";
import { courseRoute } from './modules/course';
import { swagger } from '@elysiajs/swagger'
import { auth } from "./modules/auth";
import  {validateUser}  from "./modules/validator";
import cors from "@elysiajs/cors";
import { courseSkillController } from "./modules/skill/controller";
import { dashboardRoute } from "./modules/dashboard";
const app = new Elysia()
  .use(swagger())
  .use(cors({
  origin:true,
  credentials:true,
  allowedHeaders: ['Content-Type', 'Authorization']
  }))
  .use(auth)
  // .onBeforeHandle (validateUser)
  .use(dashboardRoute)
  .use(courseRoute)
  .use(courseSkillController)
  .get("/hi",()=>{
    return "hello"
  })
  .listen(3000);


console.log(`Test login url: ${process.env.CMU_ENTRAID_URL}`)
console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);