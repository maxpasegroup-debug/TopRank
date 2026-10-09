import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  listPublishedExams: vi.fn(),
}));

vi.mock("@/server/auth/session", () => ({ getCurrentUser: mocks.getCurrentUser }));
vi.mock("@/server/content/service", async () => {
  const { AuthorizationApiError } = await vi.importActual<typeof import("@/server/api/errors")>("@/server/api/errors");

  return {
    listPublishedExams: mocks.listPublishedExams,
    requireStudentContentAccess: (user: { role: string } | null) => {
      if (!user || user.role !== "STUDENT") {
        throw new AuthorizationApiError("Only student accounts can access learning content");
      }
      return user;
    },
  };
});

describe("content API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated content access", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);
    const { GET } = await import("@/app/api/student/content/exams/route");
    const response = await GET(new Request("http://localhost/api/student/content/exams"));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error.code).toBe("AUTHENTICATION_REQUIRED");
  });

  it("rejects non-student content access", async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: "parent_1", email: "p@example.com", name: "Parent", role: "PARENT" });
    const { GET } = await import("@/app/api/student/content/exams/route");
    const response = await GET(new Request("http://localhost/api/student/content/exams"));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error.code).toBe("AUTHORIZATION_REQUIRED");
  });
});
