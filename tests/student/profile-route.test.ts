import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  getStudentProfile: vi.fn(),
  updateStudentProfile: vi.fn(),
}));

vi.mock("@/server/auth/session", () => ({
  getCurrentUser: mocks.getCurrentUser,
}));

vi.mock("@/server/student/service", () => ({
  getStudentProfile: mocks.getStudentProfile,
  updateStudentProfile: mocks.updateStudentProfile,
}));

describe("student profile API route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("APP_URL", "http://localhost");
  });
  afterEach(() => vi.unstubAllEnvs());

  it("rejects unauthenticated profile reads", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);
    const { GET } = await import("@/app/api/student/profile/route");
    const response = await GET(new Request("http://localhost/api/student/profile"));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error.code).toBe("AUTHENTICATION_REQUIRED");
  });

  it("derives profile ownership from the authenticated user", async () => {
    const user = { id: "student_1", email: "student@example.com", name: "Anu", role: "STUDENT" };
    mocks.getCurrentUser.mockResolvedValue(user);
    mocks.updateStudentProfile.mockResolvedValue({ userId: user.id, name: "Anu" });
    const { PUT } = await import("@/app/api/student/profile/route");
    const request = new Request("http://localhost/api/student/profile", {
      method: "PUT",
      headers: { origin: "http://localhost", "content-type": "application/json" },
      body: JSON.stringify({ targetYear: 2028 }),
    });

    await PUT(request);

    expect(mocks.updateStudentProfile).toHaveBeenCalledWith(user, { targetYear: 2028 });
  });
  it("rejects cross-origin profile updates without persistence", async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: "student_1", role: "STUDENT" });
    const { PUT } = await import("@/app/api/student/profile/route");
    const response = await PUT(new Request("http://localhost/api/student/profile", { method: "PUT", headers: { origin: "https://evil.test", "content-type": "application/json" }, body: JSON.stringify({ targetYear: 2028 }) }));
    expect(response.status).toBe(403); expect(mocks.updateStudentProfile).not.toHaveBeenCalled();
  });
});
