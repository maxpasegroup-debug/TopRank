import { studentRead, studentMutation } from "@/server/api/student-handler";
import { commerceHome, studentCommerceMutation } from "@/server/commerce/service";
import { studentCommerceSchema } from "@/server/commerce/validation";
export const GET = studentRead(commerceHome);
export const POST = studentMutation(studentCommerceSchema, studentCommerceMutation);
