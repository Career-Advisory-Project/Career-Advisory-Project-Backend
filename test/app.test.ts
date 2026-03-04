import { describe, it, expect } from 'bun:test'
import { treaty } from '@elysiajs/eden'
import { app } from '../src'

const api = treaty(app)

function toISOStringLoose(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return String(value);
}

function expectValidDate(value: unknown) {
  const s = toISOStringLoose(value);
  const d = new Date(s);
  expect(d.toString()).not.toBe("Invalid Date");
}

describe('Elysia routes', () => {
    it('GET /dashboard get dashboard course for teacher', async () => {
        const { data, error, status } = await api.dashboard({
            cmuitaccount: "yutthakarn_sajui@cmu.ac.th"
        }).get();
        expect(error).toBeNull();
        expect(data).toEqual({
            "cmuitaccount": "yutthakarn_sajui@cmu.ac.th",
            "courses": []
        });
    });

    it('GET /course/{teacherID} get courses for teacher', async () => {
        const { data, error, status } = await api.course({
            teacherID: "61a82ed2e1d2b69f983664f3"
        }).get()
        expect(status).toBe(200);
        // เช็คแกนหลักก่อน
        expect(data).toMatchObject({
            ok: true,
            id: "61a82ed2e1d2b69f983664f3",
            titleTH: "ผศ.",
            titleEN: "Asst. Prof.",
            firstNameTH: "โดม",
            firstNameEN: "Dome",
            lastNameTH: "โพธิกานนท์",
            lastNameEN: "Potikanond",
        });

        // updatedAt: string หรือ Date ก็ได้
        expectValidDate((data as any).updatedAt);

        // ==== courses check แบบปลอดภัย + debug ====
        const courses = (data as any)?.courses;

        // ถ้าไม่ใช่ array จะพิมพ์ data ทั้งก้อนให้ดูทันที
        if (!Array.isArray(courses)) {
            console.log("DEBUG: typeof courses =", typeof courses);
            console.log("DEBUG: courses value =", courses);
            console.log("DEBUG: full data =", data);
        }

        expect(Array.isArray(courses)).toBe(true);

        // OPTIONAL: ถ้ามีอย่างน้อย 1 ตัว ตรวจ shape คร่าว ๆ
        if (courses.length > 0) {
        expect(courses[0]).toMatchObject({
            courseNo: expect.any(String),
            name: expect.any(String),
        });
        }
    });

    it('GET /course/{teacherID} get courses for teacher', async () => {
        const { data, error, status } = await api.course({
            teacherID: "61a82ed2e1d2b69f983664fp"
        }).get()

        expect(status).toBe(404);
        expect(data).toBeNull();
        expect(error!.value).toEqual({
            ok: false,
            detail: "Teacher not found",
        });
    });

    it('POST /dashboard add new course to dashboard', async () => {
        const { data, error, status } = await api.dashboard.post({
            "cmuitaccount": "yutthakarn_sajui@cmu.ac.th",
            "coursesNoList": [
                "261200"
            ]
        });
        expect(error).toBeNull();
        expect(data).toEqual({
            "ok": true,
            "message": "courses added to dashboard"
        });
    });

    it('GET /dashboard get dashboard course for teacher', async () => {
        const { data, error, status } = await api.dashboard({
            cmuitaccount: "yutthakarn_sajui@cmu.ac.th"
        }).get();
        expect(error).toBeNull();
        expect(data).toEqual({
            "cmuitaccount": "yutthakarn_sajui@cmu.ac.th",
            "courses": [{
                courseNo: "261200",
                name: "Object-Oriented Programming"
            }]
        });
    });

    it('DELETE /dashboard delete added courses from dashboard', async () => {
        const { data, error, status } = await api.dashboard.delete({
            "cmuitaccount": "yutthakarn_sajui@cmu.ac.th",
            "coursesNoList": [
                "261200"
            ]
        });
        expect(error).toBeNull();
        expect(data).toEqual({
            "ok": true,
            "message": "courses remain: "
        });
    })

    it('GET /dashboard get dashboard course with invalid cmu email', async () => {
        const { data, error, status } = await api.dashboard({
            cmuitaccount: "gong555@gmail.com"
        }).get();
        expect(data).toBeNull();
        expect(status).toBe(404);
        expect(error).not.toBeNull();
        expect(error?.value).toBe('User not found / CMU email not valid');
    });

    it('DELETE /dashboard delete from invalid email', async () => {
        const { data, error, status } = await api.dashboard.delete({
            "cmuitaccount": "unknown13@cmu.ac.th",
            "coursesNoList": [
                "261200"
            ]
        });
        expect(data).toBeNull();
        expect(status).toBe(400);
        expect(error).not.toBeNull();
        expect(error?.value).toEqual({
            "ok": false,
            "message": "fail to remove course from dashboard"
        });
    })

    it('POST /dashboard add invalid course to dashboard', async () => {
        const { data, error, status } = await api.dashboard.post({
            "cmuitaccount": "yutthakarn_sajui@cmu.ac.th",
            "coursesNoList": [
                "56465"
            ]
        });
        expect(data).toBeNull();
        expect(status).toBe(404);
        expect(error).not.toBeNull();
        expect(error?.value).toEqual({
            "ok": false,
            "message": "course not found: 56465"
        });
    })

    it('GET /allcourse/{courseNo} course detail by course number', async () => {
        const { data, error, status } = await api.all_course({
            courseNo: "261200"
        }).get();
        expect(error).toBeNull();
        expect(data).toEqual({
            "course": {
                "ok": true,
                "courseDetails": [
                    {
                        "courseNo": "261200",
                        "updatedYear": 2561,
                        "updatedSemester": 1,
                        "courseNameEN": "Object-Oriented Programming",
                        "courseNameTH": "การเขียนโปรแกรมเชิงวัตถุ",
                        "curCodeEN": "CPE",
                        "curCodeTH": "วศ.คพ.",
                        "detailEN": "Object-oriented concepts. Classes and objects. Function overloading. Operator overloading. Inheritance. Override. Polymorphism. Advanced topics in object-oriented programming. Project development using object-oriented programming.",
                        "detailTH": "แนวคิดเชิงวัตถุ คลาสและวัตถุ การโอเวอร์โหลดฟังก์ชัน การโอเวอร์โหลดตัวดำเนินการ การสืบทอด โอเวอร์ไรด์ โพลิมอฟิสซึม หัวข้อขั้นสูงในการเขียนโปรแกรมเชิงวัตถุ การพัฒนาโครงการด้วยการเขียนโปรแกรมเชิงวัตถุ",
                        "credits": {
                            "credits": 3,
                            "lecture": 2,
                            "practice": 3,
                            "selfStudy": 4
                        },
                        "selectedTopicSubjects": []
                    }
                ]
            }
        });
    });
    it('GET /allcourse/{courseNo} course detail by course number', async () => {
        const { data, error, status } = await api.all_course({
            courseNo: "261555"
        }).get();
        expect(error).toBeNull();
        expect(data).toEqual(
            {
                "course": {
                    "ok": true,
                    "courseDetails": []
                }
            }
        );
    });
})