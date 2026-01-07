import { Elysia } from "elysia";
import { auth } from "./modules/auth";
import { allCourse } from "./modules/alL_course";
import {swagger} from '@elysiajs/swagger'
import cors from "@elysiajs/cors";
const app = new Elysia().get("/", async() => {
  return "Hello Elysia";
})
.use(cors({
  origin:true,
  credentials:true,
  allowedHeaders: ['Content-Type', 'Authorization']
}))
.use(auth)
.use(allCourse)
.use(swagger())
.listen(3000);

console.log(`Test login url: ${process.env.CMU_ENTRAID_URL}`)
console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);