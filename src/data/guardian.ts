export type Metric = {
  label: string;
  value: string;
  helper: string;
};

export type TimelineItem = {
  title: string;
  detail: string;
};

export type ClassRoom = {
  name: string;
  students: string;
  progress: string;
  activity: string;
};

export type Notice = {
  title: string;
  detail: string;
};

export const parentMetrics: Metric[] = [
  { label: "Today's Study", value: "2h", helper: "Focused learning" },
  { label: "Practice Completed", value: "40", helper: "Questions today" },
  { label: "Current Streak", value: "12", helper: "Days consistent" },
  { label: "Overall Progress", value: "64%", helper: "Mission path" },
];

export const weeklySummary: Metric[] = [
  { label: "Studied", value: "12h", helper: "This week" },
  { label: "Solved", value: "280", helper: "Questions" },
  { label: "Completed", value: "4", helper: "Chapters" },
  { label: "Took", value: "2", helper: "Mock tests" },
];

export const parentTimeline: TimelineItem[] = [
  { title: "Mission Started", detail: "Rahul began his TopRank journey." },
  { title: "Weekly Goal Completed", detail: "Four study days completed this week." },
  { title: "First Mock Test", detail: "A full mock was attempted calmly." },
  { title: "New Achievement", detail: "7-Day Streak badge unlocked." },
  { title: "Today's Progress", detail: "Physics practice continued today." },
];

export const schoolMetrics: Metric[] = [
  { label: "Active Students", value: "428", helper: "This week" },
  { label: "Average Practice", value: "62%", helper: "Mock engagement" },
  { label: "Weekly Participation", value: "81%", helper: "Students active" },
  { label: "Mock Test Participation", value: "74%", helper: "Latest test" },
];

export const classes: ClassRoom[] = [
  { name: "Class A", students: "142", progress: "68%", activity: "High" },
  { name: "Class B", students: "136", progress: "61%", activity: "Steady" },
  { name: "Class C", students: "150", progress: "57%", activity: "Growing" },
];

export const notices: Notice[] = [
  { title: "Sunday Mock Test", detail: "Grand mock preview for all students." },
  { title: "Parent Meeting", detail: "Progress discussion this Friday." },
  { title: "Physics Revision Week", detail: "Motion and laws of motion focus." },
];
