import prisma from "../../db";

export const CourseSkillService = {
    async getAll() {
        return await prisma.courseSkill.findMany({
            orderBy: { createdAt: 'desc' }
        });
    },

  async getByCourseNo(courseNo: string) {

    const course = await prisma.course.findFirst({
      where: { courseNo }
    });

    if (!course) {
      throw new Error("Course record not found");
    }

    const courseSkill = await prisma.courseSkill.findFirst({
      where: { courseNo }
    });

    if (!courseSkill) {
      return {
        courseNo: course.courseNo,
        name: course.name,
        descTH: course.descTH,
        descENG: course.descENG,
        skills: [] as any[]
      };
    }
    return {
      ...courseSkill,
      skills: courseSkill.skills ?? []
    };
  },

    async update(id: string, data: any) {
        return await prisma.courseSkill.update({
            where: { id },
            data: data
        });
    },

    async delete(id: string) {
        return await prisma.courseSkill.delete({
            where: { id }
        });
    },

    async createCourseSkill(courseNo: string, skillID: string) {

  const skill = await prisma.skill.findUnique({
    where: { id: skillID }
  });

  if (!skill) {
    throw new Error("Skill not found");
  }


  const rubricData = skill.rubrics.map(r => ({
    grade: r.grade,
    level: r.level,
    descTH: r.descTH,
    descENG: r.descENG
  }));

  const skillData = {
    id: skill.id,
    name: skill.name,
    descTH: skill.descTH,
    descENG: skill.descENG,
    tag: skill.tag,
    rubrics: rubricData
  };


  const existing = await prisma.courseSkill.findFirst({
    where: { courseNo }
  });

  if (existing) {


    const alreadyExists = existing.skills.some(
      s => s.id === skillID
    );

    if (alreadyExists) {
      throw new Error("Skill already exists in this course");
    }


    return await prisma.courseSkill.update({
      where: { id: existing.id },
      data: {
        skills: {
          push: skillData
        }
      }
    });
  }


  return await prisma.courseSkill.create({
    data: {
      courseNo: courseNo,
      name: skill.name,
      descTH: skill.descTH,
      descENG: skill.descENG,
      skills: [skillData]
    }
  });
},


    async removeSkillFromCourse(courseNo: string, skillID: string) {
  const existing = await prisma.courseSkill.findFirst({
    where: { courseNo }
  });
  if (!existing) {
    throw new Error("Course not found");
  }

  const skillExists = existing.skills.some(
    s => s.id === skillID
  );

  if (!skillExists) {
    throw new Error("Skill not found in this course");
  }
  const updatedSkills = existing.skills.filter(
    s => s.id !== skillID
  );
  return await prisma.courseSkill.update({
    where: { id: existing.id },
    data: {
      skills: updatedSkills
    }
  });
}
,

    async updateCourseSkills(
  courseNo: string,
  skills: {
    id: string;
    name: string;
    descTH?: string;
    descENG?: string;
    tag: string[];
    rubrics: { grade: string, level: number; descTH?: string; descENG?: string }[];
  }[]
) {

  const course = await prisma.courseSkill.findFirst({ where: { courseNo: courseNo } });
  if (!course) throw new Error("Course not found");


  const normalized = skills.map((s) => ({
    id: s.id,          
    name: s.name,
    descTH: s.descTH,
    descENG: s.descENG,
    tag: s.tag,        
    rubrics: s.rubrics,
  }));

  const existing = await prisma.courseSkill.findFirst({
    where: { courseNo: course.courseNo },
  });

  if (!existing) {

    return await prisma.courseSkill.create({
      data: {
        courseNo: course.courseNo,
        name: course.name,
        descTH: course.descTH,
        descENG: course.descENG,
        skills: normalized,
      },
    });
  }

  const map = new Map<string, any>();
  for (const s of existing.skills) map.set(s.id, s);

  for (const s of normalized) map.set(s.id, s);

  const merged = Array.from(map.values());

  return await prisma.courseSkill.update({
    where: { id: existing.id },
    data: { skills: merged },
  });
},


};