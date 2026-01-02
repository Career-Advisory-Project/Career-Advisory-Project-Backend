import { Elysia } from "elysia";
import { auth } from "./modules/auth";
import { allCourse } from "./modules/alL_course";

const app = new Elysia().get("/", async() => {
  return "Hello Elysia";
})
.use(auth)
.use(allCourse)
.listen(3000);


console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);