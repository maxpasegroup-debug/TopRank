import { studentRead } from "@/server/api/student-handler";
import { getSiaGuidance } from "@/server/sia/service";
export const GET = studentRead(getSiaGuidance);
