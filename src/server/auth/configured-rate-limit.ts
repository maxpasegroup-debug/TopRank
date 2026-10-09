import type { AuthRateLimiter } from "./rate-limit";
import { createRedisRateLimiter, readRedisLimiterConfig } from "./redis-rate-limit";
import { createUpstashRestExecutor, readUpstashRestConfig } from "./upstash-rest";

export function createConfiguredAuthRateLimiter(env: Record<string, string | undefined>, fetcher: typeof fetch = fetch): AuthRateLimiter | null {
  // Credentials/sandbox success never enable authentication by themselves.
  if (env.AUTH_RATE_LIMIT_ACTIVATED !== "true" || env.AUTH_RATE_LIMIT_LIVE_VERIFIED !== "true" ||
      env.AUTH_TRUSTED_PROXY_VERIFIED !== "true" || env.AUTH_TRUSTED_CLIENT_HEADER !== "x-toprank-client-ip") return null;
  try {
    const url = new URL(env.APP_URL ?? "");
    if (url.protocol !== "https:" || url.username || url.password) return null;
    const config = readRedisLimiterConfig(env);
    // Probe + decision together fit inside the existing two-second outer gate.
    const operationMs = Math.max(1, Math.floor(config.timeoutMs / 2));
    const executor = createUpstashRestExecutor(readUpstashRestConfig(env, operationMs), fetcher);
    const limiter = createRedisRateLimiter(executor, { ...config, timeoutMs: operationMs });
    return {
      check: () => limiter.check(),
      async consume(action, identity) {
        if (!await limiter.check()) throw new Error("Limiter unavailable");
        return limiter.consume(action, identity);
      },
    };
  } catch { return null; }
}
