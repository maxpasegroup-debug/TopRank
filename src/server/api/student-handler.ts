import { z } from "zod";
import { AuthenticationApiError } from "./errors";
import { apiOk, getRequestId, handleApiError } from "./responses";
import { getCurrentUser } from "@/server/auth/session";
import { assertStudent } from "@/server/student/service";
import { readAuthJson, requireAuthOrigin } from "@/server/auth/request-security";
import type { AuthUser } from "@/server/auth/session";

export function studentRead(handler: (user: AuthUser, request: Request) => Promise<unknown>) {
  return async (request: Request) => {
    const requestId = getRequestId(request);
    try {
      const user = await getCurrentUser();
      if (!user) throw new AuthenticationApiError();
      assertStudent(user);
      const response = apiOk(await handler(user, request), requestId);
      response.headers.set("Cache-Control", "no-store");
      return response;
    } catch (error) { return handleApiError(error, requestId); }
  };
}

export function studentMutation<T extends z.ZodType>(schema: T, handler: (user: AuthUser, input: z.output<T>) => Promise<unknown>) {
  return async (request: Request) => {
    const requestId = getRequestId(request);
    try {
      const user = await getCurrentUser();
      if (!user) throw new AuthenticationApiError();
      assertStudent(user);
      requireAuthOrigin(request);
      return apiOk(await handler(user, schema.parse(await readAuthJson(request))), requestId, { headers: { "Cache-Control": "no-store" } });
    } catch (error) { return handleApiError(error, requestId); }
  };
}
