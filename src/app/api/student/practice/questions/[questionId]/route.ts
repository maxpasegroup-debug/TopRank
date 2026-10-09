import { AuthenticationApiError } from "@/server/api/errors";
import { apiOk, getRequestId, handleApiError } from "@/server/api/responses";
import { getCurrentUser } from "@/server/auth/session";
import { getQuestion, requireStudentQuestionAccess } from "@/server/question/service";
import { parseQuestionFilters, questionIdParamSchema } from "@/server/question/validation";

export async function GET(request: Request, context: { params: Promise<{ questionId: string }> }) {
  const requestId = getRequestId(request);

  try {
    const user = await getCurrentUser();
    if (!user) throw new AuthenticationApiError();
    requireStudentQuestionAccess(user);

    const { questionId } = questionIdParamSchema.parse(await context.params);

    return apiOk({ question: await getQuestion(questionId, parseQuestionFilters(request.url)) }, requestId);
  } catch (error) {
    return handleApiError(error, requestId);
  }
}
