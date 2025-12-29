import { Elysia } from "elysia";
import prisma from "./db";



const app = new Elysia().get("/", async() => {
  const course = await prisma.course.findMany();
  return course;
}).listen(3000);


console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);