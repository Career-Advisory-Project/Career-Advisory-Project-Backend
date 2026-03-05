import axios from "axios";
import { cmuApi } from "../../utils/cmuApi";
const cpeApiUrl = process.env.CPE_API_URL ?? "";
const token = process.env.CPE_API_TOKEN;



export class AllCourse {
    static async getAllCourse() {
        try {
            const response = await cmuApi.get('/course/detail');
            const data = response.data;
            const courseDetails = data.courseDetails
            const dataToReturn = courseDetails?.map((courseDetail: any) => {
                return {
                    courseNo: courseDetail.courseNo,
                    name: courseDetail.courseNameEN,
                    descTH: courseDetail.detailTH,
                    descENG: courseDetail.detailEN,
                    credit: courseDetail.credits.credits,
                    hasCourse: false
                }
            })
            return dataToReturn;
        } catch (error) {
            console.error("Error fetching courses:", error);
            return null;
        }
    }

    static async getCourseByCourseNo(courseNo: string) {
        try {
            const response = await cmuApi.get(`/course/detail/`, {
                params: {

                    courseNo: courseNo

                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching course ${courseNo}:`, error);
            return null;
        }
    }
}