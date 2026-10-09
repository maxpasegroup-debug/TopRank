import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AUTH_BODY_LIMIT_BYTES, AUTH_LIMITER_TIMEOUT_MS, enforceAuthRateLimit, readAuthJson, requireAuthOrigin } from "@/server/auth/request-security";

const mock = vi.hoisted(() => ({ limiter: null as null | { consume: ReturnType<typeof vi.fn> } }));
vi.mock("@/server/auth/rate-limit", () => ({ get authRateLimiter() { return mock.limiter; } }));

function request(headers: Record<string, string | undefined> = {}, body = "{}") {
  const requestHeaders = new Headers({ "content-type": "application/json" });
  for (const [key, value] of Object.entries(headers)) {
    if (value !== undefined) requestHeaders.set(key, value);
  }
  return new Request("http://localhost/api/auth/login", {
    method: "POST", headers: requestHeaders, body,
  });
}

beforeEach(() => {
  vi.stubEnv("APP_URL", "https://toprank.test");
  vi.stubEnv("NODE_ENV", "test");
  mock.limiter = null;
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe("auth origin policy", () => {
  it("accepts exact configured origin even behind a proxy", () => {
    expect(() => requireAuthOrigin(request({ origin: "https://toprank.test" }))).not.toThrow();
  });
  it("accepts a same-origin Referer when Origin is absent", () => {
    expect(() => requireAuthOrigin(request({ referer: "https://toprank.test/settings?tab=account" }))).not.toThrow();
  });
  it.each([{}, { origin: "null" }, { origin: "garbage" }, { origin: "https://evil.test" },
    { origin: "https://toprank.test.evil.test" }, { origin: "http://toprank.test" },
    { origin: "https://toprank.test:444" }, { origin: "https://toprank.test/path" },
    { origin: "https://user@toprank.test" }, { referer: "https://evil.test" },
    { origin: "https://evil.test", referer: "https://toprank.test/" },
    { origin: "https://toprank.test", "sec-fetch-site": "cross-site" },
    { origin: "https://evil.test", "x-forwarded-host": "evil.test", "x-forwarded-proto": "https" },
  ])("rejects unsafe source headers %j", (headers) => {
    expect(() => requireAuthOrigin(request(headers))).toThrow("Request origin is not allowed");
  });
  it.each(["", "invalid", "http://toprank.test", "https://user:password@toprank.test"])(
    "fails closed for invalid production APP_URL %s", (value) => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("APP_URL", value);
      expect(() => requireAuthOrigin(request({ origin: "https://toprank.test" }))).toThrow("Authentication is temporarily unavailable");
    },
  );
  it("allows development origin from request URL only when APP_URL is absent", () => {
    vi.stubEnv("APP_URL", "");
    expect(() => requireAuthOrigin(request({ origin: "http://localhost" }))).not.toThrow();
  });
});

describe("bounded auth JSON reads", () => {
  it("accepts valid JSON at the byte limit", async () => {
    const body = JSON.stringify({ value: "a".repeat(AUTH_BODY_LIMIT_BYTES - 12) });
    expect(Buffer.byteLength(body)).toBe(AUTH_BODY_LIMIT_BYTES);
    expect(await readAuthJson(request({}, body))).toEqual(JSON.parse(body));
  });
  it.each([{}, { "content-length": "1" }, { "content-length": "4097" }])(
    "rejects oversized bodies regardless of advertised length %j", async (headers) => {
      await expect(readAuthJson(request(headers, "a".repeat(4097)))).rejects.toMatchObject({ status: 413 });
    },
  );
  it("counts UTF-8 bytes, not characters", async () => {
    await expect(readAuthJson(request({}, JSON.stringify({ value: "\u00e9".repeat(2048) })))).rejects.toMatchObject({ status: 413 });
  });
  it("rejects streamed chunked overflow and cancels the stream", async () => {
    const cancel = vi.fn();
    let reads = 0;
    const body = new ReadableStream<Uint8Array>({
      pull(controller) { controller.enqueue(new Uint8Array(++reads === 1 ? 4096 : 1)); }, cancel,
    });
    const req = new Request("http://localhost/api/auth/login", {
      method: "POST", headers: { "content-type": "application/json" }, body, duplex: "half",
    } as RequestInit);
    await expect(readAuthJson(req)).rejects.toMatchObject({ status: 413 });
    expect(cancel).toHaveBeenCalledOnce();
  });
  it.each(["", "{", '{"password":"secret",}', "undefined"])("rejects malformed JSON safely %j", async (body) => {
    await expect(readAuthJson(request({}, body))).rejects.toMatchObject({ status: 400, message: "Request validation failed" });
  });
  it.each([{ "content-type": "text/plain" }, { "content-type": "application/x-www-form-urlencoded" },
    { "content-encoding": "gzip" }])("rejects unsupported body formats %j", async (headers) => {
    await expect(readAuthJson(request(headers))).rejects.toMatchObject({ status: 415 });
  });
  it("rejects malformed Content-Length", async () => {
    await expect(readAuthJson(request({ "content-length": "-1" }))).rejects.toMatchObject({ status: 400 });
  });
  it("rejects malformed UTF-8 before JSON parsing", async () => {
    const req = new Request("http://localhost/api/auth/login", {
      method: "POST", headers: { "content-type": "application/json" }, body: new Uint8Array([0xff]),
    });
    await expect(readAuthJson(req)).rejects.toMatchObject({ status: 400, message: "Request validation failed" });
  });
});

describe("shared rate-limit gate (adapter mocked only)", () => {
  it("fails closed in production without approved shared infrastructure", async () => {
    vi.stubEnv("NODE_ENV", "production");
    await expect(enforceAuthRateLimit("login")).rejects.toMatchObject({ status: 503 });
    await expect(enforceAuthRateLimit("signup")).rejects.toMatchObject({ status: 503 });
  });
  it("keeps development flows available with no rate limiting claim", async () => {
    vi.stubEnv("NODE_ENV", "development");
    await expect(enforceAuthRateLimit("login")).resolves.toBeUndefined();
  });
  it("cannot bypass invalid explicitly activated configuration in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("AUTH_RATE_LIMIT_ACTIVATED", "true");
    await expect(enforceAuthRateLimit("login")).rejects.toMatchObject({ status: 503 });
  });
  it("fails closed during adapter outage and recovers", async () => {
    const consume = vi.fn().mockRejectedValueOnce(new Error("private infrastructure detail")).mockResolvedValueOnce({ allowed: true });
    mock.limiter = { consume };
    await expect(enforceAuthRateLimit("login")).rejects.toMatchObject({ status: 503, message: "Authentication is temporarily unavailable" });
    await expect(enforceAuthRateLimit("login")).resolves.toBeUndefined();
  });
  it("fails closed within a bounded time if the adapter hangs", async () => {
    vi.useFakeTimers();
    mock.limiter = { consume: vi.fn(() => new Promise(() => undefined)) };
    const assertion = expect(enforceAuthRateLimit("login")).rejects.toMatchObject({ status: 503 });
    await vi.advanceTimersByTimeAsync(AUTH_LIMITER_TIMEOUT_MS);
    await assertion;
    expect(vi.getTimerCount()).toBe(0);
  });
  it.each([null, {}, { allowed: false, retryAfterSeconds: 0 }, { allowed: false, retryAfterSeconds: Infinity }])(
    "fails closed for malformed adapter decision %j", async (decision) => {
      mock.limiter = { consume: vi.fn().mockResolvedValue(decision) };
      await expect(enforceAuthRateLimit("login")).rejects.toMatchObject({ status: 503 });
    },
  );
});
