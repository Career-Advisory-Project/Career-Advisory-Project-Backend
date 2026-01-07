import { Elysia } from "elysia";
import { auth } from "./modules/auth";
import { allCourse } from "./modules/alL_course";
import {swagger} from '@elysiajs/swagger'
const app = new Elysia().get("/", async() => {
  return "Hello Elysia";
})
.use(auth)
.use(allCourse)
.use(swagger())
.listen(3000);


console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);