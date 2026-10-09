import { studentMutation, studentRead } from "@/server/api/student-handler";
import { changeMissionTask, confirmJourneyPlan, getMissionBoard } from "@/server/journey/service";
import { planSchema, taskSchema } from "@/server/journey/validation";
export const GET = studentRead(getMissionBoard);
export const POST = studentMutation(planSchema, confirmJourneyPlan);
export const PATCH = studentMutation(taskSchema, changeMissionTask);
