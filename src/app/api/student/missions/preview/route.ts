import { studentRead } from "@/server/api/student-handler";
import { previewJourneyPlan } from "@/server/journey/service";
export const GET = studentRead((user) => previewJourneyPlan(user));
