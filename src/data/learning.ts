export type SubjectStatus = "Continue" | "Completed";

export type Subject = {
  name: string;
  href: string;
  progress: number;
  status: SubjectStatus;
  color: "blue" | "amber" | "green";
};

export type Chapter = {
  title: string;
  completion: number;
  time: string;
  difficulty: "Easy" | "Medium" | "Hard";
  href: string;
};

export type Resource = {
  title: string;
  type: string;
  detail: string;
  href: string;
};

export const todaySubjects: Subject[] = [
  { name: "Physics", href: "/learn/physics", progress: 62, status: "Continue", color: "blue" },
  { name: "Chemistry", href: "/learn/chemistry", progress: 44, status: "Continue", color: "amber" },
  { name: "Biology", href: "/learn/biology", progress: 100, status: "Completed", color: "green" },
];

export const chapters: Chapter[] = [
  { title: "Motion", completion: 62, time: "32 min", difficulty: "Easy", href: "/learn/physics/motion" },
  { title: "Laws of Motion", completion: 48, time: "45 min", difficulty: "Medium", href: "/learn/physics/motion" },
  { title: "Work Energy Power", completion: 36, time: "38 min", difficulty: "Medium", href: "/learn/physics/motion" },
  { title: "Rotation", completion: 18, time: "52 min", difficulty: "Hard", href: "/learn/physics/motion" },
  { title: "Gravitation", completion: 74, time: "28 min", difficulty: "Easy", href: "/learn/physics/motion" },
  { title: "Modern Physics", completion: 22, time: "41 min", difficulty: "Medium", href: "/learn/physics/motion" },
];

export const quickRevision: Resource[] = [
  { title: "Formula Sheet", type: "Revision", detail: "Key equations in one place", href: "/learn/downloads" },
  { title: "Mind Maps", type: "Visual", detail: "Chapter links at a glance", href: "/learn/downloads" },
  { title: "Flashcards", type: "Practice", detail: "Fast recall cards", href: "/learn/downloads" },
  { title: "Important Concepts", type: "Focus", detail: "High-value ideas", href: "/learn/downloads" },
  { title: "NCERT Highlights", type: "Reading", detail: "Lines worth revising", href: "/learn/downloads" },
];

export const downloads: Resource[] = [
  { title: "PDF Notes", type: "PDF", detail: "Motion chapter notes", href: "/learn/downloads" },
  { title: "Formula Book", type: "PDF", detail: "Physics formulas", href: "/learn/downloads" },
  { title: "Mind Maps", type: "Image", detail: "Concept overview", href: "/learn/downloads" },
  { title: "Revision Sheet", type: "PDF", detail: "Last-minute recap", href: "/learn/downloads" },
];
