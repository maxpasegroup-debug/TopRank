export type ProgressMetricItem = {
  label: string;
  value: string;
  helper: string;
};

export type TimelineItemData = {
  title: string;
  detail: string;
  state: "done" | "current" | "future";
};

export type SubjectPerformance = {
  subject: string;
  progress: number;
  accuracy: string;
  lastActivity: string;
  href: string;
};

export type Achievement = {
  title: string;
  detail: string;
  tone: "blue" | "amber" | "green";
};

export type CalendarDay = {
  day: number;
  state: "study" | "practice" | "missed" | "empty";
};

export type Certificate = {
  title: string;
  detail: string;
};

export const progressMetrics: ProgressMetricItem[] = [
  { label: "Overall Progress", value: "64%", helper: "Mission path" },
  { label: "Current Streak", value: "12", helper: "Days showing up" },
  { label: "Practice Completed", value: "28", helper: "Sets finished" },
  { label: "Accuracy", value: "78%", helper: "Mock average" },
  { label: "Target Exam", value: "NEET", helper: "2028 goal" },
];

export const journeyItems: TimelineItemData[] = [
  { title: "Mission Started", detail: "You chose your target and began.", state: "done" },
  { title: "First Practice", detail: "Your first set is complete.", state: "done" },
  { title: "First Mock", detail: "A full test attempt is unlocked.", state: "done" },
  { title: "Weekly Goal Completed", detail: "Consistency won this week.", state: "done" },
  { title: "Current Week", detail: "Keep the 12-day streak alive.", state: "current" },
  { title: "Future Milestone", detail: "30-day consistency badge ahead.", state: "future" },
];

export const subjectPerformance: SubjectPerformance[] = [
  { subject: "Physics", progress: 62, accuracy: "74%", lastActivity: "Motion practice", href: "/learn/physics" },
  { subject: "Chemistry", progress: 48, accuracy: "71%", lastActivity: "Mole concept", href: "/learn/chemistry" },
  { subject: "Biology", progress: 81, accuracy: "84%", lastActivity: "Cell revision", href: "/learn/biology" },
];

export const weeklyProgress = [
  { label: "Monday", value: 100 },
  { label: "Tuesday", value: 80 },
  { label: "Wednesday", value: 100 },
  { label: "Thursday", value: 60 },
  { label: "Friday", value: 100 },
  { label: "Saturday", value: 40 },
  { label: "Sunday", value: 0 },
];

export const achievements: Achievement[] = [
  { title: "7-Day Streak", detail: "You kept showing up.", tone: "amber" },
  { title: "100 Questions Solved", detail: "Practice effort unlocked.", tone: "blue" },
  { title: "Physics Explorer", detail: "Motion basics completed.", tone: "green" },
  { title: "Early Bird", detail: "Morning study done.", tone: "amber" },
  { title: "Weekly Champion", detail: "Goal completed this week.", tone: "blue" },
];

export const calendarDays: CalendarDay[] = [
  { day: 1, state: "study" },
  { day: 2, state: "practice" },
  { day: 3, state: "study" },
  { day: 4, state: "missed" },
  { day: 5, state: "practice" },
  { day: 6, state: "study" },
  { day: 7, state: "study" },
  { day: 8, state: "practice" },
  { day: 9, state: "study" },
  { day: 10, state: "empty" },
  { day: 11, state: "practice" },
  { day: 12, state: "study" },
  { day: 13, state: "missed" },
  { day: 14, state: "practice" },
  { day: 15, state: "study" },
  { day: 16, state: "study" },
  { day: 17, state: "practice" },
  { day: 18, state: "study" },
  { day: 19, state: "empty" },
  { day: 20, state: "practice" },
  { day: 21, state: "study" },
];

export const certificates: Certificate[] = [
  { title: "Week 1 Complete", detail: "Finished your first TopRank week." },
  { title: "30-Day Consistency", detail: "Upcoming consistency certificate." },
  { title: "Physics Master", detail: "Complete Physics practice to unlock." },
];
