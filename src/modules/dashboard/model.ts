import Elysia from "elysia";
import { t } from "elysia";
export namespace DashboardModel {
    export const  dashboardData = t.Object({
        
    })

    export const courseSchema = t.Object({
        courseId : t.String(),
        courseName: t.String(),
        credit: t.Number()
    })

    export const courseList = t.Array(courseSchema)

    export type courseListType = typeof courseList.static;
}