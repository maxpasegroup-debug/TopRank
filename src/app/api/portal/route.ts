import { getCurrentUser } from "@/server/auth/session";
import { AuthenticationApiError, ValidationApiError } from "@/server/api/errors";
import { apiOk, getRequestId, handleApiError } from "@/server/api/responses";
import { readAuthJson, requireAuthOrigin } from "@/server/auth/request-security";
import { portalQuerySchema } from "@/server/portal/validation";
import { readPortal, mutatePortal } from "@/server/portal/service";
export async function GET(request: Request) {
 const id = getRequestId(request);
 try {
   const user = await getCurrentUser(); if (!user) throw new AuthenticationApiError();
   const params = new URL(request.url).searchParams;
   for (const key of params.keys()) if (params.getAll(key).length !== 1) throw new ValidationApiError();
   const query = portalQuerySchema.parse(Object.fromEntries(params));
   return apiOk(await readPortal(user, query), id, { headers: { "Cache-Control": "no-store" } });
 } catch (error) { const response = handleApiError(error, id); response.headers.set("Cache-Control", "no-store"); return response; }
}
export async function POST(request: Request) {
 const id = getRequestId(request);
 try {
   const user = await getCurrentUser(); if (!user) throw new AuthenticationApiError();
   requireAuthOrigin(request);
   return apiOk(await mutatePortal(user, await readAuthJson(request) as Parameters<typeof mutatePortal>[1]), id, { headers: { "Cache-Control": "no-store" } });
 } catch (error) { const response = handleApiError(error, id); response.headers.set("Cache-Control", "no-store"); return response; }
}
