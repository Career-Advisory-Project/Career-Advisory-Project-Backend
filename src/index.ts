import { Elysia } from "elysia";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient();



const app = new Elysia().get("/", async() => {
  const course = await prisma.course.findMany();
  return course;
}).listen(3000);


console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);