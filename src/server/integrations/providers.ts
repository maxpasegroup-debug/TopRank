// Contracts only: never infer a connected integration from a nonempty API key.
export type Teacher = { id: string; name: string; subjects: string[] };
export interface TeachXProvider {
  teachers(query: { subject?: string }): Promise<Teacher[]>;
  book(input: { teacherId: string; slotId: string; requestKey: string }): Promise<{ bookingId: string; status: "PENDING" | "CONFIRMED" }>;
}
export interface PaymentProvider {
  checkout(input: { orderId: string; amountMinor: number; currency: string; requestKey: string }): Promise<{ checkoutId: string; url: string }>;
  verifyWebhook(rawBody: Uint8Array, headers: Headers): Promise<{ eventId: string; orderId: string; amountMinor: number; currency: string; status: "PAID" | "FAILED" | "REFUNDED" }>;
}
export interface MessageProvider {
  send(input: { recipient: string; template: string; requestKey: string }): Promise<{ messageId: string; status: "ACCEPTED" }>;
  delivery(messageId: string): Promise<"PENDING" | "DELIVERED" | "FAILED">;
}
export interface SiaProvider {
  suggest(context: { goal: string | null; remainingTasks: { title: string; minutes: number }[] },
    limits: { maxOutputTokens: number; timeoutMs: number }): Promise<string>;
}
export const integrationAvailability = {
  teachX: { available: false, reason: "Verified API contract and sandbox access required" },
  payments: { available: false, reason: "Provider, commercial terms and sandbox verification required" },
  email: { available: false, reason: "Provider contract and delivery verification required" },
  whatsapp: { available: false, reason: "Provider contract, consent and delivery verification required" },
  siaAI: { available: false, reason: "Provider, privacy review and cost limits required" },
} as const;
