import { studentRead, studentMutation } from "@/server/api/student-handler";
import { getMockRevision, mutateMockRevision } from "@/server/mock/service";
import { revisionSchema } from "@/server/mock/validation";
export const GET = studentRead(getMockRevision);
export const POST = studentMutation(revisionSchema, mutateMockRevision);
