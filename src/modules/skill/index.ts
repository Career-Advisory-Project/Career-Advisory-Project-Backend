// import { Elysia , t} from "elysia";
// import prisma from "../../db";
// import { swagger } from "@elysiajs/swagger";
// import { courseSkillController } from "../skill/controller";


// const app = new Elysia()
//     .use(courseSkillController)
//     .use(swagger())
//     .listen(3002);

// console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

// process.on("uncaughtException", (err) => {
//   console.error("uncaughtException:", err);
// });
// process.on("unhandledRejection", (reason) => {
//   console.error("unhandledRejection:", reason);
// });

import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";
import { courseSkillController } from "../skill/controller";

const app = new Elysia()
  .use(cors({ origin: true }))
  .use(courseSkillController)
  .use(
    swagger({
      provider: "swagger-ui",     // ✅ เปลี่ยนตรงนี้
      path: "/swagger",
      documentation: {
        servers: [{ url: "http://localhost:3002" }],
      },
    })
  )
  .listen(3002);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
