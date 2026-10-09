import { AuthenticationApiError } from "@/server/api/errors";
import { apiOk, getRequestId, handleApiError } from "@/server/api/responses";
import { getCurrentUser } from "@/server/auth/session";
import { getOnboardingStatus } from "@/server/student/service";

export async function GET(request: Request) {
  const requestId = getRequestId(request);

  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new AuthenticationApiError();
    }

    return apiOk(await getOnboardingStatus(user), requestId);
  } catch (error) {
    return handleApiError(error, requestId);
  }
}
