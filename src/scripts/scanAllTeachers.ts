import { scanAllTeachers } from '../modules/course/scan/scanAllTeachers';

//thanks gpt <3
(async () => {
  try {
    await scanAllTeachers();
    console.log('✅ bootstrap teacher courses done');
    process.exit(0);
  } catch (err) {
    console.error('❌ bootstrap failed', err);
    process.exit(1);
  }
})();
