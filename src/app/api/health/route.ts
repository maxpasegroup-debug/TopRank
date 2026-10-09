import { apiOk, getRequestId, handleApiError } from "@/server/api/responses";
import { prisma } from "@/server/db";

export async function GET(request: Request) {
  const requestId = getRequestId(request);

  try {
    await prisma.$queryRaw`SELECT 1`;

    return apiOk({ status: "ok" }, requestId);
  } catch (error) {
    return handleApiError(error, requestId);
  }
}
