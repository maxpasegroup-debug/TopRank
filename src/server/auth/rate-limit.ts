export type AuthAction = "login" | "signup";

export type AuthRateLimitDecision =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

export interface AuthRateLimiter {
  // Implement atomically in shared storage, with bounded keys/TTL and a timeout.
  consume(action: AuthAction, identity?: AuthRateLimitIdentity): Promise<AuthRateLimitDecision>;
  check(): Promise<boolean>;
}

export type AuthRateLimitIdentity = { client: string; account: string };

// Operator activation, live verification and ingress attestation are required.
// Every configured consume also requires a live readiness probe; no local fallback.
export const authRateLimiter: AuthRateLimiter | null = createConfiguredAuthRateLimiter(process.env);
import { createConfiguredAuthRateLimiter } from "./configured-rate-limit";
