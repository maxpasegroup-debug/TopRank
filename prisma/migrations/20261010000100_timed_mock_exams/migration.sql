-- Forward-only; leave unapplied until the target database is identified.
CREATE TYPE "MockAttemptStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'EXPIRED');
CREATE TABLE "MockExam" (
 "id" TEXT PRIMARY KEY, "examId" TEXT NOT NULL, "title" TEXT NOT NULL,
 "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT', "version" INTEGER NOT NULL DEFAULT 0,
 "durationSeconds" INTEGER NOT NULL, "maxAttempts" INTEGER NOT NULL,
 "revealPolicy" TEXT NOT NULL, "sections" JSONB NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "MockExam_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 CONSTRAINT "MockExam_policy_check" CHECK ("durationSeconds" BETWEEN 60 AND 21600 AND "maxAttempts" BETWEEN 1 AND 10 AND "revealPolicy" IN ('AFTER_SUBMISSION','NEVER'))
);
CREATE TABLE "MockAttempt" (
 "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL, "mockExamId" TEXT NOT NULL, "requestKey" TEXT NOT NULL,
 "status" "MockAttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS', "startedAt" TIMESTAMP(3) NOT NULL,
 "deadline" TIMESTAMP(3) NOT NULL, "finalizedAt" TIMESTAMP(3), "snapshot" JSONB NOT NULL, "result" JSONB,
 CONSTRAINT "MockAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT "MockAttempt_mockExamId_fkey" FOREIGN KEY ("mockExamId") REFERENCES "MockExam"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 CONSTRAINT "MockAttempt_time_check" CHECK ("deadline" > "startedAt"),
 CONSTRAINT "MockAttempt_result_check" CHECK (("status" = 'IN_PROGRESS' AND "finalizedAt" IS NULL AND "result" IS NULL) OR ("status" <> 'IN_PROGRESS' AND "finalizedAt" IS NOT NULL AND "result" IS NOT NULL))
);
CREATE TABLE "MockAnswer" (
 "id" TEXT PRIMARY KEY, "attemptId" TEXT NOT NULL, "position" INTEGER NOT NULL,
 "answer" JSONB NOT NULL, "version" INTEGER NOT NULL DEFAULT 0, "flagged" BOOLEAN NOT NULL DEFAULT false,
 "bookmarked" BOOLEAN NOT NULL DEFAULT false, "reviewedAt" TIMESTAMP(3), "revisionTaskId" TEXT,
 CONSTRAINT "MockAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "MockAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT "MockAnswer_revisionTaskId_fkey" FOREIGN KEY ("revisionTaskId") REFERENCES "MissionTask"("id") ON DELETE SET NULL ON UPDATE CASCADE,
 CONSTRAINT "MockAnswer_position_check" CHECK ("position" >= 0 AND "version" >= 0)
);
CREATE INDEX "MockExam_examId_status_idx" ON "MockExam"("examId", "status");
CREATE UNIQUE INDEX "MockAttempt_userId_requestKey_key" ON "MockAttempt"("userId", "requestKey");
-- Partial indexes cannot be expressed in Prisma schema.
CREATE UNIQUE INDEX "MockAttempt_one_active" ON "MockAttempt"("userId", "mockExamId") WHERE "status" = 'IN_PROGRESS';
CREATE INDEX "MockAttempt_userId_startedAt_idx" ON "MockAttempt"("userId", "startedAt");
CREATE INDEX "MockAttempt_userId_mockExamId_status_idx" ON "MockAttempt"("userId", "mockExamId", "status");
CREATE UNIQUE INDEX "MockAnswer_attemptId_position_key" ON "MockAnswer"("attemptId", "position");
CREATE UNIQUE INDEX "MockAnswer_revisionTaskId_key" ON "MockAnswer"("revisionTaskId");
