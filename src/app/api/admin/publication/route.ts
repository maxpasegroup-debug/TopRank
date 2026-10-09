import { adminRead, adminMutation } from "@/server/api/admin-handler";
import { entitySchema, publicationSchema, listPublicationRecords, changePublication } from "@/server/operations/service";
export const GET = adminRead((user, request) => listPublicationRecords(user, entitySchema.parse(new URL(request.url).searchParams.get("entity"))));
export const PATCH = adminMutation(publicationSchema, changePublication);
