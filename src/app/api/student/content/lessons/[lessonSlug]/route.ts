import { AuthenticationApiError } from "@/server/api/errors";
import { apiOk, getRequestId, handleApiError } from "@/server/api/responses";
import { getCurrentUser } from "@/server/auth/session";
import { getLessonDetail, requireStudentContentAccess } from "@/server/content/service";
import { slugParamSchema } from "@/server/content/validation";

export async function GET(request: Request, context: { params: Promise<{ lessonSlug: string }> }) {
  const requestId = getRequestId(request);

  try {
    const user = await getCurrentUser();
    if (!user) throw new AuthenticationApiError();
    requireStudentContentAccess(user);

    const { lessonSlug } = slugParamSchema.required({ lessonSlug: true }).parse(await context.params);

    return apiOk({ lesson: await getLessonDetail(lessonSlug) }, requestId);
  } catch (error) {
    return handleApiError(error, requestId);
  }
}
