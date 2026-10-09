import { apiOk, getRequestId, handleApiError } from "@/server/api/responses";
import { listSupportedExams } from "@/server/student/service";

export async function GET(request: Request) {
  const requestId = getRequestId(request);

  try {
    return apiOk({ exams: await listSupportedExams() }, requestId);
  } catch (error) {
    return handleApiError(error, requestId);
  }
}
