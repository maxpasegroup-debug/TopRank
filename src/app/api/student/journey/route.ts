import { studentMutation, studentRead } from "@/server/api/student-handler";
import { getJourney, saveJourney } from "@/server/journey/service";
import { journeySchema } from "@/server/journey/validation";
export const GET = studentRead(getJourney);
export const PUT = studentMutation(journeySchema, saveJourney);
