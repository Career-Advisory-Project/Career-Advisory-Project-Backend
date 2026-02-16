import { syncAllCurriculums } from "../modules/curriculum/services/getCurriculum";

async function main() {
  const res = await syncAllCurriculums();
  console.log("Total synced:", res.totalSynced);
  console.log("Total failed:", res.totalFailed);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
