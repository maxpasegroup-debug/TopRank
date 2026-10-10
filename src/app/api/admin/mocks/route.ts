import { adminRead, adminMutation } from "@/server/api/admin-handler";
import { adminMocks, mutateAdminMock } from "@/server/mock/service";
import { adminMockSchema } from "@/server/mock/validation";
export const GET = adminRead((user, request) => adminMocks(user, new URL(request.url).searchParams.get("examId") ?? undefined));
// A 200-question blueprint exceeds the auth routes' unchanged 4 KiB default.
export const POST = adminMutation(adminMockSchema, mutateAdminMock, 32768);
