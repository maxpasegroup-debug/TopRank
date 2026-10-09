import { apiOk, getRequestId, handleApiError } from "@/server/api/responses";
import { getCurrentUser } from "@/server/auth/session";
import { AuthenticationApiError } from "@/server/api/errors";
import { getStudentProfile, updateStudentProfile } from "@/server/student/service";
import { studentProfileUpdateSchema } from "@/server/student/validation";

export async function GET(request: Request) {
  const requestId = getRequestId(request);

  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new AuthenticationApiError();
    }

    return apiOk({ profile: await getStudentProfile(user) }, requestId);
  } catch (error) {
    return handleApiError(error, requestId);
  }
}

export async function PUT(request: Request) {
  const requestId = getRequestId(request);

  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new AuthenticationApiError();
    }

    const input = studentProfileUpdateSchema.parse(await request.json());

    return apiOk({ profile: await updateStudentProfile(user, input) }, requestId);
  } catch (error) {
    return handleApiError(error, requestId);
  }
}
