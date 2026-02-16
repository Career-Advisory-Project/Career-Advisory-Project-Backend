import prisma from "../../../db";
import type { CurriculumKey } from "../model";
import { normalizeKey, uniq, union, difference } from "../model";
import { getCurriculumSnapshot } from "./getCurriculum";

export async function getOverrideOrDefault(keyInput: CurriculumKey) {
  const key = normalizeKey(keyInput);
  const doc = await prisma.curriculumOverride.findFirst({
    where: {
      curriculumProgram: key.curriculumProgram,
      year: key.year,
      isCOOPPlan: key.isCOOPPlan,
    },
  });

  if (!doc) {
    return { addedCourseNos: [] as string[], removedCourseNos: [] as string[], updatedAt: null as Date | null };
  }

  return {
    addedCourseNos: doc.addedCourseNos ?? [],
    removedCourseNos: doc.removedCourseNos ?? [],
    updatedAt: doc.updatedAt ?? null,
  };
}

async function upsertOverride(keyInput: CurriculumKey, next: { addedCourseNos: string[]; removedCourseNos: string[] }) {
  const key = normalizeKey(keyInput);
  const whereKey = {
    curriculumProgram: key.curriculumProgram,
    year: key.year,
    isCOOPPlan: key.isCOOPPlan,
  };

  const existing = await prisma.curriculumOverride.findFirst({ where: whereKey });
  const data = {
    ...whereKey,
    addedCourseNos: uniq(next.addedCourseNos),
    removedCourseNos: uniq(next.removedCourseNos),
  };

  if (existing) return prisma.curriculumOverride.update({ where: { id: existing.id }, data });
  return prisma.curriculumOverride.create({ data });
}

export async function addCourses(keyInput: CurriculumKey, courseNos: string[]) {
  const key = normalizeKey(keyInput);
  const override = await getOverrideOrDefault(key);

  const toAdd = uniq(courseNos.filter(Boolean));
  const nextAdded = union(override.addedCourseNos, toAdd);
  const nextRemoved = difference(override.removedCourseNos, toAdd); // ยกเลิกลบถ้ากำลังเพิ่ม

  return upsertOverride(key, { addedCourseNos: nextAdded, removedCourseNos: nextRemoved });
}

export async function removeCourses(keyInput: CurriculumKey, courseNos: string[]) {
  const key = normalizeKey(keyInput);
  const override = await getOverrideOrDefault(key);

  const toRemove = uniq(courseNos.filter(Boolean));

  // ถ้าเป็นของที่ admin เคยเพิ่ม -> แค่ยกเลิกเพิ่ม
  const nextAdded = difference(override.addedCourseNos, toRemove);

  // ลบจาก baseline: ใส่ removedCourseNos เฉพาะที่มีอยู่ใน snapshot
  const snapshot = await getCurriculumSnapshot(key);
  const baselineSet = new Set((snapshot?.allCourseNos ?? []).map(String));
  const baselineRemovals = toRemove.filter((c) => baselineSet.has(c));

  const nextRemoved = union(override.removedCourseNos, baselineRemovals);

  return upsertOverride(key, { addedCourseNos: nextAdded, removedCourseNos: nextRemoved });
}