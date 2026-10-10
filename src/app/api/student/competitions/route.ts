import { studentRead, studentMutation } from "@/server/api/student-handler";
import { competitionDirectory, competitionLeaderboard, overallLeaderboard, participate } from "@/server/competition/service";
import { participationSchema } from "@/server/competition/validation";
export const GET = studentRead((user, request) => {
 const query = new URL(request.url).searchParams;
 if (query.get("overall") === "true") return overallLeaderboard(user, query.get("page") ?? 1);
 const id = query.get("id"); return id === null ? competitionDirectory(user) : competitionLeaderboard(user, id, query.get("page") ?? 1);
});
export const POST = studentMutation(participationSchema, participate);
