import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  listQuestions: vi.fn(),
}));

vi.mock("@/server/auth/session", () => ({ getCurrentUser: mocks.getCurrentUser }));
vi.mock("@/server/question/service", async () => {
  const { AuthorizationApiError } = await vi.importActual<typeof import("@/server/api/errors")>("@/server/api/errors");

  return {
    listQuestions: mocks.listQuestions,
    requireStudentQuestionAccess: (user: { role: string } | null) => {
      if (!user || user.role !== "STUDENT") {
        throw new AuthorizationApiError("Only student accounts can access practice questions");
      }
      return user;
    },
  };
});

describe("question API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated question access", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);
    const { GET } = await import("@/app/api/student/practice/questions/route");
    const response = await GET(new Request("http://localhost/api/student/practice/questions"));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error.code).toBe("AUTHENTICATION_REQUIRED");
  });

  it("rejects non-student question access", async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: "parent_1", email: "p@example.com", name: "Parent", role: "PARENT" });
    const { GET } = await import("@/app/api/student/practice/questions/route");
    const response = await GET(new Request("http://localhost/api/student/practice/questions"));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error.code).toBe("AUTHORIZATION_REQUIRED");
  });

  it("applies validated list filters", async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: "student_1", email: "s@example.com", name: "Student", role: "STUDENT" });
    mocks.listQuestions.mockResolvedValue([]);
    const { GET } = await import("@/app/api/student/practice/questions/route");
    const response = await GET(new Request("http://localhost/api/student/practice/questions?exam=neet&difficulty=EASY&type=SINGLE_CHOICE"));

    expect(response.status).toBe(200);
    expect(mocks.listQuestions).toHaveBeenCalledWith({ exam: "NEET", subject: undefined, chapter: undefined, difficulty: "EASY", type: "SINGLE_CHOICE" });
  });
});
