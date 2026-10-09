import { studentMutation, studentRead } from "@/server/api/student-handler";
import { helpSchema, createHelpRequest, listHelpRequests } from "@/server/help/service";
export const GET = studentRead(listHelpRequests);
export const POST = studentMutation(helpSchema, createHelpRequest);
