import { AuthenticationApiError } from "@/server/api/errors";
import { apiOk, getRequestId, handleApiError } from "@/server/api/responses";
import { getCurrentUser } from "@/server/auth/session";
import { listQuestionsForSubject, requireStudentQuestionAccess } from "@/server/question/service";
import { parseQuestionFilters, questionSlugParamSchema } from "@/server/question/validation";

export async function GET(request: Request, context: { params: Promise<{ subjectSlug: string }> }) {
  const requestId = getRequestId(request);

  try {
    const user = await getCurrentUser();
    if (!user) throw new AuthenticationApiError();
    requireStudentQuestionAccess(user);

    const { subjectSlug } = questionSlugParamSchema.required({ subjectSlug: true }).parse(await context.params);

    return apiOk(await listQuestionsForSubject(subjectSlug, parseQuestionFilters(request.url)), requestId);
  } catch (error) {
    return handleApiError(error, requestId);
  }
}
