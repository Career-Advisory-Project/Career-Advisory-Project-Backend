import { Elysia } from "elysia";
import { courseModule } from './modules/course';
import { swagger } from '@elysiajs/swagger'

const app = new Elysia()
    .use(swagger())
    .use(courseModule)
    .listen(3000);

// for test that the server is still working ka
app.get('/ping', () => 'pong');

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);