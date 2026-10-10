-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "RelationshipStatus" ADD VALUE 'REJECTED';
ALTER TYPE "RelationshipStatus" ADD VALUE 'EXPIRED';

-- AlterTable
ALTER TABLE "StudentParentRelationship" ADD COLUMN     "authorizationBasis" TEXT,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "parentAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "scopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "studentConsentAt" TIMESTAMP(3),
ADD COLUMN     "verificationReference" TEXT,
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedById" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "School" ADD COLUMN     "profile" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "SchoolMembership" ADD COLUMN     "duty" TEXT NOT NULL DEFAULT 'UNVERIFIED',
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "SchoolEnrollment" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "RelationshipStatus" NOT NULL DEFAULT 'PENDING',
    "scopes" TEXT[],
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "authorizationBasis" TEXT NOT NULL,
    "verificationReference" TEXT NOT NULL,
    "verifiedById" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3) NOT NULL,
    "studentConsentAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SchoolEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolStaffAssignment" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SchoolStaffAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalInvitation" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT,
    "issuerId" TEXT NOT NULL,
    "acceptedUserId" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "duty" TEXT NOT NULL,
    "membershipRole" "SchoolMemberRole",
    "tokenHash" TEXT NOT NULL,
    "requestKey" TEXT NOT NULL,
    "authorizationBasis" TEXT NOT NULL,
    "verificationReference" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortalInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalFeedback" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "requestKey" TEXT NOT NULL,
    "confidential" BOOLEAN NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortalFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolAnnouncement" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "requestKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SchoolAnnouncement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SchoolEnrollment_studentId_status_idx" ON "SchoolEnrollment"("studentId", "status");

