import Elysia from "elysia"
import { Dashboard } from "./service"
export const dashboardRoute = new Elysia()
.get("/dashboard/:cmuitaccount",({params})=>{
    const accountEmail = params.cmuitaccount;
    const finishedCourses = Dashboard.getFinishedCourse(accountEmail) 
    const unfinishedCoures = Dashboard.getUnfinishedCourse(accountEmail)
})