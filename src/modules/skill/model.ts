import { t } from "elysia";

export namespace CourseSkillModel {

    export const Rubric = t.Object({
        level: t.Integer(),
        descTH: t.Optional(t.String()),
        descENG: t.Optional(t.String()),
    });

    export const RubricData = t.Object({
        level: t.Integer(),
        descTH: t.Optional(t.String()),
        descENG: t.Optional(t.String()),
    });

    export const SkillData = t.Object({
        id: t.String(), 
        name: t.String(),
        descTH: t.Optional(t.String()),
        descENG: t.Optional(t.String()),
        tag: t.Array(t.String()),
        rubrics: t.Array(RubricData),
    });

    export const Course = t.Object({
        id: t.String(),
        updatedAt: t.Date(),
        createdAt: t.Date(),
        courseNo: t.String(),
        name: t.String(),
        descTH: t.Optional(t.Nullable(t.String())),
        descENG: t.Optional(t.Nullable(t.String())),
    });

    export const Tag = t.Object({
        id: t.String(),
        updatedAt: t.Date(),
        createdAt: t.Date(),
        name: t.String(),
        abbr: t.Optional(t.Nullable(t.String())),
        tagGroupId: t.Optional(t.Nullable(t.String())),
        skillId: t.Optional(t.Nullable(t.String())),
    });

    export const TagGroup = t.Object({
        id: t.String(),
        updatedAt: t.Date(),
        createdAt: t.Date(),
        name: t.String(),
        color: t.Optional(t.Nullable(t.String())),
    });

    export const Skill = t.Object({
        id: t.String(),
        createdAt: t.Date(),
        updatedAt: t.Date(),
        name: t.String(),
        descTH: t.Optional(t.Nullable(t.String())),
        descENG: t.Optional(t.Nullable(t.String())),
        status: t.String(),
        rubrics: t.Array(Rubric),
    });

    export const CourseSkill = t.Object({
        id: t.String(),
        updatedAt: t.Date(),
        createdAt: t.Date(),
        courseNo: t.String(),
        name: t.String(),
        descTH: t.Optional(t.Nullable(t.String())),
        descENG: t.Optional(t.Nullable(t.String())),
        skills: t.Array(SkillData),
    });

    export const CreateCourseSkill = t.Omit(CourseSkill, ['id', 'createdAt', 'updatedAt']);
    
    export const UpdateCourseSkill = t.Partial(CreateCourseSkill);

    export const CreateCourseSkillRequest = t.Object({
    courseId: t.String(),
    skillSelections: t.Array(t.Object({
        skillId: t.String(),
        selectedRubricLevels: t.Array(t.Integer()) 
    }))
});
}