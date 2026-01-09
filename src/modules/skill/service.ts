import prisma from "../../db";



export const CourseSkillService = {
    async getAll() {
        return await prisma.courseSkill.findMany({
            orderBy: { createdAt: 'desc' }
        });
    },

    async getById(id: string) {
        const record = await prisma.courseSkill.findUnique({
            where: { id }
        });
        if (!record) throw new Error("CourseSkill record not found");
        return record;
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

    async createSnapshot(courseId: string, skillSelections: { skillId: string, selectedRubricLevels: number[] }[]) {

        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) throw new Error("Course not found");


        const skillDataList = await Promise.all(
            skillSelections.map(async (selection) => {
                const skill = await prisma.skill.findUnique({
                    where: { id: selection.skillId },
                    include: { tag: true }
                });

                if (!skill) return null;

                return {
                    id: skill.id,
                    name: skill.name,
                    descTH: skill.descTH,
                    descENG: skill.descENG,
                    tag: skill.tag.map((t: any) => t.name),
                    rubrics: skill.rubrics.filter((r: any) => 
                        selection.selectedRubricLevels.includes(r.level)
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

                    skills: currentSkills
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
    }
};