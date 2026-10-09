import { adminRead, adminMutation } from "@/server/api/admin-handler";
import { listSupportQueue, helpResponseSchema, respondToHelp } from "@/server/operations/service";
export const GET = adminRead(listSupportQueue);
export const PATCH = adminMutation(helpResponseSchema, respondToHelp);
