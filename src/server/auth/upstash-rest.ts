import type { RedisScriptExecutor } from "./redis-rate-limit";

export type UpstashRestConfig = { endpoint: string; token: string; timeoutMs: number };
export const UPSTASH_RESPONSE_LIMIT_BYTES = 4096;

function unavailable() { return new Error("Limiter unavailable"); }

export function readUpstashRestConfig(env: Record<string, string | undefined>, timeoutMs = 1500): UpstashRestConfig {
  const endpoint = env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN;
  // Pin the official REST host pattern; no ports, paths, userinfo, queries,
  // fragments, redirects, alternate hosts or local/private destinations.
  if (!endpoint || !/^https:\/\/[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.upstash\.io\/?$/i.test(endpoint) ||
      !token || !/^[\x21-\x7e]+$/.test(token) || token.length > 4096 ||
      !Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 1800) throw unavailable();
  return { endpoint: new URL(endpoint).origin, token, timeoutMs };
}

export function createUpstashRestExecutor(input: UpstashRestConfig, fetcher: typeof fetch = fetch): RedisScriptExecutor {
  const config = readUpstashRestConfig({ UPSTASH_REDIS_REST_URL: input.endpoint, UPSTASH_REDIS_REST_TOKEN: input.token }, input.timeoutMs);
  return {
    async eval(script, keys, args, parentSignal) {
      const controller = new AbortController();
      let timer: ReturnType<typeof setTimeout> | undefined;
      let activeReader: ReadableStreamDefaultReader<Uint8Array> | undefined;
      let responseBody: ReadableStream<Uint8Array> | null = null;
      controller.signal.addEventListener("abort", () => {
        if (activeReader) void activeReader.cancel().catch(() => undefined);
        else void responseBody?.cancel().catch(() => undefined);
      }, { once: true });
      const abort = () => controller.abort();
      parentSignal.addEventListener("abort", abort, { once: true });
      try {
        if (parentSignal.aborted) throw unavailable();
        const operation = async () => {
          const response = await fetcher(config.endpoint, {
            method: "POST", redirect: "error", cache: "no-store", credentials: "omit",
            headers: { Authorization: `Bearer ${config.token}`, "content-type": "application/json", accept: "application/json" },
            // EVAL script numkeys key... arg..., per Redis command ordering.
            body: JSON.stringify(["EVAL", script, keys.length, ...keys, ...args]), signal: controller.signal,
          });
          responseBody = response.body;
          if (response.status !== 200 || response.redirected ||
              response.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() !== "application/json" || !response.body) throw unavailable();
          const length = response.headers.get("content-length");
          if (length !== null && (!/^\d+$/.test(length) || Number(length) > UPSTASH_RESPONSE_LIMIT_BYTES)) throw unavailable();
          const reader = response.body.getReader();
          activeReader = reader;
          const chunks: Uint8Array[] = [];
          let size = 0;
          try {
            while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              size += value.byteLength;
              if (size > UPSTASH_RESPONSE_LIMIT_BYTES) throw unavailable();
              chunks.push(value);
            }
            const bytes = new Uint8Array(size);
            let offset = 0;
            for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
            const envelope: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
            if (!envelope || typeof envelope !== "object" || Array.isArray(envelope) ||
                Object.keys(envelope).length !== 1 || !Object.prototype.hasOwnProperty.call(envelope, "result")) throw unavailable();
            // These two limiter scripts return exactly two integers; reject all
            // other Redis result types even though REST supports them generally.
            const result = (envelope as { result: unknown }).result;
            if (!Array.isArray(result) || result.length !== 2 || ![0, 1].includes(result[0]) ||
                !Number.isSafeInteger(result[1]) || result[1] < 0 || result[1] > 86400000 ||
                (result[0] === 1 ? result[1] !== 0 : result[1] === 0)) throw unavailable();
            return result;
          } finally {
            void reader.cancel().catch(() => undefined);
            reader.releaseLock();
            activeReader = undefined;
          }
        };
        return await Promise.race([
          operation(),
          new Promise<never>((_, reject) => {
            timer = setTimeout(() => { controller.abort(); reject(unavailable()); }, config.timeoutMs);
          }),
          new Promise<never>((_, reject) => {
            if (controller.signal.aborted) { reject(unavailable()); return; }
            controller.signal.addEventListener("abort", () => reject(unavailable()), { once: true });
          }),
        ]);
      } catch {
        // No URL, provider body, fetch exception, credential or cause escapes.
        throw unavailable();
      } finally {
        clearTimeout(timer);
        parentSignal.removeEventListener("abort", abort);
        controller.abort();
      }
    },
  };
}
