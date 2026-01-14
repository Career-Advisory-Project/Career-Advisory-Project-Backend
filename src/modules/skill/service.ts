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
      throw new Error("CourseSkill record not found");
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

    async createCourseSkill(courseNo: string, skillSelections: { skillId: string, selectedRubricLevels: number }[]) {

        const course = await prisma.course.findFirst({ where: { courseNo: courseNo } });
        if (!course) throw new Error("Course not found");


        const skillDataList = await Promise.all(
            skillSelections.map(async (selection) => {
                const skill = await prisma.skill.findUnique({
                    where: { id: selection.skillId },
                });

                if (!skill) return null;

                return {
                    id: skill.id,
                    name: skill.name,
                    descTH: skill.descTH,
                    descENG: skill.descENG,
                    tag: skill.tag,
                    rubrics: skill.rubrics.filter((r: any) => 
                        r.level === selection.selectedRubricLevels
                    )
                };
            })
        );

        const newSkills = skillDataList.filter((s): s is NonNullable<typeof s> => s !== null);


        const existingCourseSkill = await prisma.courseSkill.findFirst({
            where: { courseNo: course.courseNo }
        });

        if (existingCourseSkill) {

            const currentSkills = [...existingCourseSkill.skills];
            newSkills.forEach(newSkill => {
                const isDuplicate = currentSkills.some(s => s.id === newSkill.id);
                if (!isDuplicate) {
                    currentSkills.push(newSkill);
                }
            });

            return await prisma.courseSkill.update({
                where: { id: existingCourseSkill.id },
                data: {
                    skills: { set: currentSkills }
                }
            });
        } else {

            return await prisma.courseSkill.create({
                data: {
                    courseNo: course.courseNo,
                    name: course.name,
                    descTH: course.descTH,
                    descENG: course.descENG,
                    skills: newSkills
                }
            });
        }
    },

    async removeSkillFromCourse(courseSkillId: string, skillId: string) {
        const record = await prisma.courseSkill.findUnique({
            where: { id: courseSkillId }
        });

        if (!record) throw new Error("CourseSkill record not found");
        const updatedSkills = record.skills.filter(s => s.id !== skillId);
        return await prisma.courseSkill.update({
            where: { id: courseSkillId },
            data: {
                skills: { set: updatedSkills }
            }
        });
    },

    async updateSkillRubrics(courseNo: string, skillId: string, newRubricLevels: number) {
  const record = await prisma.courseSkill.findFirst({ where: { courseNo: courseNo } });
  if (!record) throw new Error("CourseSkill record not found");

  const masterSkill = await prisma.skill.findUnique({
    where: { id: skillId },
  });
  if (!masterSkill) throw new Error("Master Skill not found");

  const updatedRubricData = masterSkill.rubrics.filter((r: any) => r.level === newRubricLevels);
  if (updatedRubricData.length === 0) {
    throw new Error("No matching rubric levels found in master skill");
  }

  const updatedSkills = record.skills.map((skill) => {
    if (skill.id === skillId) return { ...skill, rubrics: updatedRubricData };
    return skill;
  });

  return await prisma.courseSkill.update({
    where: { id: record.id },
    data: {
      skills: { set: updatedSkills }
    }
  });
},

    async updateCourseSkills(
  courseNo: string,
  skills: {
    id: string;
    name: string;
    descTH?: string;
    descENG?: string;
    tag: string[];
    rubrics: { level: number; descTH?: string; descENG?: string }[];
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