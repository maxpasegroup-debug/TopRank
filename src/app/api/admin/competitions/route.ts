import { adminRead, adminMutation } from "@/server/api/admin-handler";
import { adminCompetitionData, adminCompetitionMutation } from "@/server/competition/service";
import { adminCompetitionSchema } from "@/server/competition/validation";
export const GET = adminRead(adminCompetitionData);
export const POST = adminMutation(adminCompetitionSchema, adminCompetitionMutation, 16384);