-- CreateIndex
CREATE INDEX "SchoolEnrollment_schoolId_status_idx" ON "SchoolEnrollment"("schoolId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolEnrollment_schoolId_studentId_key" ON "SchoolEnrollment"("schoolId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolEnrollment_schoolId_id_key" ON "SchoolEnrollment"("schoolId", "id");

-- CreateIndex
CREATE INDEX "SchoolStaffAssignment_membershipId_active_idx" ON "SchoolStaffAssignment"("membershipId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolStaffAssignment_enrollmentId_membershipId_key" ON "SchoolStaffAssignment"("enrollmentId", "membershipId");

-- CreateIndex
CREATE UNIQUE INDEX "PortalInvitation_tokenHash_key" ON "PortalInvitation"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "PortalInvitation_requestKey_key" ON "PortalInvitation"("requestKey");

-- CreateIndex
CREATE INDEX "PortalInvitation_schoolId_status_idx" ON "PortalInvitation"("schoolId", "status");

-- CreateIndex
CREATE INDEX "PortalFeedback_enrollmentId_createdAt_idx" ON "PortalFeedback"("enrollmentId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PortalFeedback_authorId_requestKey_key" ON "PortalFeedback"("authorId", "requestKey");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolAnnouncement_requestKey_key" ON "SchoolAnnouncement"("requestKey");

-- CreateIndex
CREATE INDEX "SchoolAnnouncement_schoolId_status_createdAt_idx" ON "SchoolAnnouncement"("schoolId", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolMembership_schoolId_id_key" ON "SchoolMembership"("schoolId", "id");

-- AddForeignKey
ALTER TABLE "StudentParentRelationship" ADD CONSTRAINT "StudentParentRelationship_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolEnrollment" ADD CONSTRAINT "SchoolEnrollment_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolEnrollment" ADD CONSTRAINT "SchoolEnrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolEnrollment" ADD CONSTRAINT "SchoolEnrollment_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolStaffAssignment" ADD CONSTRAINT "SchoolStaffAssignment_schoolId_enrollmentId_fkey" FOREIGN KEY ("schoolId", "enrollmentId") REFERENCES "SchoolEnrollment"("schoolId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolStaffAssignment" ADD CONSTRAINT "SchoolStaffAssignment_schoolId_membershipId_fkey" FOREIGN KEY ("schoolId", "membershipId") REFERENCES "SchoolMembership"("schoolId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalInvitation" ADD CONSTRAINT "PortalInvitation_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalInvitation" ADD CONSTRAINT "PortalInvitation_issuerId_fkey" FOREIGN KEY ("issuerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalInvitation" ADD CONSTRAINT "PortalInvitation_acceptedUserId_fkey" FOREIGN KEY ("acceptedUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalFeedback" ADD CONSTRAINT "PortalFeedback_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "SchoolEnrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalFeedback" ADD CONSTRAINT "PortalFeedback_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolAnnouncement" ADD CONSTRAINT "SchoolAnnouncement_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Additional PostgreSQL invariants not representable in the Prisma schema.
CREATE UNIQUE INDEX "SchoolEnrollment_one_active_student" ON "SchoolEnrollment" ("studentId") WHERE "status" = 'ACTIVE';
CREATE UNIQUE INDEX "PortalInvitation_one_pending_target" ON "PortalInvitation" ("email", COALESCE("schoolId", '')) WHERE "status" = 'PENDING';
ALTER TABLE "PortalInvitation" ADD CONSTRAINT "PortalInvitation_terms_check" CHECK (
 ("role"::text = 'PARENT' AND "schoolId" IS NULL AND "duty" = 'PARENT' AND "membershipRole" IS NULL) OR
 ("role"::text = 'TEACHER' AND "schoolId" IS NOT NULL AND "membershipRole" IS NOT NULL AND
   (("duty" = 'TEACHING' AND "membershipRole"::text = 'TEACHER') OR ("duty" IN ('MENTOR', 'COUNSELLING') AND "membershipRole"::text = 'STAFF'))) OR
 ("role"::text = 'SCHOOL_ADMIN' AND "schoolId" IS NOT NULL AND "membershipRole" IS NOT NULL AND "duty" = 'ADMIN' AND "membershipRole"::text = 'ADMIN'));
ALTER TABLE "PortalInvitation" ADD CONSTRAINT "PortalInvitation_state_check" CHECK (
 "status" IN ('PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED') AND
 (("status" = 'ACCEPTED' AND "acceptedAt" IS NOT NULL AND "acceptedUserId" IS NOT NULL) OR
  ("status" <> 'ACCEPTED' AND "acceptedAt" IS NULL AND "acceptedUserId" IS NULL)));
ALTER TABLE "SchoolEnrollment" ADD CONSTRAINT "SchoolEnrollment_consent_check" CHECK (
 "status"::text <> 'ACTIVE' OR ("studentConsentAt" IS NOT NULL AND cardinality("scopes") > 0));
ALTER TABLE "StudentParentRelationship" ADD CONSTRAINT "Guardian_consent_check" CHECK (
 "status"::text <> 'ACTIVE' OR ("studentConsentAt" IS NOT NULL AND "parentAcceptedAt" IS NOT NULL AND
 "expiresAt" IS NOT NULL AND "verifiedAt" IS NOT NULL AND "verifiedById" IS NOT NULL AND
 "authorizationBasis" IS NOT NULL AND "verificationReference" IS NOT NULL AND cardinality("scopes") > 0)) NOT VALID;
-- Legacy relationships remain present but fail closed in application guards until explicitly reverified.
ALTER TABLE "SchoolMembership" ADD CONSTRAINT "SchoolMembership_duty_check" CHECK (
 "duty" = 'UNVERIFIED' OR ("role"::text IN ('OWNER', 'ADMIN') AND "duty" = 'ADMIN') OR
 ("role"::text = 'TEACHER' AND "duty" = 'TEACHING') OR ("role"::text = 'STAFF' AND "duty" IN ('MENTOR', 'COUNSELLING')));
ALTER TABLE "SchoolAnnouncement" ADD CONSTRAINT "SchoolAnnouncement_state_check" CHECK ("status" IN ('PUBLISHED', 'WITHDRAWN'));
