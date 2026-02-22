import { t } from "elysia";
export namespace DashboardModel {
    export class CourseNotFoundError extends Error{
        public NotFoundList:string[]
        
        constructor(message:string,NotFoundList:string[]){
            super(message)
            this.NotFoundList = NotFoundList
        }
    }
    
    export const courseSchema = t.Object({
        courseNo: t.String(),
        name: t.String(),
        // credit: t.Number()
    })

    export const courseList = t.Array(courseSchema)

    export const dashboardData = t.Object({
        cmuitaccount: t.String(),
        finishedCourses: t.Object(courseList),
        unfinishedCoures: t.Object(courseList)
    })
    export const courseBodyParam = t.Object({
        cmuitaccount: t.String(),
        courseNoList: t.Array(t.String())
    })
    
    export type courseBodyParamType = typeof courseBodyParam.static;
    export type courseSchemaType = typeof courseSchema.static;
    export type courseListType = typeof courseList.static;
    export type dashboardDataType = typeof dashboardData.static;
}