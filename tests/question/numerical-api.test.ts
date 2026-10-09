import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET as list } from "@/app/api/student/practice/questions/route";
import { GET as detail } from "@/app/api/student/practice/questions/[questionId]/route";
import { GET as subject } from "@/app/api/student/practice/subjects/[subjectSlug]/questions/route";
import { GET as chapter } from "@/app/api/student/practice/chapters/[chapterSlug]/questions/route";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  findMany: vi.fn(),
  findFirst: vi.fn(),
  findSubject: vi.fn(),
  findChapter: vi.fn(),
}));

vi.mock("@/server/auth/session", () => ({ getCurrentUser: mocks.getCurrentUser }));
vi.mock("@/server/db", () => ({ prisma: {
  question: { findMany: mocks.findMany, findFirst: mocks.findFirst },
  subject: { findFirst: mocks.findSubject },
  chapter: { findFirst: mocks.findChapter },
} }));

const endpoints = [
  { name: "list", call: (request: Request) => list(request), many: true },
  { name: "detail", call: (request: Request) => detail(request, { params: Promise.resolve({ questionId: "q_test" }) }), many: false },
  { name: "subject", call: (request: Request) => subject(request, { params: Promise.resolve({ subjectSlug: "physics" }) }), many: true },
  { name: "chapter", call: (request: Request) => chapter(request, { params: Promise.resolve({ chapterSlug: "motion" }) }), many: true },
];

const numericalRecord = {
  id: "q_test", code: "TEST-NUM-001", text: "Calculate the requested quantity.",
  type: "NUMERICAL", difficulty: "EASY", tags: ["foundation"],
  status: "PUBLISHED", active: true, reviewStatus: "REVIEWED",
  subject: { code: "PHYSICS", name: "Physics", slug: "physics" },
  chapter: { title: "Motion", slug: "motion" }, lesson: null,
  exams: [{ exam: { code: "NEET", name: "NEET" }, marks: "grading-marker" }],
  numericalAnswer: "987654.321", explanation: "answer-explanation-marker",
  solutionRef: "solution-key-marker",
  options: [{ id: "legacy_key", code: "NUMERIC", text: "987654.321", order: 1, isCorrect: true }],
};

function expectProtectedFieldsAbsent(body: unknown) {
  const json = JSON.stringify(body);
  for (const hidden of ["numericalAnswer", "isCorrect", "explanation", "solutionRef", "grading-marker", "answer-explanation-marker", "solution-key-marker"]) {
    expect(json).not.toContain(hidden);
  }
}

describe.each(endpoints)("$name question API with the real service and serializer", (endpoint) => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.getCurrentUser.mockResolvedValue({ id: "student_1", name: "Student", email: "s@example.com", role: "STUDENT" });
    mocks.findMany.mockResolvedValue([numericalRecord]);
    mocks.findFirst.mockResolvedValue(numericalRecord);
    mocks.findSubject.mockResolvedValue(numericalRecord.subject);
    mocks.findChapter.mockResolvedValue({ ...numericalRecord.chapter, subject: numericalRecord.subject });
  });

  function call(query = "") {
    return endpoint.call(new Request(`http://localhost/api/student/practice/questions${query}`, {
      headers: { "x-request-id": "question-test" },
    }));
  }

  it("hides the protected key and legacy numerical choices in the actual JSON response", async () => {
    const response = await call();
    expect(response.status).toBe(200);
    const body = await response.json();
    const question = endpoint.many ? body.data.questions[0] : body.data.question;
    expect(question).toEqual({
      id: "q_test", code: "TEST-NUM-001", text: "Calculate the requested quantity.",
      type: "NUMERICAL", difficulty: "EASY", tags: ["foundation"],
      subject: numericalRecord.subject, chapter: numericalRecord.chapter, lesson: null,
      exams: [{ code: "NEET", name: "NEET" }], options: [],
    });
    expectProtectedFieldsAbsent(body);
    expect(JSON.stringify(body)).not.toContain("987654.321");
    expect(JSON.stringify(body)).not.toContain("legacy_key");
  });

  it.each(["SINGLE_CHOICE", "MULTIPLE_CHOICE"])("preserves safe %s choices without answer metadata", async (type) => {
    const record = { ...numericalRecord, type, options: [
      { id: "a", code: "A", text: "Choice A", order: 1, isCorrect: false },
      { id: "b", code: "B", text: "Choice B", order: 2, isCorrect: true },
    ] };
    mocks.findMany.mockResolvedValue([record]);
    mocks.findFirst.mockResolvedValue(record);
    const response = await call();
    expect(response.status).toBe(200);
    const body = await response.json();
    const question = endpoint.many ? body.data.questions[0] : body.data.question;
    expect(question.options).toEqual([
      { id: "a", code: "A", text: "Choice A", order: 1 },
      { id: "b", code: "B", text: "Choice B", order: 2 },
    ]);
    expectProtectedFieldsAbsent(body);
  });

  it.each([
    { status: "DRAFT", active: true, reviewStatus: "REVIEWED" },
    { status: "ARCHIVED", active: true, reviewStatus: "REVIEWED" },
    { status: "PUBLISHED", active: false, reviewStatus: "REVIEWED" },
    { status: "PUBLISHED", active: true, reviewStatus: "NEEDS_REVIEW" },
  ])("excludes unavailable questions: %j", async (visibility) => {
    // Simulate database filtering, and assert the real service supplies every visibility guard.
    const record = { ...numericalRecord, ...visibility };
    const matches = ({ where }: { where: Record<string, unknown> }) => {
      expect(where).toMatchObject({ status: "PUBLISHED", active: true, reviewStatus: "REVIEWED" });
      return record.status === where.status && record.active === where.active && record.reviewStatus === where.reviewStatus;
    };
    mocks.findMany.mockImplementation(async (query) => matches(query) ? [record] : []);
    mocks.findFirst.mockImplementation(async (query) => matches(query) ? record : null);
    const response = await call();
    const body = await response.json();
    expect(response.status).toBe(endpoint.many ? 200 : 400);
    if (endpoint.many) expect(body.data.questions).toEqual([]);
    else expect(body.error).toEqual({ code: "VALIDATION_ERROR", message: "Practice question was not found" });
    expect(JSON.stringify(body)).not.toContain("987654.321");
  });

  it.each(["FREE_TEXT", null])("fails closed for malformed stored type %j", async (type) => {
    mocks.findMany.mockResolvedValue([{ ...numericalRecord, type }]);
    mocks.findFirst.mockResolvedValue({ ...numericalRecord, type });
    const response = await call();
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      ok: false, error: { code: "VALIDATION_ERROR", message: "Practice question was not found" }, requestId: "question-test",
    });
  });

  it("rejects unsupported type filters before reading questions", async () => {
    const response = await call("?type=FREE_TEXT");
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      ok: false, error: { code: "VALIDATION_ERROR", message: "Request validation failed" }, requestId: "question-test",
    });
    expect(mocks.findMany).not.toHaveBeenCalled();
    expect(mocks.findFirst).not.toHaveBeenCalled();
  });
});
