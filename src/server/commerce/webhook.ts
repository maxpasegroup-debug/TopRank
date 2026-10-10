import { ApiError, ValidationApiError } from "@/server/api/errors";
import { apiOk, getRequestId, handleApiError } from "@/server/api/responses";
import { configuredCommerceProvider, paymentUnavailable, type CommerceProvider } from "./provider";
import { processEvent } from "./service";
export async function rawWebhook(request: Request) {
 if (request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() !== "application/json" ||
   ![null, "identity"].includes(request.headers.get("content-encoding"))) throw new ValidationApiError();
 const length = request.headers.get("content-length");
 if (length !== null && (!/^\d+$/.test(length) || Number(length) > 32768)) throw new ApiError(413, "PAYLOAD_TOO_LARGE", "Request body is too large");
 if (!request.body) throw new ValidationApiError();
 const reader = request.body.getReader(), chunks: Uint8Array[] = []; let size = 0;
 try {
   while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength;
     if (size > 32768) { void reader.cancel().catch(() => undefined); throw new ApiError(413, "PAYLOAD_TOO_LARGE", "Request body is too large"); } chunks.push(value); }
   return Buffer.concat(chunks, size);
 } finally { reader.releaseLock(); }
}
export function webhookHandler(providerFactory: () => CommerceProvider | null = configuredCommerceProvider) {
 return async (request: Request) => {
   const requestId = getRequestId(request);
   try {
     const provider = providerFactory(); if (!provider) throw paymentUnavailable();
     const raw = await rawWebhook(request); const event = provider.verify(raw, request.headers);
     return apiOk(await processEvent(event, provider), requestId, { headers: { "Cache-Control": "no-store" } });
   } catch (e) { return handleApiError(e, requestId); }
 };
}
