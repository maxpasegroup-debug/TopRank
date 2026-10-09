import { afterEach, describe, expect, it, vi } from "vitest";
import { AUTH_LIMIT_SCRIPT, AUTH_PROBE_SCRIPT, createRedisRateLimiter, readRedisLimiterConfig, type RedisScriptExecutor } from "@/server/auth/redis-rate-limit";
import { normalizeAccount, normalizeClient, trustedClient } from "@/server/auth/rate-limit-identity";

const env = { AUTH_RATE_LIMIT_NAMESPACE: "test", AUTH_RATE_LIMIT_KEY_SECRET: "test-only-secret-not-for-production-12345" };
const identity = { client: "192.0.2.1", account: "Student@example.com" };

// Test-only serialized simulation of Redis semantics. Does NOT execute Lua or
// verify real provider atomicity, replication, TTL behavior or TLS.
function simulatedRedis() {
  const records = new Map<string, { count: number; expires: number }>();
  let time = 0;
  const evalMock = vi.fn(async (script: string, keys: string[], args: string[]) => {
    if (script === AUTH_PROBE_SCRIPT) return [1, 0];
    expect(script).toBe(AUTH_LIMIT_SCRIPT);
    let retry = 0;
    keys.forEach((key, index) => {
      const record = records.get(key);
      if (record && record.expires <= time) records.delete(key);
      const current = records.get(key);
      if (current && current.count >= Number(args[index * 2])) retry = Math.max(retry, current.expires - time);
    });
    if (retry) return [0, retry];
    keys.forEach((key, index) => {
      const record = records.get(key);
      records.set(key, { count: (record?.count ?? 0) + 1, expires: record?.expires ?? time + Number(args[index * 2 + 1]) });
    });
    return [1, 0];
  });
  return { executor: { eval: evalMock } as RedisScriptExecutor, evalMock, records, advance: (ms: number) => { time += ms; } };
}
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });

