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
        const testToken = "YOUR_VALID_JWT_OR_TOKEN_HERE";

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

    
})