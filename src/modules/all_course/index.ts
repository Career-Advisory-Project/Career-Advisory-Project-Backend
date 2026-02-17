import Elysia, { status } from "elysia";
import { AllCourse } from "./service";
export const allCourse = new Elysia({prefix:"/all_course"})
.get("/",async ()=>{
    const data = await AllCourse.getAllCourse();
    if(data){
        return {
            courses:data
        }
    }
    else{
        return status(500,"Internal Server Error")
    }
})
.get("/:courseNo", async ({params:{courseNo}})=>{
    const data = await AllCourse.getCourseByCourseNo(courseNo);
    if(data){
        return{
            course:data
        };
    }
    else{
        return status(500,"Internal Server Error");
    }
})