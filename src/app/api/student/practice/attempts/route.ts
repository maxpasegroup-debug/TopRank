import { studentRead, studentMutation } from "@/server/api/student-handler";
import { submitPracticeAnswer, getPracticeHistory } from "@/server/practice/service";
import { answerSchema } from "@/server/practice/validation";
export const GET = studentRead(getPracticeHistory);
export const POST = studentMutation(answerSchema, submitPracticeAnswer);
