import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthorizationApiError, ValidationApiError } from "@/server/api/errors";
import type { AuthUser } from "@/server/auth/session";

const mocks = vi.hoisted(() => ({
  prisma: {
    question: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    subject: {
      findFirst: vi.fn(),
    },
    chapter: {
      findFirst: vi.fn(),
    },
    studentProfile: {
      findUnique: vi.fn(),
    },
    examSubject: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/server/db", () => ({ prisma: mocks.prisma }));

const student: AuthUser = { id: "student_1", email: "s@example.com", name: "Student", role: "STUDENT" };
const parent: AuthUser = { id: "parent_1", email: "p@example.com", name: "Parent", role: "PARENT" };

const questionRecord = {
  id: "q_1",
  code: "FND-PHY-MSL-001",
  text: "A student walks 3 m east and then 4 m north. What is the magnitude of displacement?",
  type: "SINGLE_CHOICE",
  difficulty: "EASY",
  tags: ["kinematics"],
  subject: { code: "PHYSICS", name: "Physics", slug: "physics" },
  chapter: { title: "Motion in a Straight Line", slug: "motion-in-a-straight-line" },
  lesson: { title: "Distance and Displacement", slug: "distance-and-displacement" },
  options: [
    { id: "o_1", code: "A", text: "1 m", order: 1, isCorrect: false },
    { id: "o_2", code: "B", text: "5 m", order: 2, isCorrect: true },
  ],
  exams: [{ exam: { code: "NEET", name: "National Eligibility cum Entrance Test" } }],
  explanation: "This reveals the answer.",
  solutionRef: "internal-solution-key",
};

describe("question service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retrieves published active questions with exam, subject, chapter, difficulty, and type filters", async () => {
    mocks.prisma.question.findMany.mockResolvedValue([questionRecord]);
    const { listQuestions } = await import("@/server/question/service");
    const result = await listQuestions({
      exam: "NEET",
      subject: "physics",
      chapter: "motion-in-a-straight-line",
      difficulty: "EASY",
      type: "SINGLE_CHOICE",
    });

    expect(result).toHaveLength(1);
    expect(mocks.prisma.question.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        status: "PUBLISHED",
        active: true,
        reviewStatus: "REVIEWED",
        difficulty: "EASY",
        type: "SINGLE_CHOICE",
        subject: expect.objectContaining({ status: "PUBLISHED", active: true, slug: "physics" }),
        chapter: expect.objectContaining({ status: "PUBLISHED", active: true, slug: "motion-in-a-straight-line" }),
        exams: expect.objectContaining({
          some: expect.objectContaining({
            status: "PUBLISHED",
            active: true,
            exam: expect.objectContaining({ code: "NEET", status: "PUBLISHED", active: true }),
          }),
        }),
      }),
    }));
  });

  it("does not return answer keys, explanations, or solution references to students", async () => {
    mocks.prisma.question.findMany.mockResolvedValue([questionRecord]);
    const { listQuestions } = await import("@/server/question/service");
    const result = await listQuestions();
    const serialized = JSON.stringify(result);

    expect(serialized).not.toContain("isCorrect");
    expect(serialized).not.toContain("explanation");
    expect(serialized).not.toContain("solutionRef");
    expect(result[0].options[1]).toEqual({ id: "o_2", code: "B", text: "5 m", order: 2 });
  });

  it("rejects invalid question ids with a validation error", async () => {
    mocks.prisma.question.findFirst.mockResolvedValue(null);
    const { getQuestion } = await import("@/server/question/service");

    await expect(getQuestion("missing")).rejects.toBeInstanceOf(ValidationApiError);
  });

  it("omits protected fields from the student query", async () => {
    mocks.prisma.question.findMany.mockResolvedValue([questionRecord]);
    const { listQuestions } = await import("@/server/question/service");
    await listQuestions();
    const select = mocks.prisma.question.findMany.mock.calls[0][0].select;
    expect(select).not.toHaveProperty("numericalAnswer");
    expect(select).not.toHaveProperty("explanation");
    expect(select).not.toHaveProperty("solutionRef");
    expect(select.options.select).not.toHaveProperty("isCorrect");
  });

  it("allowlists nested records even when a query returns extra answer metadata", async () => {
    mocks.prisma.question.findMany.mockResolvedValue([{
      ...questionRecord,
      numericalAnswer: "protected-key-marker",
      subject: { ...questionRecord.subject, numericalAnswer: "protected-key-marker" },
      chapter: { ...questionRecord.chapter, explanation: "protected-key-marker" },
      lesson: { ...questionRecord.lesson, solutionRef: "protected-key-marker" },
      exams: [{ exam: { ...questionRecord.exams[0].exam, marks: "protected-key-marker" } }],
    }]);
    const { listQuestions } = await import("@/server/question/service");
    expect(JSON.stringify(await listQuestions())).not.toContain("protected-key-marker");
  });

  it("rejects unauthorized non-student roles", async () => {
    const { requireStudentQuestionAccess } = await import("@/server/question/service");

    expect(() => requireStudentQuestionAccess(parent)).toThrow(AuthorizationApiError);
    expect(() => requireStudentQuestionAccess(student)).not.toThrow();
  });

  it("uses authenticated student profile exam for practice home", async () => {
    mocks.prisma.studentProfile.findUnique.mockResolvedValue({ targetExam: { code: "NEET", name: "National Eligibility cum Entrance Test" } });
    mocks.prisma.examSubject.findMany.mockResolvedValue([
      { subject: { code: "PHYSICS", name: "Physics", slug: "physics", _count: { questions: 2 } } },
    ]);
    const { getStudentPracticeHome } = await import("@/server/question/service");
    const result = await getStudentPracticeHome(student);

    expect(result.subjects[0]).toMatchObject({ title: "Physics", questions: 2, href: "/practice/subjects/physics/questions" });
    expect(mocks.prisma.studentProfile.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: student.id } }));
  });

  it("does not return demo content when the student has no selected exam", async () => {
    mocks.prisma.studentProfile.findUnique.mockResolvedValue({ targetExam: null });
    const { getStudentPracticeHome } = await import("@/server/question/service");

    await expect(getStudentPracticeHome(student)).resolves.toEqual({ exam: null, subjects: [] });
  });

  it("uses idempotent seed operations and avoids destructive question resets", () => {
    const seed = readFileSync("prisma/seed.ts", "utf8");

    expect(seed).toContain("question.upsert");
    expect(seed).toContain("questionOption.upsert");
    expect(seed).toContain("questionExam.upsert");
    expect(seed).not.toContain("deleteMany");
    expect(seed).not.toContain("DROP TABLE");
  });
});
