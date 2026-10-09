CREATE TYPE "HelpRequestStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED');
CREATE TABLE "HelpRequest" (
  "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL, "requestKey" TEXT NOT NULL,
  "subject" TEXT NOT NULL, "message" TEXT NOT NULL, "status" "HelpRequestStatus" NOT NULL DEFAULT 'OPEN',
  "response" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "HelpRequest_userId_requestKey_key" ON "HelpRequest"("userId", "requestKey");
CREATE INDEX "HelpRequest_userId_createdAt_idx" ON "HelpRequest"("userId", "createdAt");
CREATE INDEX "HelpRequest_status_createdAt_idx" ON "HelpRequest"("status", "createdAt");
CREATE TABLE "AuditEvent" (
  "id" TEXT PRIMARY KEY, "actorId" TEXT NOT NULL, "action" TEXT NOT NULL,
  "entity" TEXT NOT NULL, "entityId" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "AuditEvent_entity_entityId_createdAt_idx" ON "AuditEvent"("entity", "entityId", "createdAt");
CREATE INDEX "AuditEvent_actorId_createdAt_idx" ON "AuditEvent"("actorId", "createdAt");
