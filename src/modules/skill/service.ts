import prisma from "../../db";

export const CourseSkillService = {
    async getAll() {
        return await prisma.courseSkill.findMany({
            orderBy: { createdAt: 'desc' }
        });
    },
    async getAllSkill() {
      return await prisma.skill.findMany();
    },
async getMaxLevel(courseNolist: string[]) {
  const courses = await prisma.courseSkill.findMany({
    where: {
      courseNo: {
        in: courseNolist
      }
    }
  });

  if (!courses.length) {
    throw new Error("No courses found");
  }

  const skillMap = new Map<string, any>();

  for (const course of courses) {
    for (const skill of course.skills || []) {

      if (!skillMap.has(skill.id)) {
        skillMap.set(skill.id, {
          skillID: skill.id,
          skillName: skill.name,
          levels: []
        });
      }

      const entry = skillMap.get(skill.id);

      for (const rubric of skill.rubrics || []) {
        entry.levels.push(Number(rubric.level));
      }
    }
  }

  const result = Array.from(skillMap.values()).map((skill) => {
    const maxLevel =
      skill.levels.length > 0
        ? Math.max(...skill.levels)
        : 0;

    return {
      skillID: skill.skillID,
      skillName: skill.skillName,
      maxLevel
    };
  });

  return result;
}
,

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

    async createCourseSkill(
  courseNo: string,
  skillID: string,
  rubrics: { grade: string; level: number }[]
) {
  const skill = await prisma.skill.findUnique({
    where: { id: skillID }
  });

  if (!skill) {
    throw new Error("Skill not found");
  }


  const rubricData = rubrics.map((input) => {
    const matched = skill.rubrics.find(
      (r: { level: number; }) => r.level === input.level
    );

    if (!matched) {
      throw new Error(`Level ${input.level} not found in skill rubric`);
    }

    return {
      grade: input.grade,
      level: input.level,
      descTH: matched.descTH,
      descENG: matched.descENG
    };
  });

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
      (s: any) => s.id === skillID
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
    (    s: { id: string; }) => s.id === skillID
  );

  if (!skillExists) {
    throw new Error("Skill not found in this course");
  }
  const updatedSkills = existing.skills.filter(
    (    s: { id: string; }) => s.id !== skillID
  );
  return await prisma.courseSkill.update({
    where: { id: existing.id },
    data: {
      skills: updatedSkills
    }
  });
}
,

  async updateCourseSkillRubrics(
  courseNo: string,
  skillID: string,
  rubrics: { grade: string; level: number }[]
) {
  const course = await prisma.courseSkill.findFirst({
    where: { courseNo }
  });

  if (!course) throw new Error("Course not found");

  const skillIndex = course.skills.findIndex(
    (s: any) => s.id === skillID
  );

  if (skillIndex === -1) {
    throw new Error("Skill not found in this course");
  }

  const targetSkill = course.skills[skillIndex];

  const updatedRubrics = targetSkill.rubrics.map((r: any) => {
    const match = rubrics.find(
      (input) => input.grade === r.grade
    );

    if (!match) return r; 

    return {
      ...r,
      level: Number(match.level)
    };
  });

  const updatedSkills = [...course.skills];
  updatedSkills[skillIndex] = {
    ...targetSkill,
    rubrics: updatedRubrics
  };

  return await prisma.courseSkill.update({
    where: { id: course.id },
    data: {
      skills: updatedSkills
    }
  });
}


};