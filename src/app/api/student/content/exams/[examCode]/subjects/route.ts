import { AuthenticationApiError } from "@/server/api/errors";
import { apiOk, getRequestId, handleApiError } from "@/server/api/responses";
import { getCurrentUser } from "@/server/auth/session";
import { listSubjectsForExam, requireStudentContentAccess } from "@/server/content/service";
import { codeParamSchema } from "@/server/content/validation";

export async function GET(request: Request, context: { params: Promise<{ examCode: string }> }) {
  const requestId = getRequestId(request);

  try {
    const user = await getCurrentUser();
    if (!user) throw new AuthenticationApiError();
    requireStudentContentAccess(user);

    const { examCode } = codeParamSchema.parse(await context.params);

    return apiOk(await listSubjectsForExam(examCode), requestId);
  } catch (error) {
    return handleApiError(error, requestId);
  }
}
