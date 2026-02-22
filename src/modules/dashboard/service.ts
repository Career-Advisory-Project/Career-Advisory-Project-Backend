import { Prisma } from "../../../generated/prisma/browser";
import prisma from "../../db";
import { DashboardModel } from "./model"


export class Dashboard {

    public static getDashboardCourse = async (cmuitaccount: string): Promise<DashboardModel.courseListType | null> => {
        const dashboardUser = await prisma.dashboard.findFirst({
            where: {
                cmuitaccount: cmuitaccount
            }
        })
        if (!dashboardUser) return null
        // console.log(dashboardUser.coursesNoList)
        return dashboardUser.coursesNoList
    }

    private static mergeAndRemoveDuplicates = (
        list1: DashboardModel.courseSchemaType[],
        list2: DashboardModel.courseSchemaType[]
    ): DashboardModel.courseSchemaType[] => {


        const uniqueMap = new Map<string, DashboardModel.courseSchemaType>();

        list1.forEach(item => {
            uniqueMap.set(item.courseNo, item);
        });


        list2.forEach(item => {
            uniqueMap.set(item.courseNo, item);
        });

        return Array.from(uniqueMap.values());
    }

    private static getDifference = (list1: string[], list2: string[]): string[] => {
        return list1.filter(item => !list2.includes(item));
    }
    private static getCourseListToAdd = async (courseData: DashboardModel.courseSchemaType[], courseNoList: string[]): Promise<DashboardModel.courseSchemaType[] | null> => {
        const existCourseItem = courseData
        const existCourseNoList = existCourseItem.map((item) => {
            return item.courseNo
        })
        const existCourseNoItems = courseData

        const courseToAdd = await prisma.course.findMany({
            where: {
                courseNo: {
                    in: courseNoList
                }
            }
        })
        if (courseNoList.length !== courseToAdd.length) {
            const courseToAddNo = courseToAdd.map((item) => {
                return item.courseNo
            });
            const courseNotFound = this.getDifference(courseNoList, courseToAddNo);
            const exception = new DashboardModel.CourseNotFoundError("Course not found", courseNotFound);
            throw exception;
        }
        const courseToAddData: DashboardModel.courseSchemaType[] = courseToAdd.map((courseItem) => {
            return {
                courseNo: courseItem.courseNo,
                name: courseItem.name
            }
        })
        this.mergeAndRemoveDuplicates(existCourseNoItems, courseToAddData)

        return this.mergeAndRemoveDuplicates(existCourseNoItems, courseToAddData)

    }
    public static addCourseToDashboard = async ({ cmuitaccount, courseNoList }: DashboardModel.courseBodyParamType) => {
        const userToFind = await prisma.dashboard.findFirst({
            where: {
                cmuitaccount: cmuitaccount
            }
        })

        if (userToFind) { // courseDashboard already exist

            try {
                const finalCourseList = await this.getCourseListToAdd(userToFind.coursesNoList, courseNoList)
                if (!finalCourseList) return
                const courseAdded = await prisma.dashboard.update({
                    where: {
                        cmuitaccount: cmuitaccount
                    },
                    data: {
                        cmuitaccount: cmuitaccount,
                        coursesNoList: finalCourseList
                    },
                })
            }
            catch (error: any) {
                throw error
            }
        }
        else {
            const courseToAdd = await prisma.course.findMany({
                where: {
                    courseNo: {
                        in: courseNoList
                    }
                }
            })
            const courseItemList: DashboardModel.courseSchemaType[] = courseToAdd.map((item) => {
                return {
                    courseNo: item.courseNo,
                    name: item.name
                }
            })

            await prisma.dashboard.create({
                data: {
                    cmuitaccount: cmuitaccount,
                    coursesNoList: courseItemList
                }
            })
        }
    }

    public static removeCouseFromDashboard = async ({ cmuitaccount, courseNoList }: DashboardModel.courseBodyParamType): Promise<DashboardModel.courseSchemaType[] | null> => {
        const updatedUser = await prisma.dashboard.update({
            where: {
                cmuitaccount: cmuitaccount,
            },
            data: {
                coursesNoList: {
                    deleteMany: {
                        where: {
                            courseNo: {
                                in:courseNoList
                            },
                        },
                    },
                },
            },
        });
        return updatedUser.coursesNoList;

    }

}