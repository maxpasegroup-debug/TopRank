-- Forward-only journey storage. Apply only after the database target is verified.
ALTER TABLE "StudentProfile" ADD COLUMN "aspiration" TEXT, ADD COLUMN "targetScore" TEXT,
  ADD COLUMN "preparationStart" DATE, ADD COLUMN "focusSubjectIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Exam" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'OTHER', ADD COLUMN "description" TEXT, ADD COLUMN "officialUrl" TEXT;
CREATE TYPE "MissionTaskStatus" AS ENUM ('TODO', 'COMPLETED', 'SKIPPED');
CREATE TABLE "StudyPlan" (
  "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL, "examId" TEXT NOT NULL,
  "title" TEXT NOT NULL, "active" BOOLEAN NOT NULL DEFAULT true, "startDate" DATE NOT NULL,
  "dailyMinutes" INTEGER NOT NULL CHECK ("dailyMinutes" BETWEEN 30 AND 720),
  "requestKey" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "StudyPlan_userId_requestKey_key" ON "StudyPlan"("userId", "requestKey");
CREATE INDEX "StudyPlan_userId_active_idx" ON "StudyPlan"("userId", "active");
-- Preserve this partial index in future migrations; it is not represented by Prisma.
CREATE UNIQUE INDEX "StudyPlan_one_active_per_user" ON "StudyPlan"("userId") WHERE "active";
CREATE TABLE "MissionTask" (
  "id" TEXT PRIMARY KEY, "planId" TEXT NOT NULL, "title" TEXT NOT NULL, "subject" TEXT NOT NULL, "href" TEXT,
  "dueDate" DATE NOT NULL, "minutes" INTEGER NOT NULL CHECK ("minutes" BETWEEN 1 AND 720),
  "status" "MissionTaskStatus" NOT NULL DEFAULT 'TODO', "completedAt" TIMESTAMP(3), "version" INTEGER NOT NULL DEFAULT 0 CHECK ("version" >= 0),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  FOREIGN KEY ("planId") REFERENCES "StudyPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "MissionTask_planId_dueDate_idx" ON "MissionTask"("planId", "dueDate");
CREATE TABLE "MissionTaskEvent" (
  "id" TEXT PRIMARY KEY, "taskId" TEXT NOT NULL, "status" "MissionTaskStatus" NOT NULL, "dueDate" DATE NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("taskId") REFERENCES "MissionTask"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "MissionTaskEvent_taskId_createdAt_idx" ON "MissionTaskEvent"("taskId", "createdAt");
CREATE TABLE "StudySession" (
  "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL, "requestKey" TEXT NOT NULL, "topic" TEXT NOT NULL,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "endedAt" TIMESTAMP(3), CHECK ("endedAt" IS NULL OR "endedAt" >= "startedAt"),
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "StudySession_userId_requestKey_key" ON "StudySession"("userId", "requestKey");
CREATE INDEX "StudySession_userId_startedAt_idx" ON "StudySession"("userId", "startedAt");
CREATE UNIQUE INDEX "StudySession_one_active_per_user" ON "StudySession"("userId") WHERE "endedAt" IS NULL;
CREATE TABLE "StudentLessonProgress" (
  "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL, "lessonId" TEXT NOT NULL,
  "bookmarked" BOOLEAN NOT NULL DEFAULT false, "completedAt" TIMESTAMP(3), "updatedAt" TIMESTAMP(3) NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "StudentLessonProgress_userId_lessonId_key" ON "StudentLessonProgress"("userId", "lessonId");
CREATE INDEX "StudentLessonProgress_userId_completedAt_idx" ON "StudentLessonProgress"("userId", "completedAt");
