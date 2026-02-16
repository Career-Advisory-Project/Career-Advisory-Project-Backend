import type { CurriculumKey } from "../model";
import { normalizeKey, union, difference } from "../model";
import { getCurriculumSnapshot } from "./getCurriculum";
import { getOverrideOrDefault } from "./override";

export async function getEffectiveCourseNos(keyInput: CurriculumKey): Promise<string[]> {
  const key = normalizeKey(keyInput);

  const snapshot = await getCurriculumSnapshot(key);
  if (!snapshot) throw new Error("Curriculum snapshot not found. Please sync first.");

  const override = await getOverrideOrDefault(key);

  const baseline = (snapshot.allCourseNos ?? []).map(String);
  return union(difference(baseline, override.removedCourseNos), override.addedCourseNos);
}