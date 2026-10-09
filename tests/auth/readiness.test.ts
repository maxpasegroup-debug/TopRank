import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { GET } from "@/app/api/auth/readiness/route";
const mock = vi.hoisted(() => ({ enabled: true, check: vi.fn() }));
vi.mock("@/server/auth/rate-limit", () => ({ get authRateLimiter() { return mock.enabled ? { check: mock.check } : null; } }));
vi.mock("@/server/logger", () => ({ logger: { info: vi.fn(), error: vi.fn() } }));
beforeEach(() => {
  vi.resetAllMocks(); mock.enabled = true;
  vi.stubEnv("APP_URL", "https://toprank.test");
  vi.stubEnv("AUTH_TRUSTED_PROXY_VERIFIED", "true");
  vi.stubEnv("AUTH_TRUSTED_CLIENT_HEADER", "x-toprank-client-ip");
});
afterEach(() => { vi.unstubAllEnvs(); vi.useRealTimers(); });
const request = () => new Request("https://toprank.test/api/auth/readiness");
it("returns unavailable when no approved transport is wired", async () => {
  mock.enabled = false;
  expect((await GET(request())).status).toBe(503);
  expect(mock.check).not.toHaveBeenCalled();
});
it("configuration alone does not establish readiness", async () => {
  mock.check.mockResolvedValue(false);
  const response = await GET(request());
  expect(response.status).toBe(503);
  expect(response.headers.get("cache-control")).toBe("no-store");
});
it("requires a positive live adapter probe", async () => {
  mock.check.mockResolvedValue(true);
  const response = await GET(request());
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({ data: { status: "ready" } });
});
it("sanitizes provider failures", async () => {
  mock.check.mockRejectedValue(new Error("private provider details"));
  const response = await GET(request());
  expect(response.status).toBe(503);
  expect(await response.text()).not.toContain("private");
});
it("bounds probe time", async () => {
  vi.useFakeTimers(); mock.check.mockImplementation(() => new Promise(() => undefined));
  const responsePromise = GET(request());
  await vi.advanceTimersByTimeAsync(2000);
  expect((await responsePromise).status).toBe(503);
});
it("recovers only after a subsequent positive probe", async () => {
  mock.check.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
  expect((await GET(request())).status).toBe(503);
  expect((await GET(request())).status).toBe(200);
});
it("does not report ready without trusted ingress configuration", async () => {
  vi.stubEnv("AUTH_TRUSTED_PROXY_VERIFIED", "false");
  mock.check.mockResolvedValue(true);
  expect((await GET(request())).status).toBe(503);
  expect(mock.check).not.toHaveBeenCalled();
});
