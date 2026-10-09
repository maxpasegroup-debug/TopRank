import { studentMutation, studentRead } from "@/server/api/student-handler";
import { updateStudySession, getCurrentStudySession } from "@/server/journey/service";
import { sessionSchema } from "@/server/journey/validation";
export const POST = studentMutation(sessionSchema, updateStudySession);
export const GET = studentRead(getCurrentStudySession);
