import { adminMutation } from "@/server/api/admin-handler";
import { examCreateSchema, createExam } from "@/server/operations/service";
export const POST = adminMutation(examCreateSchema, createExam);
