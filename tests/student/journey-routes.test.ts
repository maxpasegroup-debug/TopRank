import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ user: vi.fn(), save: vi.fn(), journey: vi.fn(), confirm: vi.fn(), change: vi.fn(), preview: vi.fn() }));
vi.mock("@/server/auth/session", () => ({ getCurrentUser: mocks.user }));
vi.mock("@/server/db", () => ({ prisma: {} }));
vi.mock("@/server/journey/service", () => ({ saveJourney: mocks.save, getJourney: mocks.journey,
  confirmJourneyPlan: mocks.confirm, changeMissionTask: mocks.change, previewJourneyPlan: mocks.preview, getMissionBoard: vi.fn() }));
vi.mock("@/server/logger", () => ({ logger: { error: vi.fn() } }));
import { PUT, GET } from "@/app/api/student/journey/route";
import { POST, PATCH } from "@/app/api/student/missions/route";
const student = { id: "student-a", role: "STUDENT", name: "A", email: "a@example.com" };
function req(data: unknown, origin = "https://toprank.test") { return new Request("https://toprank.test/api/student/journey", {
  method: "PUT", headers: { origin, "content-type": "application/json" }, body: JSON.stringify(data) }); }
beforeEach(() => { vi.resetAllMocks(); vi.stubEnv("APP_URL", "https://toprank.test"); mocks.user.mockResolvedValue(student); });
afterEach(() => vi.unstubAllEnvs());
describe("student journey mutation boundary (mocked services)", () => {
  it.each([PUT, POST, PATCH])("requires authentication before mutation", async (handler) => {
    mocks.user.mockResolvedValue(null); expect((await handler(req({}))).status).toBe(401);
    expect(mocks.save).not.toHaveBeenCalled(); expect(mocks.confirm).not.toHaveBeenCalled(); expect(mocks.change).not.toHaveBeenCalled();
  });
  it("rejects parent access", async () => { mocks.user.mockResolvedValue({ ...student, role: "PARENT" }); expect((await PUT(req({ aspiration: "Goal" }))).status).toBe(403); expect(mocks.save).not.toHaveBeenCalled(); });
  it.each([PUT, POST, PATCH])("rejects foreign origins before mutation", async (handler) => { expect((await handler(req({}, "https://evil.test"))).status).toBe(403); expect(mocks.save).not.toHaveBeenCalled(); expect(mocks.confirm).not.toHaveBeenCalled(); expect(mocks.change).not.toHaveBeenCalled(); });
  it("rejects browser-supplied ownership and oversized input", async () => {
    expect((await PUT(req({ userId: "other", aspiration: "Goal" }))).status).toBe(400);
    expect((await PUT(req({ aspiration: "x".repeat(5000) }))).status).toBe(413);
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it("passes only validated values and authenticated identity", async () => {
    mocks.save.mockResolvedValue({ aspiration: "My goal" }); const response = await PUT(req({ aspiration: " My goal " }));
    expect(response.status).toBe(200); expect(mocks.save).toHaveBeenCalledWith(student, { aspiration: "My goal" });
  });
  it("sanitizes unexpected service failures", async () => {
    mocks.save.mockRejectedValue(new Error("private database details")); const response = await PUT(req({ aspiration: "Goal" }));
    expect(response.status).toBe(500); expect(await response.text()).not.toMatch(/private|database|stack/);
  });
  it("marks personal data reads no-store", async () => { mocks.journey.mockResolvedValue({ profile: null, exams: [], subjects: [] }); expect((await GET(new Request("https://toprank.test/api/student/journey"))).headers.get("cache-control")).toBe("no-store"); });
});