describe("provider-neutral Redis adapter (mock transport only)", () => {
  it("shares concurrent decisions across two simulated instances", async () => {
    const shared = simulatedRedis();
    const config = readRedisLimiterConfig({ ...env, AUTH_LOGIN_GLOBAL_LIMIT: "5" });
    const a = createRedisRateLimiter(shared.executor, config);
    const b = createRedisRateLimiter(shared.executor, config);
    const decisions = await Promise.all(Array.from({ length: 20 }, (_, i) => (i % 2 ? a : b).consume("login")));
    expect(decisions.filter((decision) => decision.allowed)).toHaveLength(5);
    expect(decisions.filter((decision) => !decision.allowed)).toHaveLength(15);
    expect([...shared.records.values()][0].count).toBe(5);
  });
  it("uses independent signup and login budgets", async () => {
    const shared = simulatedRedis();
    const limiter = createRedisRateLimiter(shared.executor, readRedisLimiterConfig({ ...env, AUTH_SIGNUP_GLOBAL_LIMIT: "1", AUTH_LOGIN_GLOBAL_LIMIT: "2" }));
    expect(await limiter.consume("signup")).toEqual({ allowed: true });
    expect(await limiter.consume("signup")).toEqual({ allowed: false, retryAfterSeconds: 60 });
    expect(await limiter.consume("login")).toEqual({ allowed: true });
    expect(await limiter.consume("login")).toEqual({ allowed: true });
    expect(await limiter.consume("login")).toEqual({ allowed: false, retryAfterSeconds: 60 });
  });
  it("rounds remaining TTL upward and denied attempts do not extend the window", async () => {
    const shared = simulatedRedis();
    const limiter = createRedisRateLimiter(shared.executor, readRedisLimiterConfig({ ...env, AUTH_LOGIN_GLOBAL_LIMIT: "1" }));
    await limiter.consume("login");
    shared.advance(1001);
    expect(await limiter.consume("login")).toEqual({ allowed: false, retryAfterSeconds: 59 });
    shared.advance(58999);
    expect(await limiter.consume("login")).toEqual({ allowed: true });
  });
  it("shares normalized account/client pairs without locking an account across clients", async () => {
    const shared = simulatedRedis();
    const limiter = createRedisRateLimiter(shared.executor, readRedisLimiterConfig({ ...env, AUTH_LOGIN_ACCOUNT_CLIENT_LIMIT: "1" }));
    expect(await limiter.consume("login", identity)).toEqual({ allowed: true });
    expect(await limiter.consume("login", { ...identity, account: " STUDENT@EXAMPLE.COM " })).toEqual({ allowed: false, retryAfterSeconds: 900 });
    expect(await limiter.consume("login", { ...identity, client: "192.0.2.2" })).toEqual({ allowed: true });
  });
  it("client limits also constrain attempts against varying accounts", async () => {
    const shared = simulatedRedis();
    const limiter = createRedisRateLimiter(shared.executor, readRedisLimiterConfig({ ...env, AUTH_LOGIN_CLIENT_LIMIT: "1" }));
    await limiter.consume("login", identity);
    expect(await limiter.consume("login", { ...identity, account: "other@example.com" })).toEqual({ allowed: false, retryAfterSeconds: 900 });
    expect(shared.records.size).toBe(2);
  });
  it("never sends raw identities or key secrets to Redis", async () => {
    const shared = simulatedRedis();
    const limiter = createRedisRateLimiter(shared.executor, readRedisLimiterConfig(env));
    await limiter.consume("login", identity);
    const call = JSON.stringify(shared.evalMock.mock.calls[0].slice(0, 3));
    expect(call).not.toContain(identity.account);
    expect(call).not.toContain(identity.client);
    expect(call).not.toContain(env.AUTH_RATE_LIMIT_KEY_SECRET);
    expect([...shared.records.keys()].every((key) => /:[a-f0-9]{64}$/.test(key))).toBe(true);
  });
  it("different deployments and HMAC secrets isolate keys", async () => {
    const shared = simulatedRedis();
    for (const overrides of [{}, { AUTH_RATE_LIMIT_NAMESPACE: "other" }, { AUTH_RATE_LIMIT_KEY_SECRET: "different-test-only-secret-long-enough" }]) {
      await createRedisRateLimiter(shared.executor, readRedisLimiterConfig({ ...env, ...overrides })).consume("login", identity);
    }
    expect(shared.records.size).toBe(6);
  });
  it.each([null, {}, [1], [2, 0], [1, 1], [0, 0], [0, -1], [0, 0.5], [0, 86400001], ["1", 0], { result: [1, 0] }])(
    "rejects malformed decoded provider response %j", async (response) => {
      const limiter = createRedisRateLimiter({ eval: vi.fn().mockResolvedValue(response) }, readRedisLimiterConfig(env));
      await expect(limiter.consume("login")).rejects.toThrow("Limiter unavailable");
      expect(await limiter.check()).toBe(false);
    },
  );
  it("sanitizes outage errors and recovers without cached allow decisions", async () => {
    const executor = { eval: vi.fn().mockRejectedValueOnce(new Error("private provider credential")).mockResolvedValue([1, 0]) };
    const limiter = createRedisRateLimiter(executor, readRedisLimiterConfig(env));
    await expect(limiter.consume("login")).rejects.toThrow("Limiter unavailable");
    expect(await limiter.consume("login")).toEqual({ allowed: true });
    expect(await limiter.check()).toBe(true);
  });
  it("aborts a timed-out transport and does not retry an ambiguous command", async () => {
    vi.useFakeTimers();
    let signal: AbortSignal | undefined;
    const executor = { eval: vi.fn((_script, _keys, _args, incoming) => { signal = incoming; return new Promise(() => undefined); }) };
    const limiter = createRedisRateLimiter(executor, readRedisLimiterConfig(env));
    const assertion = expect(limiter.consume("login")).rejects.toThrow("Limiter unavailable");
    await vi.advanceTimersByTimeAsync(1500);
    await assertion;
    expect(signal?.aborted).toBe(true);
    expect(executor.eval).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("readiness exercises a bounded write/TTL script without consuming auth budgets", async () => {
    const shared = simulatedRedis();
    const limiter = createRedisRateLimiter(shared.executor, readRedisLimiterConfig(env));
    expect(await limiter.check()).toBe(true);
    expect(shared.evalMock.mock.calls[0][0]).toBe(AUTH_PROBE_SCRIPT);
    expect(shared.records.size).toBe(0);
  });
  it.each([{}, { ...env, AUTH_RATE_LIMIT_KEY_SECRET: "short" }, { ...env, AUTH_RATE_LIMIT_NAMESPACE: "{bad}" },
    { ...env, AUTH_LOGIN_GLOBAL_LIMIT: "0" }, { ...env, AUTH_LOGIN_GLOBAL_LIMIT: "2.5" },
    { ...env, AUTH_RATE_LIMIT_TIMEOUT_MS: "2001" }, { ...env, AUTH_SIGNUP_CLIENT_WINDOW_SECONDS: "86401" },
  ])("rejects missing/invalid config rather than defaulting unsafe %j", (config) => {
    expect(() => readRedisLimiterConfig(config)).toThrow("Invalid limiter configuration");
  });
  it("rejects incomplete programmatic budgets", () => {
    const config = readRedisLimiterConfig(env);
    delete (config.budgets as Partial<typeof config.budgets>).signup;
    expect(() => createRedisRateLimiter(simulatedRedis().executor, config)).toThrow("Invalid limiter configuration");
  });
});

describe("limiter identity and ingress policy", () => {
  it("normalizes casing and surrounding whitespace", () => expect(normalizeAccount(" STUDENT@Example.com ")).toBe("student@example.com"));
  it("does not conflate provider-specific aliases", () => expect(normalizeAccount("student+tag@example.com")).toBe("student+tag@example.com"));
  it("normalizes equivalent IPv6 representations and /64 rotation", () => {
    expect(normalizeClient("2001:db8::1")).toBe(normalizeClient("2001:0DB8:0:0::2"));
  });
  it("unifies mapped IPv4 and IPv4", () => expect(normalizeClient("::ffff:192.0.2.1")).toBe(normalizeClient("192.0.2.1")));
  it.each(["", "192.0.2.1, 192.0.2.2", "unknown", "fe80::1%eth0"])("rejects invalid client identity %s", (value) => {
    expect(() => normalizeClient(value)).toThrow();
  });
  it("does not trust forwarding headers without an attested ingress", () => {
    vi.stubEnv("AUTH_TRUSTED_PROXY_VERIFIED", "false");
    expect(() => trustedClient(new Request("https://toprank.test", { headers: { "x-forwarded-for": "192.0.2.1", "x-toprank-client-ip": "192.0.2.1" } }))).toThrow();
  });
  it("reads only the reserved ingress header", () => {
    vi.stubEnv("AUTH_TRUSTED_PROXY_VERIFIED", "true");
    vi.stubEnv("AUTH_TRUSTED_CLIENT_HEADER", "x-toprank-client-ip");
    expect(trustedClient(new Request("https://toprank.test", { headers: { "x-forwarded-for": "192.0.2.2", "x-toprank-client-ip": "192.0.2.1" } }))).toBe("192.0.2.1");
  });
});
