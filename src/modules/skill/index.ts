import { Elysia } from "elysia";
import prisma from "../../db";
import { swagger } from "@elysiajs/swagger";

const app = new Elysia()
  .get("/courses", async () => {
    const courses = await prisma.course.findMany({
      select: { id: true, name: true },
    });
    return courses;
  })

  .get("/course/:id", async ({ params }) => {
    const course = await prisma.course.findUnique({
      where: { id: params.id.trim() },
      select: { id: true, name: true },
    });
    return course;
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

  // Detach a skill from a course (set courseId to null)
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


  .get("/course/:id/skills", async ({ params }) => {
    return prisma.course.findUnique({
      where: { id: params.id.trim() },
      include: {
        skills: {
          select: { name: true, descTH: true, descENG: true, rubrics: true },
        },
      },
    });
  })

  .use(swagger())
  .listen(3002);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
