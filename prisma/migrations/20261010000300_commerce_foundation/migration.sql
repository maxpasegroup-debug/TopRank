-- CreateTable
CREATE TABLE "CommerceFeature" (
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "CommerceFeature_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "CommerceGate" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "featureCode" TEXT NOT NULL,

    CONSTRAINT "CommerceGate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommercePackage" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "amountMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "interval" TEXT NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "features" TEXT[],
    "availableFrom" TIMESTAMP(3) NOT NULL,
    "availableUntil" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommercePackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommerceOrder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "requestKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "amountMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "providerOrderId" TEXT,
    "checkoutState" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "capturedAt" TIMESTAMP(3),

    CONSTRAINT "CommerceOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommercePayment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3),

    CONSTRAINT "CommercePayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommerceEvent" (
    "id" TEXT NOT NULL,
    "digest" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "providerOrderId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "refundId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "errorCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "CommerceEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entitlement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "featureCode" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "provenance" TEXT NOT NULL,
    "orderId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,

    CONSTRAINT "Entitlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommerceReceipt" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommerceReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommerceRefund" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "requestKey" TEXT NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "decision" TEXT,
    "providerRefundId" TEXT,
    "paymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommerceRefund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "userId" TEXT NOT NULL,
    "email" BOOLEAN NOT NULL DEFAULT false,
    "whatsapp" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "CommerceNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventKey" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leaseUntil" TIMESTAMP(3),
    "providerMessageId" TEXT,
    "errorCode" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommerceNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommerceGate_kind_resourceId_key" ON "CommerceGate"("kind", "resourceId");

-- CreateIndex
CREATE INDEX "CommercePackage_status_availableFrom_idx" ON "CommercePackage"("status", "availableFrom");

-- CreateIndex
CREATE UNIQUE INDEX "CommercePackage_code_revision_key" ON "CommercePackage"("code", "revision");

-- CreateIndex
CREATE UNIQUE INDEX "CommerceOrder_providerOrderId_key" ON "CommerceOrder"("providerOrderId");

-- CreateIndex
CREATE INDEX "CommerceOrder_userId_createdAt_idx" ON "CommerceOrder"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CommerceOrder_userId_requestKey_key" ON "CommerceOrder"("userId", "requestKey");

-- CreateIndex
CREATE INDEX "CommerceEvent_status_createdAt_idx" ON "CommerceEvent"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Entitlement_provenance_key" ON "Entitlement"("provenance");

-- CreateIndex
CREATE INDEX "Entitlement_userId_featureCode_status_endsAt_idx" ON "Entitlement"("userId", "featureCode", "status", "endsAt");

-- CreateIndex
CREATE UNIQUE INDEX "CommerceReceipt_orderId_key" ON "CommerceReceipt"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "CommerceRefund_providerRefundId_key" ON "CommerceRefund"("providerRefundId");

-- CreateIndex
CREATE UNIQUE INDEX "CommerceRefund_orderId_requestKey_key" ON "CommerceRefund"("orderId", "requestKey");

-- CreateIndex
CREATE INDEX "CommerceNotification_status_nextAttemptAt_idx" ON "CommerceNotification"("status", "nextAttemptAt");

-- CreateIndex
CREATE UNIQUE INDEX "CommerceNotification_userId_eventKey_channel_key" ON "CommerceNotification"("userId", "eventKey", "channel");

-- AddForeignKey
ALTER TABLE "CommerceGate" ADD CONSTRAINT "CommerceGate_featureCode_fkey" FOREIGN KEY ("featureCode") REFERENCES "CommerceFeature"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommerceOrder" ADD CONSTRAINT "CommerceOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommerceOrder" ADD CONSTRAINT "CommerceOrder_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "CommercePackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommercePayment" ADD CONSTRAINT "CommercePayment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "CommerceOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entitlement" ADD CONSTRAINT "Entitlement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entitlement" ADD CONSTRAINT "Entitlement_featureCode_fkey" FOREIGN KEY ("featureCode") REFERENCES "CommerceFeature"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entitlement" ADD CONSTRAINT "Entitlement_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "CommerceOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommerceReceipt" ADD CONSTRAINT "CommerceReceipt_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "CommerceOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommerceRefund" ADD CONSTRAINT "CommerceRefund_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "CommerceOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommerceRefund" ADD CONSTRAINT "CommerceRefund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "CommercePayment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommerceNotification" ADD CONSTRAINT "CommerceNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Financial provenance and fixed-access invariants; review on disposable PostgreSQL first.
ALTER TABLE "CommercePackage" ADD CONSTRAINT "CommercePackage_terms_check" CHECK (
  "revision" > 0 AND "amountMinor" BETWEEN 1 AND 100000000 AND "currency" = 'INR'
  AND "durationDays" BETWEEN 1 AND 3660 AND "availableUntil" > "availableFrom"
  AND "interval" IN ('ONCE', 'MONTH', 'YEAR') AND "status" IN ('DRAFT', 'PUBLISHED', 'RETIRED')
  AND cardinality("features") BETWEEN 1 AND 30);
CREATE UNIQUE INDEX "CommercePackage_one_published_code" ON "CommercePackage"("code") WHERE "status" = 'PUBLISHED';
ALTER TABLE "CommerceGate" ADD CONSTRAINT "CommerceGate_kind_check" CHECK ("kind" IN ('MOCK', 'LESSON'));
ALTER TABLE "CommerceOrder" ADD CONSTRAINT "CommerceOrder_money_state_check" CHECK (
  "amountMinor" BETWEEN 1 AND 100000000 AND "currency" = 'INR'
  AND "status" IN ('PENDING', 'CAPTURED', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED')
  AND "checkoutState" IN ('NOT_STARTED', 'CREATING', 'READY', 'REVIEW')
  AND ("status" NOT IN ('CAPTURED', 'REFUNDED', 'PARTIALLY_REFUNDED') OR "capturedAt" IS NOT NULL));
ALTER TABLE "CommercePayment" ADD CONSTRAINT "CommercePayment_money_state_check" CHECK (
  "amountMinor" BETWEEN 1 AND 100000000 AND "currency" = 'INR' AND "status" IN ('captured', 'failed')
  AND ("status" <> 'captured' OR "capturedAt" IS NOT NULL));
ALTER TABLE "Entitlement" ADD CONSTRAINT "Entitlement_provenance_check" CHECK (
  "endsAt" > "startsAt" AND "status" IN ('ACTIVE', 'REVOKED')
  AND (("source" = 'PURCHASE' AND "orderId" IS NOT NULL)
    OR ("source" IN ('TRIAL', 'ADMIN') AND "orderId" IS NULL)));
ALTER TABLE "CommerceReceipt" ADD CONSTRAINT "CommerceReceipt_money_check" CHECK ("amountMinor" BETWEEN 1 AND 100000000 AND "currency" = 'INR');
ALTER TABLE "CommerceRefund" ADD CONSTRAINT "CommerceRefund_money_state_check" CHECK (
  "amountMinor" BETWEEN 1 AND 100000000
  AND "status" IN ('REQUESTED', 'APPROVED', 'REJECTED', 'SUBMITTING', 'PENDING', 'PROCESSED', 'FAILED'));
ALTER TABLE "CommerceEvent" ADD CONSTRAINT "CommerceEvent_state_check" CHECK ("status" IN ('RECEIVED', 'PROCESSED', 'RETRY'));
ALTER TABLE "CommerceNotification" ADD CONSTRAINT "CommerceNotification_state_check" CHECK (
  "attempts" >= 0 AND "channel" IN ('IN_APP', 'EMAIL', 'WHATSAPP')
  AND "status" IN ('AVAILABLE', 'PENDING', 'BLOCKED', 'RETRY', 'ACCEPTED', 'DELIVERED', 'FAILED', 'SUPPRESSED'));

CREATE FUNCTION "commerce_immutable_terms"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_TABLE_NAME = 'CommercePackage' THEN
    IF (to_jsonb(NEW) - 'status') IS DISTINCT FROM (to_jsonb(OLD) - 'status') THEN
      RAISE EXCEPTION 'Package versions are immutable';
    END IF;
  ELSIF TG_TABLE_NAME = 'CommerceOrder' THEN
    IF ROW(NEW."userId", NEW."packageId", NEW."requestKey", NEW."amountMinor", NEW."currency", NEW."snapshot", NEW."createdAt")
      IS DISTINCT FROM ROW(OLD."userId", OLD."packageId", OLD."requestKey", OLD."amountMinor", OLD."currency", OLD."snapshot", OLD."createdAt") THEN
      RAISE EXCEPTION 'Order purchase terms are immutable';
    END IF;
  ELSIF TG_TABLE_NAME = 'CommerceReceipt' AND to_jsonb(NEW) IS DISTINCT FROM to_jsonb(OLD) THEN
    RAISE EXCEPTION 'Payment receipts are immutable';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER "CommercePackage_immutable" BEFORE UPDATE ON "CommercePackage" FOR EACH ROW EXECUTE FUNCTION "commerce_immutable_terms"();
CREATE TRIGGER "CommerceOrder_immutable" BEFORE UPDATE ON "CommerceOrder" FOR EACH ROW EXECUTE FUNCTION "commerce_immutable_terms"();
CREATE TRIGGER "CommerceReceipt_immutable" BEFORE UPDATE ON "CommerceReceipt" FOR EACH ROW EXECUTE FUNCTION "commerce_immutable_terms"();
