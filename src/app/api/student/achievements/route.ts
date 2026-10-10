import { studentRead, studentMutation } from "@/server/api/student-handler";
import { getAchievements, mutateAchievement } from "@/server/competition/achievements";
import { achievementSchema } from "@/server/competition/validation";
export const GET = studentRead(getAchievements);
export const POST = studentMutation(achievementSchema, mutateAchievement);
