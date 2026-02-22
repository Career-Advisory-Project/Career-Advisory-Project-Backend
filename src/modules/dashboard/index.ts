import Elysia from "elysia"
import { Dashboard } from "./service"
import { DashboardModel } from "./model"
import { t } from "elysia"
export const dashboardRoute = new Elysia()
    .get("/dashboard/:cmuitaccount", async ({ params, set }) => {
        const accountEmail = params.cmuitaccount;
        const courses = await Dashboard.getDashboardCourse(accountEmail)
        if (!courses) {
            set.status = 404
            return "User not found"
        }
        console.log(courses)
        return {
            cmuitaccount: accountEmail,
            courses: courses,
        }
    })
    .post("/dashboard", async ({ body, set }) => {
        try {
            await Dashboard.addCourseToDashboard({ cmuitaccount: body.cmuitaccount, courseNoList: body.coursesNoList })
            set.status = 200;
            return {
                ok: true,
                message: "courses added to dashboard"
            }
        }
        catch (error: unknown) {
            if (error instanceof DashboardModel.CourseNotFoundError) {
                set.status = 404
                return {
                    ok: false,
                    message: "course not found: " + error.NotFoundList
                }
            }
            else if (error instanceof Error) {
                set.status = 400
                return {
                    ok: false,
                    message: error.message
                }
            }
            else {
                set.status = 500
                return {
                    ok: false,
                    message: "Internal server error"
                }
            }
        }

    }, {
        body: t.Object({
            cmuitaccount: t.String(),
            coursesNoList: t.Array(t.String())
        })
    })
    .delete("/dashboard", async ({ body, set }) => {
        try {
            const removedCourse = await Dashboard.removeCouseFromDashboard({ cmuitaccount: body.cmuitaccount, courseNoList: body.coursesNoList })
            const removeNoList = removedCourse?.map((item)=>{
                return item.courseNo
            })
            return{
                ok:true,
                message:"courses remain: " + removeNoList
            }
        }
        catch (error: unknown) {
            return {
                ok:false,
                message:"fail to remove course from dashboard"
            }
        }
    }, {
        body: t.Object({
            cmuitaccount: t.String(),
            coursesNoList: t.Array(t.String())
        })
    })