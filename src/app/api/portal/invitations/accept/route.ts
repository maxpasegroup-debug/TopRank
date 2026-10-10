import { apiOk, getRequestId, handleApiError } from "@/server/api/responses";
import { AuthThrottleError, enforceAuthRateLimit, enforceAuthIdentityRateLimit, requireAuthOrigin, readAuthJson } from "@/server/auth/request-security";
import { inviteAcceptSchema } from "@/server/portal/validation";
import { acceptInvitation } from "@/server/portal/invitations";
export async function POST(request: Request) {
 const id = getRequestId(request);
 try {
   requireAuthOrigin(request); await enforceAuthRateLimit("signup");
   const input = inviteAcceptSchema.parse(await readAuthJson(request));
   await enforceAuthIdentityRateLimit("signup", request, input.email);
   return apiOk(await acceptInvitation(input), id, { headers: { "Cache-Control": "no-store" } });
 } catch (error) {
   const response = handleApiError(error, id); response.headers.set("Cache-Control", "no-store");
   if (error instanceof AuthThrottleError) response.headers.set("Retry-After", String(error.retryAfterSeconds)); return response;
 }
}
