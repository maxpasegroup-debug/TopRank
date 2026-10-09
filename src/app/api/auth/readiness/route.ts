import { ApiError } from "@/server/api/errors";
import { apiFailure, apiOk, getRequestId } from "@/server/api/responses";
import { authRateLimiter } from "@/server/auth/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestId = getRequestId(request);
  let ready = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const url = new URL(process.env.APP_URL ?? "");
    const configured = url.protocol === "https:" && !url.username && !url.password &&
      process.env.AUTH_TRUSTED_PROXY_VERIFIED === "true" &&
      process.env.AUTH_TRUSTED_CLIENT_HEADER === "x-toprank-client-ip";
    if (configured && authRateLimiter) {
      ready = await Promise.race([
        authRateLimiter.check(),
        new Promise<false>((resolve) => { timer = setTimeout(() => resolve(false), 2000); }),
      ]) === true;
    }
  } catch { ready = false; } finally { clearTimeout(timer); }
  const response = ready
    ? apiOk({ status: "ready" }, requestId)
    : apiFailure(new ApiError(503, "AUTH_UNAVAILABLE", "Authentication is temporarily unavailable"), requestId);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
