import { adminRead, adminMutation } from "@/server/api/admin-handler";
import { adminCommerceData, adminCommerceMutation } from "@/server/commerce/service";
import { adminCommerceSchema } from "@/server/commerce/validation";
export const GET = adminRead(adminCommerceData);
export const POST = adminMutation(adminCommerceSchema, adminCommerceMutation, 16384);
