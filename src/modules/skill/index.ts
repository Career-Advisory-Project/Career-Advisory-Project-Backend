import { Elysia , t} from "elysia";
import prisma from "../../db";
import { swagger } from "@elysiajs/swagger";

const app = new Elysia()
  .get("/courses", async () => {
    const courses = await prisma.course.findMany({
      select: { id: true, name: true },
    });
    return courses;
  })

  .get("/course/:courseId", async ({ params }) => {
    const course = await prisma.course.findUnique({
      where: { id: params.courseId.trim() },
      select: { id: true, name: true },
    });
    return course;
  })

.get("/course/:courseId/skills", async ({ params, query }) => {
  const courseId = params.courseId.trim();

  let levelMap: Record<string, number> | undefined;
  const levelsRaw = (query as any)?.levels;
  if (levelsRaw) {
    try {
      levelMap = JSON.parse(levelsRaw);
    } catch {
      return new Response(JSON.stringify({ error: "levels must be valid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      name: true,
      skills: {
        select: { id: true, name: true, descTH: true, descENG: true, rubrics: true },
      },
    },
  });

  if (!course) {
    return new Response(JSON.stringify({ error: "Course not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const skills = course.skills.map((s) => {
    const rubrics = (s.rubrics || []) as any[];
    const targetLevel = levelMap?.[s.id];

    if (targetLevel === undefined) {
      return { ...s, rubrics: [] };
    }

    const chosen = rubrics.find((r) => r.level === Number(targetLevel));
    return { ...s, rubrics: chosen ? [chosen] : [] };
  });

  return { ...course, skills };
})
//http://localhost:3002/course/688b6c96d4ea26aaa01b9fd8/skills?levels={"677be05bcdd3728d72efee02":4,"677be1d3cdd3728d72efee06":2}

  .get("/course/:courseId/skill/:skillId", async ({ params }) => {
    const skill = await prisma.skill.findUnique({
      where: { id: params.skillId.trim() },
      select: { id: true, name: true, descTH: true, descENG: true },
    });
    return skill;
  })

  .get("/course/:courseId/skill/:skillId/rubrics", async ({ params }) => {
    const skill = await prisma.skill.findUnique({
      where: { id: params.skillId.trim() },
      select: { rubrics: true },
    });
    if (!skill) {
      return new Response(JSON.stringify({ error: "Skill not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return skill.rubrics;
  })  

  .get("/skills", async () => {
    const skills = await prisma.skill.findMany({
      select: { name: true, descTH: true, descENG: true },
    });
    return skills;
  })

  .get("/skill/:id", async ({ params }) => {
    const skill = await prisma.skill.findUnique({
      where: { id: params.id.trim() },
      select: { name: true, descTH: true, descENG: true,
        tag: {
          select: { name: true}
        }
       },
    });
    if (!skill) {
      return new Response(JSON.stringify({ error: "Skill not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return skill;
  })

  .get("/tags", async () => {
    const tags = await prisma.tag.findMany({
      select: { name: true, abbr: true },
    });
    return tags;
  })

  .get("/skill/:id/rubrics", async ({ params }) => {
    const skill = await prisma.skill.findUnique({
      where: { id: params.id.trim() },
      select: { rubrics: true },
    });
    if (!skill) { 
      return new Response(JSON.stringify({ error: "Skill not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return skill.rubrics;
  })


  // Create standalone skill (not attached to any course)
  .post("/skill", async (context) => {
    const body = (context as any).body || {};

    const allowed = ["name", "descTH", "descENG"];
    const extra = Object.keys(body).filter((k) => !allowed.includes(k));
    if (extra.length > 0) {
      return new Response(
        JSON.stringify({ error: "Only name, descTH and descENG are allowed" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const s = await prisma.skill.create({
      data: {
        name: body.name,
        descTH: body.descTH,
        descENG: body.descENG,
        status: body.status || "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      select: { name: true, descTH: true, descENG: true },
    });
    return s;
  })

  .post("/course/:courseId/skill", async (context) => {
    const { params } = context as { params: { courseId: string } };
    const body = (context as any).body || {};

    const allowed = ["name", "descTH", "descENG"];
    const extra = Object.keys(body).filter((k) => !allowed.includes(k));
    if (extra.length > 0) {
      return new Response(
        JSON.stringify({ error: "Only name, descTH and descENG are allowed" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const s = await prisma.skill.create({
      data: {
        name: body.name,
        descTH: body.descTH,
        descENG: body.descENG,
        status: body.status || "active",
        createdAt: new Date(),
        updatedAt: new Date(),
        course: { connect: { id: params.courseId } },
      },
      select: { name: true, descTH: true, descENG: true, rubrics: true },
    });
    return s;
  })

  .post("/skill/:skillId/tag/:tagId", async ({ params }) => {
    const updated = await prisma.tag.update({
      where: { id: params.tagId.trim() },
      data: { skillId: params.skillId.trim() },
      select: { name: true},
    });
    return updated;
  })

  .post("/course/:courseId/skill/:skillId", async ({ params }) => {
    const updated = await prisma.skill.update({
      where: { id: params.skillId.trim() },
      data: { courseId: params.courseId.trim() },
      select: { name: true, descTH: true, descENG: true, rubrics: true },
    });
    return updated;
  })

  .post("/course/:courseId/skill/:skillId/rubrics", async (context) => {
    const { params } = context as { params: { courseId: string; skillId: string } };
    const body = (context as any).body || {};
    const skill = await prisma.skill.findUnique({
      where: { id: params.skillId.trim() },
      select: { rubrics: true },
    });
    if (!skill) {
      return new Response(JSON.stringify({ error: "Skill not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    const newRubric = {
      level: body.level,
      descTH: body.descTH,
      descENG: body.descENG,
    };
    const updatedRubrics = [...(skill.rubrics || []), newRubric];
    const updated = await prisma.skill.update({
      where: { id: params.skillId.trim() },
      data: { rubrics: updatedRubrics },
      select: { name: true, rubrics: true },
    });
    return updated;
  })

  .delete("/course/:courseId/skill/:skillId", async ({ params }) => {
    const skill = await prisma.skill.findUnique({
      where: { id: params.skillId.trim() },
    });
    if (!skill) {
      return new Response(JSON.stringify({ error: "Skill not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (skill.courseId !== params.courseId.trim()) {
      return new Response(
        JSON.stringify({ error: "Skill is not attached to this course" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const updated = await prisma.skill.update({
      where: { id: params.skillId.trim() },
      data: { courseId: null },
      select: { name: true, descTH: true, descENG: true },
    });
    return updated;
  })

  //Delete a skill
  .delete("/skill/:id", async ({ params }) => {
    try {
      const deleted = await prisma.skill.delete({
        where: { id: params.id.trim() },
        select: { name: true, descTH: true, descENG: true },
      });
      return deleted;
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Skill not found or could not be deleted" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
  })

  .delete("/course/:courseId/skill/:skillId/rubric/:level", async ({ params }) => {
    const skill = await prisma.skill.findUnique({
      where: { id: params.skillId.trim() },
      select: { rubrics: true },
    });
    if (!skill) {
      return new Response(JSON.stringify({ error: "Skill not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    const updatedRubrics = skill.rubrics.filter((r) => r.level !== parseInt(params.level));
    const updated = await prisma.skill.update({
      where: { id: params.skillId.trim() },
      data: { rubrics: updatedRubrics },
      select: { name: true, rubrics: true },
    });
    return updated;
  })


  .use(swagger())
  .listen(3002);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
