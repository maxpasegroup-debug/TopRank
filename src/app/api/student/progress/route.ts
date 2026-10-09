import { studentRead } from "@/server/api/student-handler";
import { getVerifiedProgress } from "@/server/journey/service";
export const GET = studentRead(getVerifiedProgress);
