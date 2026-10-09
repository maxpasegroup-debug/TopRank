import { afterEach, describe, expect, it, vi } from "vitest";
import { createUpstashRestExecutor, readUpstashRestConfig } from "@/server/auth/upstash-rest";
import { createConfiguredAuthRateLimiter } from "@/server/auth/configured-rate-limit";
import { AUTH_LIMIT_SCRIPT } from "@/server/auth/redis-rate-limit";
import { createHash } from "node:crypto";
import { verifyUpstashTestTarget } from "./upstash-test-target";

const env = { UPSTASH_REDIS_REST_URL: "https://test-only.upstash.io", UPSTASH_REDIS_REST_TOKEN: "test-only-token" };
const complete = { ...env, AUTH_RATE_LIMIT_ACTIVATED: "true", AUTH_RATE_LIMIT_LIVE_VERIFIED: "true",
  AUTH_TRUSTED_PROXY_VERIFIED: "true", AUTH_TRUSTED_CLIENT_HEADER: "x-toprank-client-ip", APP_URL: "https://toprank.test",
  AUTH_RATE_LIMIT_NAMESPACE: "test", AUTH_RATE_LIMIT_KEY_SECRET: "test-only-secret-not-for-production-12345" };
const reply = (result: unknown = [1, 0]) => Response.json({ result });
const execute = (fetcher: typeof fetch, signal = new AbortController().signal) =>
  createUpstashRestExecutor(readUpstashRestConfig(env), fetcher).eval(AUTH_LIMIT_SCRIPT, ["test-key"], ["2", "1000"], signal);
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe("Upstash REST transport (mock fetch only)", () => {
  it("uses POST EVAL array and Bearer auth without credentials in URL", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(reply());
    expect(await execute(fetcher)).toEqual([1, 0]);
    expect(fetcher).toHaveBeenCalledOnce();
    const [url, init] = fetcher.mock.calls[0];
    expect(url).toBe(env.UPSTASH_REDIS_REST_URL);
    expect(init).toMatchObject({ method: "POST", redirect: "error", cache: "no-store", credentials: "omit",
      headers: { Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`, "content-type": "application/json" } });
    expect(JSON.parse(init!.body as string)).toEqual(["EVAL", AUTH_LIMIT_SCRIPT, 1, "test-key", "2", "1000"]);
  });
  it("accepts valid denial TTL for the existing core to derive Retry-After", async () => {
    expect(await execute(vi.fn<typeof fetch>().mockResolvedValue(reply([0, 1001])))).toEqual([0, 1001]);
  });
  it.each([{}, { ...env, UPSTASH_REDIS_REST_TOKEN: "" }, { ...env, UPSTASH_REDIS_REST_TOKEN: "bad\ntoken" },
    ...["http://test-only.upstash.io", "https://evil.test", "https://test-only.upstash.io.evil.test",
      "https://user:pass@test-only.upstash.io", "https://test-only.upstash.io?token=secret", "https://test-only.upstash.io/path",
      "https://test-only.upstash.io#secret", "https://localhost", "https://test-only.upstash.io:444", "not-a-url"].map((url) => ({ ...env, UPSTASH_REDIS_REST_URL: url })),
  ])("rejects invalid configuration safely %j", (config) => {
    expect(() => readUpstashRestConfig(config)).toThrow("Limiter unavailable");
  });
  it.each([400, 401, 403, 429, 500, 503, 302])("rejects HTTP %s without retrying or exposing the body", async (status) => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ error: "private provider detail" }, { status }));
    await expect(execute(fetcher)).rejects.toThrow("Limiter unavailable");
    expect(fetcher).toHaveBeenCalledOnce();
  });
  it.each([{}, null, [], { error: "private detail" }, { result: [1, 0], error: "private detail" },
    { result: [1, 0], extra: true }, { result: "1" }, { result: [1] }, { result: [1, 1] },
    { result: [0, 0] }, { result: [0, -1] }, { result: [0, 86400001] }, { result: ["1", 0] },
  ])("rejects malformed envelopes/script results %j", async (body) => {
    await expect(execute(vi.fn<typeof fetch>().mockResolvedValue(Response.json(body)))).rejects.toThrow("Limiter unavailable");
  });
  it("rejects malformed JSON and non-JSON content", async () => {
    for (const response of [new Response("{", { headers: { "content-type": "application/json" } }), new Response("private text")]) {
      await expect(execute(vi.fn<typeof fetch>().mockResolvedValue(response))).rejects.toThrow("Limiter unavailable");
    }
  });
  it("caps actual response bytes even with a misleading Content-Length", async () => {
    const response = new Response("x".repeat(4097), { headers: { "content-type": "application/json", "content-length": "1" } });
    await expect(execute(vi.fn<typeof fetch>().mockResolvedValue(response))).rejects.toThrow("Limiter unavailable");
  });
  it("cancels a slow response body on timeout", async () => {
    vi.useFakeTimers();
    const cancel = vi.fn();
    const response = new Response(new ReadableStream({ cancel }), { headers: { "content-type": "application/json" } });
    const assertion = expect(execute(vi.fn<typeof fetch>().mockResolvedValue(response))).rejects.toThrow("Limiter unavailable");
    await vi.advanceTimersByTimeAsync(1500);
    await assertion;
    expect(cancel).toHaveBeenCalledOnce();
  });
  it("bounds even a hung fetch and aborts its signal", async () => {
    vi.useFakeTimers();
    const fetcher = vi.fn<typeof fetch>().mockImplementation(() => new Promise(() => undefined));
    const assertion = expect(execute(fetcher)).rejects.toThrow("Limiter unavailable");
    await vi.advanceTimersByTimeAsync(1500);
    await assertion;
    expect((fetcher.mock.calls[0][1]!.signal as AbortSignal).aborted).toBe(true);
    expect(fetcher).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("propagates caller cancellation and skips already-aborted requests", async () => {
    const controller = new AbortController(); controller.abort();
    const fetcher = vi.fn<typeof fetch>();
    await expect(execute(fetcher, controller.signal)).rejects.toThrow("Limiter unavailable");
    expect(fetcher).not.toHaveBeenCalled();
    const pending = new AbortController();
    fetcher.mockImplementation(() => new Promise(() => undefined));
    const assertion = expect(execute(fetcher, pending.signal)).rejects.toThrow("Limiter unavailable");
    pending.abort();
    await assertion;
  });
  it("sanitizes fetch/network exceptions and permits a later recovery", async () => {
    const fetcher = vi.fn<typeof fetch>().mockRejectedValueOnce(new Error("secret URL and credentials")).mockResolvedValue(reply());
    await expect(execute(fetcher)).rejects.toThrow("Limiter unavailable");
    expect(await execute(fetcher)).toEqual([1, 0]);
  });
});

describe("configured runtime activation (mock provider only)", () => {
  it("credentials alone never enable production authentication", () => {
    const fetcher = vi.fn<typeof fetch>();
    expect(createConfiguredAuthRateLimiter(env, fetcher)).toBeNull();
    expect(fetcher).not.toHaveBeenCalled();
  });
  it.each(["AUTH_RATE_LIMIT_ACTIVATED", "AUTH_RATE_LIMIT_LIVE_VERIFIED", "AUTH_TRUSTED_PROXY_VERIFIED",
    "AUTH_TRUSTED_CLIENT_HEADER", "APP_URL", "AUTH_RATE_LIMIT_NAMESPACE", "AUTH_RATE_LIMIT_KEY_SECRET",
    "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"])("fails closed when %s is missing", (key) => {
    expect(createConfiguredAuthRateLimiter({ ...complete, [key]: undefined }, vi.fn<typeof fetch>())).toBeNull();
  });
  it("requires successful readiness before any consume and rechecks after outage", async () => {
    const fetcher = vi.fn<typeof fetch>().mockRejectedValueOnce(new Error("private detail"));
    const limiter = createConfiguredAuthRateLimiter(complete, fetcher)!;
    await expect(limiter.consume("login")).rejects.toThrow("Limiter unavailable");
    expect(fetcher).toHaveBeenCalledOnce();
    fetcher.mockImplementation(async () => reply());
    expect(await limiter.consume("login")).toEqual({ allowed: true });
    expect(fetcher).toHaveBeenCalledTimes(3);
    const calls = fetcher.mock.calls.map(([, init]) => JSON.parse(init!.body as string)[1]);
    expect(calls[1]).not.toBe(AUTH_LIMIT_SCRIPT);
    expect(calls[2]).toBe(AUTH_LIMIT_SCRIPT);
  });
  it("uses the actual native-fetch transport factory and remains unavailable on probe errors", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ error: "invalid credentials" }, { status: 401 }));
    vi.stubGlobal("fetch", fetcher);
    const limiter = createConfiguredAuthRateLimiter(complete)!;
    expect(await limiter.check()).toBe(false);
    await expect(limiter.consume("signup")).rejects.toThrow("Limiter unavailable");
  });
  it("fails closed when readiness succeeds but the decision fails", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(reply())
      .mockResolvedValueOnce(Response.json({ error: "private detail" }, { status: 500 }));
    await expect(createConfiguredAuthRateLimiter(complete, fetcher)!.consume("login")).rejects.toThrow("Limiter unavailable");
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it("keeps the combined configured probe/decision deadline inside the outer gate", async () => {
    vi.useFakeTimers();
    let calls = 0;
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async () => {
      if (++calls === 1) { await new Promise((resolve) => setTimeout(resolve, 700)); return reply(); }
      return new Promise(() => undefined);
    });
    const assertion = expect(createConfiguredAuthRateLimiter(complete, fetcher)!.consume("login")).rejects.toThrow("Limiter unavailable");
    await vi.advanceTimersByTimeAsync(1450);
    await assertion;
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("live sandbox target gate (no network)", () => {
  const identified = { ...env, AUTH_RATE_LIMIT_TEST_TARGET: "dedicated-upstash-free",
    AUTH_RATE_LIMIT_TEST_ENDPOINT_SHA256: createHash("sha256").update(env.UPSTASH_REDIS_REST_URL).digest("hex") };
  it("requires target confirmation and fingerprint before returning transport config", () => {
    expect(verifyUpstashTestTarget(identified).timeoutMs).toBe(1500);
  });
  it.each([
    { ...env }, { ...identified, AUTH_RATE_LIMIT_TEST_TARGET: "production" },
    { ...identified, AUTH_RATE_LIMIT_TEST_ENDPOINT_SHA256: "wrong" },
    { ...identified, AUTH_RATE_LIMIT_ACTIVATED: "true" }, { ...identified, UPSTASH_REDIS_REST_TOKEN: undefined },
  ])("refuses unsafe or unidentified live targets %j", (config) => {
    expect(() => verifyUpstashTestTarget(config)).toThrow();
  });
});
