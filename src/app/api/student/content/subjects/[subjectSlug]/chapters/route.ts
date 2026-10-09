import { AuthenticationApiError } from "@/server/api/errors";
import { apiOk, getRequestId, handleApiError } from "@/server/api/responses";
import { getCurrentUser } from "@/server/auth/session";
import { listChaptersForSubject, requireStudentContentAccess } from "@/server/content/service";
import { slugParamSchema } from "@/server/content/validation";

export async function GET(request: Request, context: { params: Promise<{ subjectSlug: string }> }) {
  const requestId = getRequestId(request);

  try {
    const user = await getCurrentUser();
    if (!user) throw new AuthenticationApiError();
    requireStudentContentAccess(user);

    const { subjectSlug } = slugParamSchema.required({ subjectSlug: true }).parse(await context.params);

    return apiOk(await listChaptersForSubject(subjectSlug), requestId);
  } catch (error) {
    return handleApiError(error, requestId);
  }
}
