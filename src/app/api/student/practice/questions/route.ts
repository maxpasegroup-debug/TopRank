import { AuthenticationApiError } from "@/server/api/errors";
import { apiOk, getRequestId, handleApiError } from "@/server/api/responses";
import { getCurrentUser } from "@/server/auth/session";
import { listQuestions, requireStudentQuestionAccess } from "@/server/question/service";
import { parseQuestionFilters } from "@/server/question/validation";

export async function GET(request: Request) {
  const requestId = getRequestId(request);

  try {
    const user = await getCurrentUser();
    if (!user) throw new AuthenticationApiError();
    requireStudentQuestionAccess(user);

    return apiOk({ questions: await listQuestions(parseQuestionFilters(request.url)) }, requestId);
  } catch (error) {
    return handleApiError(error, requestId);
  }
}
