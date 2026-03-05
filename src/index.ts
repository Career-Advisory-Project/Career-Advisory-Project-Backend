import { Elysia } from "elysia";
import { courseRoute } from './modules/course';
import { swagger } from '@elysiajs/swagger'
import { auth } from "./modules/auth";
import { allCourse } from "./modules/all_course";
import { validateAdmin, validateUser } from "./modules/validator";
import cors from "@elysiajs/cors";
import { courseSkillController } from "./modules/skill/controller";
import { curriculumModule } from "./modules/curriculum";
import { dashboardRoute } from "./modules/dashboard";
import { UserManagerRoute } from "./modules/allowList";
import { pino } from "pino";
import { profile } from "bun:jsc";
import { AuthModel } from "./modules/auth/model";

const logger = pino({
  level: 'info',

})

export const app = new Elysia()
  .use(swagger())
  .state("auth",{profile:null as any})
  .use(cors({
    origin: true,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  }))
  .onAfterResponse(({path, request, set, responseValue ,store}) => {
    if (path.startsWith('/all_course')) {
      return;
    }
    const { profile } = store?.auth
    const cmuitaccount = profile?.cmuitaccount
    const { method, url, headers } = request
    const { status, headers: resHeaders } = set
    logger.info({
      cmuitaccount,
      method,
      url,
      status,
      response: responseValue,
    })
  })
  .use(auth)
  .onBeforeHandle(validateUser)
  .use(allCourse)
  .use(dashboardRoute)
  .use(courseRoute)
  .use(courseSkillController)
  .guard(
    { beforeHandle: validateAdmin },
    (app) => app
      .use(UserManagerRoute)
      .use(curriculumModule)
  )
  .listen(3000);


console.log(`Test login url: ${process.env.CMU_ENTRAID_URL}`)
console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);