import axios from "axios";
import prisma from "../../../db";
import type { CurriculumKey } from "../model";
import { uniq } from "../model";

const BASE_URL = process.env.CPE_API_BASE_URL!;
const API_KEY = process.env.CPE_API_KEY!;

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

async function scanCurriculumFromCpe(key: CurriculumKey): Promise<CpeCurriculum> {
  if (!BASE_URL) throw new Error("Missing env: CPE_API_BASE_URL");
  if (!API_KEY) throw new Error("Missing env: CPE_API_KEY");

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

    raw: curr,
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
  const targets: CurriculumKey[] = [
    { curriculumProgram: "CPE", year: 2563, isCOOPPlan: false },
    { curriculumProgram: "CPE", year: 2563, isCOOPPlan: true },

    { curriculumProgram: "CPE", year: 2568, isCOOPPlan: false },
    { curriculumProgram: "CPE", year: 2568, isCOOPPlan: true },

    { curriculumProgram: "ISNE", year: 2561, isCOOPPlan: false },
    { curriculumProgram: "ISNE", year: 2561, isCOOPPlan: true },

    { curriculumProgram: "ISNE", year: 2566, isCOOPPlan: false },
    { curriculumProgram: "ISNE", year: 2566, isCOOPPlan: true },
  ];

  const ok: any[] = [];
  const failed: Array<{ key: CurriculumKey; error: string }> = [];

  for (const key of targets) {
    console.log(`Syncing ${key.curriculumProgram} ${key.year} COOP=${key.isCOOPPlan}`);

    try {
      const res = await getCurriculum(key);
      ok.push(res.curriculum);
    } catch (e: any) {
      failed.push({ key, error: String(e?.message ?? e) });
      console.log("  -> skipped:", String(e?.message ?? e));
    }
  }

  console.log("Done ✔");
  return { 
    ok: true, 
    totalSynced: ok.length, 
    totalFailed: failed.length, 
    curriculums: ok, failed 
  };
}