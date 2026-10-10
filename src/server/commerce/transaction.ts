import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/server/db";
import { ConflictApiError } from "@/server/api/errors";
export type Tx = Prisma.TransactionClient;
export async function atomic<T>(work: (tx: Tx) => Promise<T>): Promise<T> {
 for (let i = 0; i < 3; i++) {
   try { return await prisma.$transaction(work, { isolationLevel: "Serializable" }); }
   catch (e) { if (!(e instanceof Prisma.PrismaClientKnownRequestError) || !["P2002", "P2034"].includes(e.code)) throw e; }
 }
 throw new ConflictApiError("Concurrent update. Reload and retry.");
}
export async function audit(tx: Tx, actorId: string, entityId: string, action: string, detail?: string) {
 await tx.auditEvent.create({ data: { actorId, entity: "COMMERCE", entityId, action, detail } });
}
