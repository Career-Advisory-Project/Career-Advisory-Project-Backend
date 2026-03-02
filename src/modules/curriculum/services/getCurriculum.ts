import axios from "axios";
import prisma from "../../../db";
import type { CurriculumKey } from "../model";
import { uniq } from "../model";

const BASE_URL = process.env.CPE_API_URL!;
const API_KEY = process.env.CPE_API_TOKEN!;

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  Accept: "application/json",
};

type CpeCurriculumCourse = {
  courseNo: string;
  recommendSemester: number | null;
  recommendYear: number | null;
  prerequisites: string[];
  corequisite: string | null;
  credits: number;
};

type CpeCurriculumGroup = {
  requiredCredits: number;
  groupName: string;
  requiredCourses: CpeCurriculumCourse[];
  electiveCourses: CpeCurriculumCourse[];
};

export type CpeCurriculum = {
  curriculumProgram: "CPE" | "ISNE";
  year: number;
  isCOOPPlan: boolean;
  requiredCredits: number;
  freeElectiveCredits: number;
  coreAndMajorGroups: CpeCurriculumGroup[];
  geGroups: CpeCurriculumGroup[];
};

type CpeCurriculumResponse = {
  ok: boolean;
  curriculum?: CpeCurriculum;
};

function collectCourseNos(groups: CpeCurriculumGroup[] | undefined | null): string[] {
  const out: string[] = [];
  for (const g of groups ?? []) {
    for (const c of g.requiredCourses ?? []) out.push(String(c.courseNo));
    for (const c of g.electiveCourses ?? []) out.push(String(c.courseNo));
  }
  return out;
}

function collectRequiredCourseNos(
  coreAndMajorGroups: CpeCurriculumGroup[] | undefined | null,
  geGroups: CpeCurriculumGroup[] | undefined | null
): string[] {
  const allow = new Set(["core", "major required"]);
  const out: string[] = [];

  for (const g of coreAndMajorGroups ?? []) {
    const name = String(g.groupName ?? "").trim().toLowerCase();
    if (!allow.has(name)) continue;
    for (const c of g.requiredCourses ?? []) out.push(String(c.courseNo));
  }

  for (const g of geGroups ?? []) {
    for (const c of g.requiredCourses ?? []) out.push(String(c.courseNo));
  }

  return out;
}

async function scanCurriculumFromCpe(key: CurriculumKey): Promise<CpeCurriculum> {
  if (!BASE_URL) throw new Error("Missing env: CPE_API_URL");
  if (!API_KEY) throw new Error("Missing env: CPE_API_TOKEN");

  try {
    const res = await axios.get<CpeCurriculumResponse>(`${BASE_URL}/curriculum`, {
      headers,
      params: {
        year: key.year,
        curriculumProgram: key.curriculumProgram,
        isCOOPPlan: key.isCOOPPlan,
      },
    });

    const data = res.data;
    if (!data?.ok || !data?.curriculum) {
      throw new Error("Unexpected CPE API response shape");
    }

    return data.curriculum;
  } catch (err: any) {
    const status = err?.response?.status;
    const body = err?.response?.data;

    if (status) {
      const bodyText = typeof body === "string" ? body : JSON.stringify(body ?? {});
      throw new Error(`CPE API error ${status}: ${bodyText}`);
    }

    throw err;
  }
}

export async function getCurriculum(key: CurriculumKey) {
  const curr = await scanCurriculumFromCpe(key);

  const allCourseNos = uniq([
    ...collectCourseNos(curr.coreAndMajorGroups),
    ...collectCourseNos(curr.geGroups),
  ]);

  const requiredCourseNos = uniq(
    collectRequiredCourseNos(curr.coreAndMajorGroups, curr.geGroups)
  );

  const existing = await prisma.curriculum.findFirst({
    where: {
      curriculumProgram: curr.curriculumProgram,
      year: curr.year,
      isCOOPPlan: curr.isCOOPPlan,
    },
    select: { id: true },
  });

  const dataToSave = {
    curriculumProgram: curr.curriculumProgram,
    year: curr.year,
    isCOOPPlan: curr.isCOOPPlan,

    requiredCredits: curr.requiredCredits,
    freeElectiveCredits: curr.freeElectiveCredits,

    coreAndMajorGroups: curr.coreAndMajorGroups,
    geGroups: curr.geGroups,

    allCourseNos,
    totalCourseCount: allCourseNos.length,
    requiredCourseNos,
    requiredCourseCount: requiredCourseNos.length,

    fetchedAt: new Date(),
  };

  const saved = existing
    ? await prisma.curriculum.update({ where: { id: existing.id }, data: dataToSave })
    : await prisma.curriculum.create({ data: dataToSave });

  return {
    ok: true,
    curriculum: saved,
  };
}

export async function syncAllCurriculums() {
  const currentBE = new Date().getFullYear() + 543;

  const startYearMap: Record<CurriculumKey["curriculumProgram"], number> = {
    CPE: 2563,
    ISNE: 2561,
  };

  const coopPlans: boolean[] = [false, true];
  const targets: CurriculumKey[] = [];

  for (const program of Object.keys(startYearMap) as CurriculumKey["curriculumProgram"][]) {
    let year = startYearMap[program];

    while (year <= currentBE) {
      for (const isCOOPPlan of coopPlans) {
        targets.push({
          curriculumProgram: program,
          year,
          isCOOPPlan,
        });
      }
      year += 1;
    }
  }

  const format = (k: CurriculumKey) =>
    `${k.curriculumProgram}-${k.year}-${k.isCOOPPlan ? "COOP" : "NONCOOP"}`;

  const synced: string[] = [];
  const failed: Array<{ key: string; error: string }> = [];

  for (const key of targets) {
    console.log(`Syncing ${key.curriculumProgram} ${key.year} COOP=${key.isCOOPPlan}`);

    try {
      await getCurriculum(key);
      synced.push(format(key));
    } catch (e: any) {
      failed.push({
        key: format(key),
        error: String(e?.message ?? e),
      });
      console.log("  -> skipped:", String(e?.message ?? e));
    }
  }

  console.log("Done ✔");
  return { 
    ok: true,
    totalSynced: synced.length,
    totalFailed: failed.length,
    synced,
    failed,
  };
}