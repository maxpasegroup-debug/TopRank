import { z } from "zod";
import { studentMutation, studentRead } from "@/server/api/student-handler";
import { updateLearningProgress, getLearningProgress } from "@/server/journey/service";
import { learningProgressSchema } from "@/server/journey/validation";
export const PUT = studentMutation(learningProgressSchema, updateLearningProgress);
export const GET = studentRead((user, request) => getLearningProgress(user,
  z.string().min(1).max(100).parse(new URL(request.url).searchParams.get("lessonId"))));
