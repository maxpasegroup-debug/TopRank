export type PracticeSubject = {
  title: string;
  progress: number;
  questions: number;
  difficulty: "Easy" | "Medium" | "Hard";
  href: string;
};

export type PracticeSet = {
  title: string;
  questions: number;
  time: string;
  difficulty: "Easy" | "Medium" | "Hard";
  bestScore: string;
  href: string;
};

export type MockTest = {
  title: string;
  duration: string;
  questions: number;
  difficulty: "Easy" | "Medium" | "Hard";
  href: string;
};

export type Paper = {
  title: string;
  detail: string;
  href: string;
};

export type ReviewItem = {
  number: number;
  yourAnswer: string;
  correctAnswer: string;
  status: "Correct" | "Review" | "Missed";
};

export const practiceSubjects: PracticeSubject[] = [
  { title: "Physics Practice", progress: 45, questions: 40, difficulty: "Medium", href: "/practice/physics" },
  { title: "Chemistry Practice", progress: 30, questions: 35, difficulty: "Easy", href: "/practice/physics" },
  { title: "Biology Practice", progress: 68, questions: 45, difficulty: "Medium", href: "/practice/physics" },
];

export const practiceCategories = [
  { title: "Topic Practice", href: "/practice/physics" },
  { title: "Chapter Practice", href: "/practice/physics" },
  { title: "Daily Practice", href: "/practice/question" },
  { title: "Previous Year Questions", href: "/practice/papers" },
  { title: "Mock Tests", href: "/practice/mock-tests" },
  { title: "Rapid Revision Quiz", href: "/practice/question" },
];

export const practiceSets: PracticeSet[] = [
  { title: "Practice Set 1", questions: 40, time: "48 min", difficulty: "Easy", bestScore: "82%", href: "/practice/question" },
  { title: "Practice Set 2", questions: 35, time: "42 min", difficulty: "Medium", bestScore: "76%", href: "/practice/question" },
  { title: "Practice Set 3", questions: 45, time: "54 min", difficulty: "Hard", bestScore: "68%", href: "/practice/question" },
];

export const mockTests: MockTest[] = [
  { title: "NEET Grand Mock 01", duration: "180 min", questions: 180, difficulty: "Hard", href: "/practice/question" },
  { title: "JEE Mock 05", duration: "180 min", questions: 90, difficulty: "Medium", href: "/practice/question" },
  { title: "Weekly Challenge", duration: "60 min", questions: 40, difficulty: "Easy", href: "/practice/question" },
];

export const papers: Paper[] = [
  { title: "NEET 2025", detail: "Previous year paper preview", href: "/practice/question" },
  { title: "NEET 2024", detail: "Previous year paper preview", href: "/practice/question" },
  { title: "NEET 2023", detail: "Previous year paper preview", href: "/practice/question" },
  { title: "JEE Main 2025", detail: "Previous year paper preview", href: "/practice/question" },
];

export const reviewItems: ReviewItem[] = [
  { number: 1, yourAnswer: "Option B", correctAnswer: "Option B", status: "Correct" },
  { number: 2, yourAnswer: "Option A", correctAnswer: "Option C", status: "Review" },
  { number: 3, yourAnswer: "Not attempted", correctAnswer: "Option D", status: "Missed" },
  { number: 4, yourAnswer: "Option C", correctAnswer: "Option C", status: "Correct" },
];

export const questionOptions = [
  "Distance travelled per unit time",
  "Shortest distance between two points",
  "Change in velocity per unit time",
  "Total path covered by an object",
];
