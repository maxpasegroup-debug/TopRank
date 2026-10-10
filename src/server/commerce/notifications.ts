import { prisma } from "@/server/db";
import type { MessageProvider } from "@/server/integrations/providers";
import { atomic, type Tx } from "./transaction";
export const templates = {
 ORDER_CREATED: "Order {reference} is pending payment.", PAYMENT_CAPTURED: "Payment verified for order {reference}. Access is available until {date}.",
 PAYMENT_FAILED: "Payment was not completed for order {reference}.", REFUND_UPDATED: "Refund {reference}: {status}.",
 GRANT_CREATED: "Access grant {reference} is available until {date}.", ACCESS_REVOKED: "Access grant {reference} was revoked.",
 EXPIRING: "Access grant {reference} expires on {date}.",
} as const;
export type Template = keyof typeof templates;
export type NotificationTransport = MessageProvider & { readonly idempotentSend?: true };
async function bounded<T>(work: Promise<T>) {
 let timer: ReturnType<typeof setTimeout> | undefined;
 try { return await Promise.race([work, new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error("Transport timeout")), 5000); })]); }
 finally { clearTimeout(timer); }
}
export function render(template: Template, values: Record<string, string>) {
 return templates[template].replace(/\{([a-z]+)\}/g, (_, key: string) => {
   const value = values[key]; if (!value || value.length > 128 || /[<>\r\n]/.test(value)) throw new Error("Invalid template variables"); return value;
 });
}
export async function notify(tx: Tx, userId: string, eventKey: string, template: Template, values: Record<string, string>) {
 const message = render(template, values);
 const preference = await tx.notificationPreference.findUnique({ where: { userId } });
 const channels = ["IN_APP", ...(preference?.email ? ["EMAIL"] : []), ...(preference?.whatsapp ? ["WHATSAPP"] : [])];
 for (const channel of channels) await tx.commerceNotification.upsert({ where: { userId_eventKey_channel: { userId, eventKey, channel } },
   create: { userId, eventKey, channel, template, message, status: channel === "IN_APP" ? "AVAILABLE" : "PENDING" }, update: {} });
}
export function retryDelay(attempts: number) { return Math.min(3600000, 1000 * 2 ** Math.min(attempts, 12)); }
// Provider acceptance is not delivery. Stable record IDs are send idempotency keys.
export async function dispatchNotifications(providers: Partial<Record<"EMAIL" | "WHATSAPP", NotificationTransport>> = {}) {
 const now = new Date();
 const records = await prisma.commerceNotification.findMany({ where: { channel: { not: "IN_APP" }, status: { in: ["PENDING", "RETRY", "BLOCKED", "ACCEPTED"] },
   nextAttemptAt: { lte: now }, OR: [{ leaseUntil: null }, { leaseUntil: { lt: now } }] }, orderBy: { createdAt: "asc" }, take: 25 });
 let processed = 0;
 for (const record of records) {
   const claimed = await prisma.commerceNotification.updateMany({ where: { id: record.id, attempts: record.attempts, status: record.status,
     OR: [{ leaseUntil: null }, { leaseUntil: { lt: now } }] }, data: { leaseUntil: new Date(now.getTime() + 60000), attempts: { increment: 1 } } });
   if (!claimed.count) continue;
   const channel = record.channel as "EMAIL" | "WHATSAPP";
   const [preference, user] = await Promise.all([prisma.notificationPreference.findUnique({ where: { userId: record.userId } }),
     prisma.user.findUnique({ where: { id: record.userId }, select: { email: true, phone: true, status: true } })]);
   let status = "BLOCKED", errorCode: string | null = "PROVIDER_UNAVAILABLE", providerMessageId = record.providerMessageId;
   // WhatsApp requires a separately verified contact/consent contract; a phone field alone is insufficient.
   if (user?.status !== "ACTIVE" || !preference?.[channel === "EMAIL" ? "email" : "whatsapp"]) { status = "SUPPRESSED"; errorCode = "CONSENT_WITHDRAWN"; }
   else if (channel === "EMAIL" && providers.EMAIL?.idempotentSend === true) {
     try {
       if (providerMessageId) { const delivery = await bounded(providers.EMAIL.delivery(providerMessageId));
         if (!["PENDING", "DELIVERED", "FAILED"].includes(delivery)) throw new Error("Invalid delivery state"); status = delivery === "PENDING" ? "ACCEPTED" : delivery; }
       else { const sent = await bounded(providers.EMAIL.send({ recipient: user.email, template: record.message, requestKey: record.id }));
         if (sent.status !== "ACCEPTED" || !sent.messageId || sent.messageId.length > 128) throw new Error("Invalid acceptance"); providerMessageId = sent.messageId; status = "ACCEPTED"; }
       errorCode = null;
     } catch { status = record.attempts >= 4 ? "FAILED" : "RETRY"; errorCode = "TRANSPORT_FAILURE"; }
   }
   await prisma.commerceNotification.updateMany({ where: { id: record.id, attempts: record.attempts + 1 }, data: { status, errorCode, providerMessageId,
     leaseUntil: null, nextAttemptAt: new Date(Date.now() + retryDelay(record.attempts + 1)) } }); processed++;
 }
 return { processed };
}
export async function expiryReminders() {
 return atomic(async (tx) => {
   const records = await tx.entitlement.findMany({ where: { status: "ACTIVE", startsAt: { lte: new Date() },
     endsAt: { gt: new Date(), lte: new Date(Date.now() + 7 * 86400000) } }, take: 100 });
   for (const e of records) await notify(tx, e.userId, `expiry:${e.id}`, "EXPIRING", { reference: e.id, date: e.endsAt.toISOString().slice(0, 10) });
   return { checked: records.length };
 });
}
