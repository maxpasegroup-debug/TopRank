import { createHmac, timingSafeEqual, createHash } from "node:crypto";
import { z } from "zod";
import { ApiError, ValidationApiError } from "@/server/api/errors";
export type ProviderPayment = { id: string; orderId: string; amountMinor: number; refundedMinor: number; currency: string; status: "created" | "captured" | "failed" | "authorized" | "refunded"; capturedAt: Date | null };
export type ProviderRefund = { id: string; paymentId: string; amountMinor: number; status: "pending" | "processed" | "failed" };
export type VerifiedEvent = { id: string; digest: string; kind: string; orderId: string; paymentId: string; refundId?: string };
export interface CommerceProvider {
 readonly name: string;
 createOrder(input: { orderId: string; amountMinor: number; currency: string }): Promise<{ id: string; amountMinor: number; currency: string }>;
 payment(id: string): Promise<ProviderPayment>;
 verify(raw: Uint8Array, headers: Headers): VerifiedEvent;
 refund(input: { paymentId: string; amountMinor: number; requestKey: string }): Promise<ProviderRefund>;
 refundStatus(paymentId: string, refundId: string): Promise<ProviderRefund>;
}
export const paymentUnavailable = () => new ApiError(503, "PAYMENTS_DISABLED", "Payment processing is unavailable");
// No environment variable activates commerce. Controlled staging wiring is a separate task.
export function configuredCommerceProvider(): CommerceProvider | null { return null; }
const paymentEntity = z.object({ id: z.string().regex(/^pay_[A-Za-z0-9]+$/), order_id: z.string().regex(/^order_[A-Za-z0-9]+$/),
 amount: z.number().int().positive().max(100000000), amount_refunded: z.number().int().nonnegative().max(100000000), currency: z.literal("INR"), status: z.enum(["created", "captured", "failed", "authorized", "refunded"]),
 captured: z.boolean(), created_at: z.number().int().positive() });
const refundEntity = z.object({ id: z.string().regex(/^rfnd_[A-Za-z0-9]+$/), payment_id: z.string().regex(/^pay_[A-Za-z0-9]+$/),
 amount: z.number().int().positive().max(100000000), status: z.enum(["pending", "processed", "failed"]) });
