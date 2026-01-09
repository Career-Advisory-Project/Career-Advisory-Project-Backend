import { Elysia } from "elysia";
import { courseRoute } from './modules/course';
import { swagger } from '@elysiajs/swagger'

const app = new Elysia()
  .use(swagger())
  .use(courseRoute)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);