import { studentRead, studentMutation } from "@/server/api/student-handler";
import { listStudentMocks, getMockAttempt, mutateMock } from "@/server/mock/service";
import { mockMutationSchema } from "@/server/mock/validation";
export const GET = studentRead((user, request) => {
 const id = new URL(request.url).searchParams.get("attemptId");
 return id === null ? listStudentMocks(user) : getMockAttempt(user, id);
});
export const POST = studentMutation(mockMutationSchema, mutateMock);