export function validSignature(raw: Uint8Array, signature: string | null, secret: string) {
 if (!signature || !/^[a-f0-9]{64}$/.test(signature) || !secret) return false;
 return timingSafeEqual(Buffer.from(signature, "hex"), createHmac("sha256", secret).update(raw).digest());
}
export class RazorpayTestProvider implements CommerceProvider {
 readonly name = "RAZORPAY" as const;
 constructor(private readonly config: { keyId: string; keySecret: string; webhookSecret: string; accountId: string }, private readonly transport: typeof fetch = fetch) {
   if (!/^rzp_test_[A-Za-z0-9]+$/.test(config.keyId) || !config.keySecret || !config.webhookSecret || !/^acc_[A-Za-z0-9]+$/.test(config.accountId)) throw paymentUnavailable();
 }
 private async api(path: string, method = "GET", data?: object, extra?: Record<string, string>) {
   const abort = new AbortController(); const timer = setTimeout(() => abort.abort(), 5000);
   try {
     const r = await this.transport(`https://api.razorpay.com/v1/${path}`, { method, signal: abort.signal, redirect: "error",
       headers: { Authorization: `Basic ${Buffer.from(`${this.config.keyId}:${this.config.keySecret}`).toString("base64")}`, "Content-Type": "application/json", ...extra },
       body: data ? JSON.stringify(data) : undefined });
     if (!r.ok) throw paymentUnavailable();
     if (!r.body) throw paymentUnavailable();
     const reader = r.body.getReader(), chunks: Uint8Array[] = []; let size = 0;
     try {
       while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength;
         if (size > 1048576) { void reader.cancel().catch(() => undefined); throw paymentUnavailable(); } chunks.push(value); }
       return JSON.parse(Buffer.concat(chunks, size).toString("utf8")) as unknown;
     } finally { reader.releaseLock(); }
   } catch { throw paymentUnavailable(); } finally { clearTimeout(timer); }
 }
 async createOrder(input: { orderId: string; amountMinor: number; currency: string }) {
   if (!Number.isInteger(input.amountMinor) || input.amountMinor <= 0 || input.amountMinor > 100000000 || input.currency !== "INR" || !/^[A-Za-z0-9_-]{1,40}$/.test(input.orderId)) throw new ValidationApiError();
   const response = z.object({ id: z.string().regex(/^order_[A-Za-z0-9]+$/), amount: z.number().int(), currency: z.literal("INR"), receipt: z.string() }).parse(
     await this.api("orders", "POST", { amount: input.amountMinor, currency: input.currency, receipt: input.orderId, partial_payment: false }));
   if (response.receipt !== input.orderId || response.amount !== input.amountMinor) throw paymentUnavailable();
   return { id: response.id, amountMinor: response.amount, currency: response.currency };
 }
 async payment(id: string): Promise<ProviderPayment> {
   if (!/^pay_[A-Za-z0-9]+$/.test(id)) throw new ValidationApiError();
   const p = paymentEntity.parse(await this.api(`payments/${id}`));
   if (p.id !== id || p.captured !== ["captured", "refunded"].includes(p.status) || p.amount_refunded > p.amount) throw paymentUnavailable();
   // Razorpay created_at is payment creation, not a capture timestamp. Use server verification time.
   return { id: p.id, orderId: p.order_id, amountMinor: p.amount, refundedMinor: p.amount_refunded, currency: p.currency, status: p.status, capturedAt: p.status === "captured" ? new Date() : null };
 }
 verify(raw: Uint8Array, headers: Headers): VerifiedEvent {
   if (!validSignature(raw, headers.get("x-razorpay-signature"), this.config.webhookSecret)) throw new ApiError(401, "INVALID_SIGNATURE", "Invalid payment signature");
   const eventId = headers.get("x-razorpay-event-id");
   if (!eventId || !/^[A-Za-z0-9_-]{1,128}$/.test(eventId)) throw new ValidationApiError();
   let body: unknown;
   try { body = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(raw)); } catch { throw new ValidationApiError("Invalid payment event"); }
   const parsed = z.object({ account_id: z.literal(this.config.accountId), event: z.enum(["payment.captured", "payment.failed", "refund.processed", "refund.failed", "refund.created"]),
     payload: z.object({ payment: z.object({ entity: paymentEntity }).optional(), refund: z.object({ entity: refundEntity }).optional() }) }).safeParse(body);
   if (!parsed.success) throw new ValidationApiError("Invalid payment event");
   const envelope = parsed.data;
   const p = envelope.payload.payment?.entity, r = envelope.payload.refund?.entity;
   if (envelope.event.startsWith("payment.") && (!p || p.status !== envelope.event.split(".")[1] || p.captured !== (p.status === "captured"))) throw new ValidationApiError();
   if (envelope.event.startsWith("refund.") && (!r || (envelope.event !== "refund.created" && r.status !== envelope.event.split(".")[1]))) throw new ValidationApiError();
   if (p && r && p.id !== r.payment_id) throw new ValidationApiError();
   return { id: eventId, digest: createHash("sha256").update(raw).digest("hex"), kind: envelope.event,
     orderId: p?.order_id ?? "", paymentId: r?.payment_id ?? p!.id, refundId: r?.id };
 }
 async refund(input: { paymentId: string; amountMinor: number; requestKey: string }) {
   if (!/^pay_[A-Za-z0-9]+$/.test(input.paymentId) || !Number.isInteger(input.amountMinor) || input.amountMinor <= 0 || input.amountMinor > 100000000 || !/^[A-Za-z0-9_-]{1,40}$/.test(input.requestKey)) throw new ValidationApiError();
   const r = refundEntity.parse(await this.api(`payments/${input.paymentId}/refund`, "POST", { amount: input.amountMinor, speed: "normal", receipt: input.requestKey }, { "X-Refund-Idempotency": input.requestKey }));
   if (r.payment_id !== input.paymentId || r.amount !== input.amountMinor) throw paymentUnavailable();
   return { id: r.id, paymentId: r.payment_id, amountMinor: r.amount, status: r.status };
 }
 async refundStatus(paymentId: string, refundId: string) {
   if (!/^pay_[A-Za-z0-9]+$/.test(paymentId) || !/^rfnd_[A-Za-z0-9]+$/.test(refundId)) throw new ValidationApiError();
   const r = refundEntity.parse(await this.api(`payments/${paymentId}/refunds/${refundId}`));
   if (r.payment_id !== paymentId || r.id !== refundId) throw paymentUnavailable();
   return { id: r.id, paymentId: r.payment_id, amountMinor: r.amount, status: r.status };
 }
}
