import { Elysia } from "elysia";
import { courseRoute } from './modules/course';
import { swagger } from '@elysiajs/swagger'
import { auth } from "./modules/auth";
import { allCourse } from "./modules/all_course";
import { validateUser } from "./modules/validator";
import cors from "@elysiajs/cors";
import { courseSkillController } from "./modules/skill/controller";
import { curriculumModule } from "./modules/curriculum";
import { dashboardRoute } from "./modules/dashboard";
import { UserManagerRoute } from "./modules/allowList";
import { pino } from "pino";
import { profile } from "bun:jsc";

const logger = pino({
  level: 'info',

})

const app = new Elysia()
  .use(swagger())
  .state({               // ← define the global store
    profile: 0,          // any type you like
    config: { debug: true }
  })
  .use(cors({
    origin: true,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  }))
  .onAfterResponse(({ request, set, responseValue }) => {
    const { method, url, headers } = request
    const { status, headers: resHeaders } = set
    logger.info({
      method,
      url,
      status,
      response: responseValue,
    })
  })
  .use(auth)
  .onBeforeHandle(validateUser)
  .use(UserManagerRoute)
  .use(allCourse)
  .use(dashboardRoute)
  .use(courseRoute)
  .use(courseSkillController)
  .use(curriculumModule)
  .listen({
    port: 3000,
    hostname: '0.0.0.0'
  });


console.log(`Test login url: ${process.env.CMU_ENTRAID_URL}`)
console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);