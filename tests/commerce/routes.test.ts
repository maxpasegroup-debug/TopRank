import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ user: vi.fn(), mutate: vi.fn(), admin: vi.fn(), home: vi.fn(), process: vi.fn() }));
vi.mock("@/server/auth/session", () => ({ getCurrentUser: m.user }));
vi.mock("@/server/db", () => ({ prisma: {} }));
vi.mock("@/server/logger", () => ({ logger: { error: vi.fn() } }));
vi.mock("@/server/commerce/service", () => ({ studentCommerceMutation: m.mutate, adminCommerceMutation: m.admin, commerceHome: m.home, adminCommerceData: m.home, processEvent: m.process }));
import { POST, GET } from "@/app/api/student/commerce/route";
import { POST as ADMIN } from "@/app/api/admin/commerce/route";
import { POST as WEBHOOK } from "@/app/api/payments/razorpay/route";
import { rawWebhook, webhookHandler } from "@/server/commerce/webhook";
import type { CommerceProvider } from "@/server/commerce/provider";
const user = { id: "student", role: "STUDENT", name: "Student", email: "private@example.com" };
function req(data: unknown, origin = "https://toprank.test") { return new Request("https://toprank.test/api/student/commerce", { method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify(data) }); }
beforeEach(() => { vi.resetAllMocks(); vi.stubEnv("APP_URL", "https://toprank.test"); m.user.mockResolvedValue(user); });
afterEach(() => vi.unstubAllEnvs());
describe("commerce HTTP boundaries", () => {
 it.each([POST, GET, ADMIN])("requires authentication", async (handler) => { m.user.mockResolvedValue(null); expect((await handler(req({}))).status).toBe(401); });
 it.each(["PARENT", "TEACHER", "SCHOOL_ADMIN", "PLATFORM_ADMIN"])("rejects non-student %s", async (role) => { m.user.mockResolvedValue({ ...user, role }); expect((await POST(req({ action: "cancel", orderId: "o" }))).status).toBe(403); });
 it("denies student catalogue administration", async () => { expect((await ADMIN(req({ action: "feature", code: "MOCK_ACCESS", title: "Mocks" }))).status).toBe(403); expect(m.admin).not.toHaveBeenCalled(); });
 it("rejects cross-origin purchases", async () => expect((await POST(req({ action: "cancel", orderId: "o" }, "https://evil.test"))).status).toBe(403));
 it("uses authenticated identity and no-store", async () => { const response = await POST(req({ action: "cancel", orderId: "o" })); expect(response.status).toBe(200); expect(response.headers.get("cache-control")).toBe("no-store"); expect(m.mutate).toHaveBeenCalledWith(user, { action: "cancel", orderId: "o" }); });
 it("bounds student request bodies", async () => expect((await POST(req({ huge: "x".repeat(4097) }))).status).toBe(413));
 it("hides internal errors", async () => { m.mutate.mockRejectedValue(new Error("secret stack database token")); const r = await POST(req({ action: "cancel", orderId: "o" })); expect(r.status).toBe(500); expect(await r.text()).not.toMatch(/secret|stack|database|token/); });
 it("keeps runtime webhooks disabled without touching persistence", async () => { expect((await WEBHOOK(req({}))).status).toBe(503); expect(m.process).not.toHaveBeenCalled(); });
 it("reads exact raw bytes without JSON normalization", async () => { const r = new Request("https://toprank.test", { method: "POST", headers: { "content-type": "application/json" }, body: '{ "spacing":  1 }' }); expect((await rawWebhook(r)).toString()).toBe('{ "spacing":  1 }'); });
 it("bounds raw webhook streams", async () => { await expect(rawWebhook(req({ huge: "x".repeat(32769) }))).rejects.toMatchObject({ status: 413 }); });
 it("validates signature before processing", async () => { const verify = vi.fn().mockImplementation(() => { throw new Error("bad signature"); }); const handler = webhookHandler(() => ({ verify }) as unknown as CommerceProvider); expect((await handler(req({}))).status).toBe(500); expect(m.process).not.toHaveBeenCalled(); });
});
