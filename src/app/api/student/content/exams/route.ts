import { AuthenticationApiError } from "@/server/api/errors";
import { apiOk, getRequestId, handleApiError } from "@/server/api/responses";
import { getCurrentUser } from "@/server/auth/session";
import { listPublishedExams, requireStudentContentAccess } from "@/server/content/service";

export async function GET(request: Request) {
  const requestId = getRequestId(request);

  try {
    const user = getCurrentUser ? await getCurrentUser() : null;
    if (!user) throw new AuthenticationApiError();
    requireStudentContentAccess(user);

    return apiOk({ exams: await listPublishedExams() }, requestId);
  } catch (error) {
    return handleApiError(error, requestId);
  }
}
