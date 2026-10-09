import { createHmac } from "node:crypto";
import type { AuthAction, AuthRateLimiter, AuthRateLimitIdentity } from "./rate-limit";
import { normalizeAccount, normalizeClient } from "./rate-limit-identity";

export interface RedisScriptExecutor {
  // Transport must use TLS, respect AbortSignal for connection/read cancellation,
  // decode Redis results, and NEVER retry an ambiguous mutating command.
  eval(script: string, keys: string[], args: string[], signal: AbortSignal): Promise<unknown>;
}

type Budget = { limit: number; windowMs: number };
export type RedisLimiterConfig = {
  namespace: string;
  keySecret: string;
  timeoutMs: number;
  budgets: Record<AuthAction, { global: Budget; client: Budget; accountClient: Budget }>;
};

// Each EVAL is atomic. Read/check all buckets before creating new identity keys;
// denied traffic cannot prolong a lockout or grow counters without bound.
export const AUTH_LIMIT_SCRIPT = `
local retry = 0
for i, key in ipairs(KEYS) do
  local count = tonumber(redis.call('GET', key) or '0')
  local ttl = redis.call('PTTL', key)
  if count == nil or count < 0 or (count > 0 and ttl < 0) then
    return redis.error_reply('invalid limiter state')
  end
  if count >= tonumber(ARGV[(i - 1) * 2 + 1]) then
    retry = math.max(retry, math.max(1, ttl))
  end
end
if retry > 0 then return {0, retry} end
for i, key in ipairs(KEYS) do
  local count = redis.call('INCR', key)
  if count == 1 then redis.call('PEXPIRE', key, ARGV[(i - 1) * 2 + 2]) end
end
return {1, 0}
`;

// Readiness exercises script permissions, writes and TTL (not only PING).
export const AUTH_PROBE_SCRIPT = `
redis.call('SET', KEYS[1], '1', 'PX', 5000)
local value = redis.call('GET', KEYS[1])
local ttl = redis.call('PTTL', KEYS[1])
if value == '1' and ttl > 0 then return {1, 0} end
return redis.error_reply('limiter probe failed')
`;

function integer(value: string | undefined, fallback: number, max: number) {
  if (value === undefined) return fallback;
  if (!/^[1-9]\d*$/.test(value)) throw new Error("Invalid limiter configuration");
  const result = Number(value);
  if (!Number.isSafeInteger(result) || result > max) throw new Error("Invalid limiter configuration");
  return result;
}

export function readRedisLimiterConfig(env: Record<string, string | undefined>): RedisLimiterConfig {
  const namespace = env.AUTH_RATE_LIMIT_NAMESPACE;
  const keySecret = env.AUTH_RATE_LIMIT_KEY_SECRET;
  if (!namespace || !/^[a-zA-Z0-9_-]{1,64}$/.test(namespace) || !keySecret || Buffer.byteLength(keySecret) < 32) {
    throw new Error("Invalid limiter configuration");
  }
  const budgets = {} as RedisLimiterConfig["budgets"];
  for (const action of ["signup", "login"] as const) {
    const prefix = `AUTH_${action.toUpperCase()}`;
    budgets[action] = {
      global: { limit: integer(env[`${prefix}_GLOBAL_LIMIT`], action === "signup" ? 100 : 1000, 100000),
        windowMs: integer(env[`${prefix}_GLOBAL_WINDOW_SECONDS`], 60, 86400) * 1000 },
      client: { limit: integer(env[`${prefix}_CLIENT_LIMIT`], action === "signup" ? 10 : 60, 10000),
        windowMs: integer(env[`${prefix}_CLIENT_WINDOW_SECONDS`], 900, 86400) * 1000 },
      accountClient: { limit: integer(env[`${prefix}_ACCOUNT_CLIENT_LIMIT`], action === "signup" ? 3 : 10, 1000),
        windowMs: integer(env[`${prefix}_ACCOUNT_CLIENT_WINDOW_SECONDS`], 900, 86400) * 1000 },
    };
  }
  return { namespace, keySecret, budgets, timeoutMs: integer(env.AUTH_RATE_LIMIT_TIMEOUT_MS, 1500, 1800) };
}

export function createRedisRateLimiter(executor: RedisScriptExecutor, input: RedisLimiterConfig): AuthRateLimiter {
  // Validate programmatic configuration too; detach from caller mutations.
  const config = structuredClone(input);
  if (typeof config.namespace !== "string" || !/^[a-zA-Z0-9_-]{1,64}$/.test(config.namespace) ||
      typeof config.keySecret !== "string" || Buffer.byteLength(config.keySecret) < 32 ||
      !Number.isInteger(config.timeoutMs) || config.timeoutMs < 1 || config.timeoutMs > 1800) {
    throw new Error("Invalid limiter configuration");
  }
  for (const action of ["signup", "login"] as const) {
    for (const kind of ["global", "client", "accountClient"] as const) {
      const budget = config.budgets?.[action]?.[kind];
      const maximum = kind === "global" ? 100000 : kind === "client" ? 10000 : 1000;
      if (!budget || !Number.isSafeInteger(budget.limit) || budget.limit < 1 || budget.limit > maximum ||
          !Number.isSafeInteger(budget.windowMs) || budget.windowMs < 1000 || budget.windowMs > 86400000) {
        throw new Error("Invalid limiter configuration");
      }
    }
  }
  const prefix = `toprank:auth:{${config.namespace}}:v1`;
  const digest = (domain: string, value: string) => createHmac("sha256", config.keySecret).update(JSON.stringify([domain, value])).digest("hex");

  async function execute(script: string, keys: string[], budgets: Budget[]) {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const result = await Promise.race([
        executor.eval(script, keys, budgets.flatMap((budget) => [String(budget.limit), String(budget.windowMs)]), controller.signal),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => { controller.abort(); reject(new Error("Limiter unavailable")); }, config.timeoutMs);
        }),
      ]);
      if (!Array.isArray(result) || result.length !== 2 || ![0, 1].includes(result[0]) ||
          !Number.isSafeInteger(result[1]) || result[1] < 0 || result[1] > 86400000 ||
          (result[0] === 1 ? result[1] !== 0 : result[1] === 0)) throw new Error();
      return result as [number, number];
    } catch {
      throw new Error("Limiter unavailable");
    } finally {
      clearTimeout(timer);
      controller.abort();
    }
  }

  return {
    async consume(action: AuthAction, identity?: AuthRateLimitIdentity) {
      const budget = config.budgets[action];
      let keys = [`${prefix}:${action}:global`];
      let budgets = [budget.global];
      if (identity) {
        // trustedClient already canonicalizes networks; normalize again for direct callers.
        const client = identity.client.endsWith("::/64")
          ? normalizeClient(identity.client.slice(0, -3)) : normalizeClient(identity.client);
        const account = normalizeAccount(identity.account);
        keys = [`${prefix}:${action}:client:${digest("client", client)}`,
          `${prefix}:${action}:pair:${digest("pair", JSON.stringify([client, account]))}`];
        budgets = [budget.client, budget.accountClient];
      }
      const [allowed, retryMs] = await execute(AUTH_LIMIT_SCRIPT, keys, budgets);
      return allowed === 1 ? { allowed: true } : { allowed: false, retryAfterSeconds: Math.ceil(retryMs / 1000) };
    },
    async check() {
      try {
        const [allowed] = await execute(AUTH_PROBE_SCRIPT, [`${prefix}:readiness`], []);
        return allowed === 1;
      } catch { return false; }
    },
  };
}
