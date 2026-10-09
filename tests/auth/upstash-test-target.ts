import { createHash } from "node:crypto";
import { readUpstashRestConfig } from "@/server/auth/upstash-rest";

export function verifyUpstashTestTarget(env: Record<string, string | undefined>) {
  if (env.AUTH_RATE_LIMIT_TEST_TARGET !== "dedicated-upstash-free" || env.AUTH_RATE_LIMIT_ACTIVATED === "true") {
    throw new Error("Dedicated inactive Free-tier test target confirmation required");
  }
  const config = readUpstashRestConfig(env);
  const digest = createHash("sha256").update(config.endpoint).digest("hex");
  if (env.AUTH_RATE_LIMIT_TEST_ENDPOINT_SHA256 !== digest) throw new Error("Test endpoint identity confirmation required");
  return config;
}
