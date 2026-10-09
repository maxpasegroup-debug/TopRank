import { randomBytes, randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { AUTH_LIMIT_SCRIPT, createRedisRateLimiter, readRedisLimiterConfig, type RedisScriptExecutor } from "@/server/auth/redis-rate-limit";
import { createUpstashRestExecutor } from "@/server/auth/upstash-rest";
import { verifyUpstashTestTarget } from "./upstash-test-target";

// Opt-in ONLY. Do not load .env automatically or access auth routes/PostgreSQL.
describe.skipIf(process.env.RUN_UPSTASH_LIVE_TESTS !== "true")("dedicated Upstash Free sandbox (LIVE)", () => {
  it("verifies Lua allowance, denial, concurrency, identity isolation, TTL, probe and recovery", async () => {
    const target = verifyUpstashTestTarget(process.env); // Before the first request.
    const namespace = `live_${randomUUID().replace(/-/g, "")}`;
    const config = readRedisLimiterConfig({ AUTH_RATE_LIMIT_NAMESPACE: namespace,
      AUTH_RATE_LIMIT_KEY_SECRET: randomBytes(32).toString("hex"), AUTH_SIGNUP_GLOBAL_LIMIT: "2",
      AUTH_LOGIN_GLOBAL_LIMIT: "3", AUTH_LOGIN_ACCOUNT_CLIENT_LIMIT: "1" });
    for (const budgets of Object.values(config.budgets)) {
      for (const budget of Object.values(budgets)) budget.windowMs = 10000;
    }
    const transport = createUpstashRestExecutor(target);
    const keys = new Set<string>();
    const executor: RedisScriptExecutor = { eval(script, incoming, args, signal) {
      incoming.forEach((key) => keys.add(key));
      return transport.eval(script, incoming, args, signal);
    } };
    const a = createRedisRateLimiter(executor, config);
    const b = createRedisRateLimiter(executor, config);
    expect(await a.check()).toBe(true);
    expect(await a.consume("signup")).toEqual({ allowed: true });
    expect(await a.consume("signup")).toEqual({ allowed: true });
    const denial = await a.consume("signup");
    expect(denial.allowed).toBe(false);
    if (!denial.allowed) expect(denial.retryAfterSeconds).toBeGreaterThan(0);
    const concurrent = await Promise.all(Array.from({ length: 8 }, (_, i) => (i % 2 ? a : b).consume("login")));
    expect(concurrent.filter((decision) => decision.allowed)).toHaveLength(3);
    const identity = { client: "192.0.2.1", account: "synthetic@example.invalid" };
    expect(await a.consume("login", identity)).toEqual({ allowed: true });
    expect((await b.consume("login", { ...identity, account: " SYNTHETIC@EXAMPLE.INVALID " })).allowed).toBe(false);
    expect(await a.consume("login", { ...identity, client: "192.0.2.2" })).toEqual({ allowed: true });
    expect([...keys].every((key) => key.startsWith(`toprank:auth:{${namespace}}:v1:`))).toBe(true);
    expect([...keys].some((key) => key.includes(identity.account) || key.includes(identity.client))).toBe(false);
    // Inspect ONLY exact captured namespace keys; no SCAN/KEYS/DEL/FLUSH commands.
    const inspect = `for _, key in ipairs(KEYS) do
      if redis.call('EXISTS', key) ~= 1 or redis.call('PTTL', key) <= 0 or redis.call('PTTL', key) > 10000 then return {0, 1} end
    end return {1, 0}`;
    expect(await a.check()).toBe(true);
    expect(await transport.eval(inspect, [...keys], [], new AbortController().signal)).toEqual([1, 0]);
    const invalid = createRedisRateLimiter(createUpstashRestExecutor({ ...target, token: "deliberately-invalid-test-token" }), config);
    expect(await invalid.check()).toBe(false);
    await expect(invalid.consume("signup")).rejects.toThrow("Limiter unavailable");
    expect(await a.check()).toBe(true);
    await new Promise((resolve) => setTimeout(resolve, 10500));
    expect(await a.consume("signup")).toEqual({ allowed: true });
    expect(await transport.eval(`for _, key in ipairs(KEYS) do
      if redis.call('EXISTS', key) ~= 0 then return {0, 1} end
    end return {1, 0}`, [...keys].filter((key) => !key.endsWith(":signup:global")), [], new AbortController().signal)).toEqual([1, 0]);
    // The only newly created key also expires in 10 seconds. No cleanup deletion.
    expect(AUTH_LIMIT_SCRIPT).toContain("PEXPIRE");
  }, 45000);
});
