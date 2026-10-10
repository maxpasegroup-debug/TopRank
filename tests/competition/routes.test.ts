import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const mocks = vi.hoisted(() => ({ user: vi.fn(), join: vi.fn(), admin: vi.fn(), achievements: vi.fn(), list: vi.fn(), board: vi.fn(), overall: vi.fn() }));
vi.mock("@/server/auth/session", () => ({ getCurrentUser: mocks.user }));
vi.mock("@/server/db", () => ({ prisma: {} }));
vi.mock("@/server/logger", () => ({ logger: { error: vi.fn() } }));
vi.mock("@/server/competition/service", () => ({ participate: mocks.join, adminCompetitionMutation: mocks.admin, adminCompetitionData: vi.fn(), competitionDirectory: mocks.list, competitionLeaderboard: mocks.board, overallLeaderboard: mocks.overall }));
vi.mock("@/server/competition/achievements", () => ({ mutateAchievement: mocks.achievements, getAchievements: vi.fn() }));
import { POST, GET } from "@/app/api/student/competitions/route";
import { POST as ADMIN } from "@/app/api/admin/competitions/route";
import { POST as AWARDS } from "@/app/api/student/achievements/route";
import { middleware } from "../../middleware";
const student = { id: "student", role: "STUDENT", name: "Private", email: "private@example.com" };
function req(data: unknown, origin = "https://toprank.test") { return new Request("https://toprank.test/api/student/competitions", { method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify(data) }); }
beforeEach(() => { vi.resetAllMocks(); vi.stubEnv("APP_URL", "https://toprank.test"); mocks.user.mockResolvedValue(student); });
afterEach(() => vi.unstubAllEnvs());
describe("competition HTTP boundaries (mocked services)", () => {
 it.each([POST, ADMIN, AWARDS])("requires authentication", async (handler) => { mocks.user.mockResolvedValue(null); expect((await handler(req({}))).status).toBe(401); expect(mocks.join).not.toHaveBeenCalled(); expect(mocks.admin).not.toHaveBeenCalled(); expect(mocks.achievements).not.toHaveBeenCalled(); });
 it.each(["PARENT", "TEACHER", "SCHOOL_ADMIN", "PLATFORM_ADMIN"])("denies %s student mutation access", async (role) => { mocks.user.mockResolvedValue({ ...student, role }); expect((await POST(req({ action: "sync", id: "c" }))).status).toBe(403); expect(mocks.join).not.toHaveBeenCalled(); });
 it("denies student prize administration", async () => { expect((await ADMIN(req({ action: "prize", id: "p", version: 0, status: "APPROVED", reason: "Reviewed" }))).status).toBe(403); expect(mocks.admin).not.toHaveBeenCalled(); });
 it.each([POST, AWARDS])("rejects cross-site mutations", async (handler) => { expect((await handler(req({}, "https://evil.test"))).status).toBe(403); });
 it.each(["studentId", "userId", "rank", "score", "role", "deadline"])("rejects injected %s", async (field) => { expect((await POST(req({ action: "sync", id: "c", [field]: "forged" }))).status).toBe(400); expect(mocks.join).not.toHaveBeenCalled(); });
 it("passes only validated data and session identity", async () => { const result = await POST(req({ action: "sync", id: "c" })); expect(result.status).toBe(200); expect(mocks.join).toHaveBeenCalledWith(student, { action: "sync", id: "c" }); expect(result.headers.get("cache-control")).toBe("no-store"); });
 it("keeps request bytes bounded", async () => { expect((await POST(req({ data: "x".repeat(5000) }))).status).toBe(413); });
 it("accepts bounded multilingual admin award definitions without relaxing student bounds", async () => {
   mocks.user.mockResolvedValue({ ...student, role: "PLATFORM_ADMIN" });
   const payload = { action: "create", competition: { title: "Monthly challenge", type: "MONTHLY", mockExamId: "mock", startsAt: "2026-10-11T00:00:00Z", endsAt: "2026-10-12T00:00:00Z", config: { capacity: 100, minCompletedMocks: 0, scoring: "RAW_SCORE", awards: Array.from({ length: 10 }, (_, i) => ({ definitionId: `definition${i}`, fromRank: i + 1, toRank: i + 1, prizeLabel: "\u4e00".repeat(160) })) } } };
   expect(new TextEncoder().encode(JSON.stringify(payload)).length).toBeGreaterThan(4096);
   expect((await ADMIN(req(payload))).status).toBe(200); expect(mocks.admin).toHaveBeenCalled();
 });
 it("rejects admin streams exceeding the separate authoring bound", async () => { mocks.user.mockResolvedValue({ ...student, role: "PLATFORM_ADMIN" }); expect((await ADMIN(req({ data: "x".repeat(16385) }))).status).toBe(413); expect(mocks.admin).not.toHaveBeenCalled(); });
 it("does not expose private unexpected failure details", async () => { mocks.join.mockRejectedValue(new Error("private database secret")); const response = await POST(req({ action: "sync", id: "c" })); expect(response.status).toBe(500); expect(await response.text()).not.toMatch(/database|secret|stack/); });
 it("routes leaderboard pagination with trusted identity", async () => { expect((await GET(new Request("https://toprank.test/api/student/competitions?id=c&page=2"))).status).toBe(200); expect(mocks.board).toHaveBeenCalledWith(student, "c", "2"); });
 it("sharing headers prevent referrer and cache disclosure", () => { const response = middleware(new NextRequest("https://toprank.test/shared/achievements/token")); expect(response.headers.get("referrer-policy")).toBe("no-referrer"); expect(response.headers.get("cache-control")).toBe("private, no-store"); });
});
