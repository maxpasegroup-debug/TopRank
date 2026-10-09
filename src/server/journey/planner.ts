export type PlanLesson = { title: string; subject: string; href: string };
export function previewStudyPlan(start: Date, dailyMinutes: number, lessons: PlanLesson[]) {
  if (!Number.isInteger(dailyMinutes) || dailyMinutes < 30 || dailyMinutes > 720 || !lessons.length || Number.isNaN(start.getTime())) {
    throw new Error("A start date, study availability and published lessons are required");
  }
  // A seven-day draft based on selected content, not an exam-readiness estimate.
  const tasks = [];
  const slots = Math.min(3, lessons.length);
  for (let day = 0; day < 7; day++) {
    for (let slot = 0; slot < slots; slot++) {
      const lesson = lessons[(day * slots + slot) % lessons.length];
      const dueDate = new Date(start);
      dueDate.setUTCDate(start.getUTCDate() + day);
      tasks.push({ ...lesson, dueDate, minutes: Math.floor(dailyMinutes / slots) + (slot === 0 ? dailyMinutes % slots : 0) });
    }
  }
  return tasks;
}
