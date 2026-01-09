import { Elysia , t} from "elysia";
import prisma from "../../db";
import { swagger } from "@elysiajs/swagger";
import { courseSkillController } from "../skill/controller";


const app = new Elysia()
    .use(courseSkillController)
    .use(swagger())
    .listen(3002);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
