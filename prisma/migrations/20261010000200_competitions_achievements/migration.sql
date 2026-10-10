-- Forward-only, unapplied. Depends on the timed mock migration.
ALTER TABLE "AuditEvent" ADD COLUMN "detail" TEXT;
CREATE TABLE "Competition" (
 "id" TEXT PRIMARY KEY, "title" TEXT NOT NULL, "type" TEXT NOT NULL,
 "status" TEXT NOT NULL DEFAULT 'DRAFT', "mockExamId" TEXT NOT NULL, "mockVersion" INTEGER NOT NULL,
 "startsAt" TIMESTAMP(3) NOT NULL, "endsAt" TIMESTAMP(3) NOT NULL, "config" JSONB NOT NULL,
 "version" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "Competition_mockExamId_fkey" FOREIGN KEY ("mockExamId") REFERENCES "MockExam"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 CONSTRAINT "Competition_window_check" CHECK ("startsAt" < "endsAt"),
 CONSTRAINT "Competition_state_check" CHECK ("status" IN ('DRAFT','PUBLISHED','COMPLETED','CANCELLED') AND "type" IN ('WEEKLY','MONTHLY','CUSTOM'))
);
CREATE UNIQUE INDEX "Competition_mockExamId_key" ON "Competition"("mockExamId");
CREATE INDEX "Competition_status_startsAt_idx" ON "Competition"("status","startsAt");
CREATE TABLE "CompetitionEntry" (
 "id" TEXT PRIMARY KEY, "competitionId" TEXT NOT NULL, "userId" TEXT NOT NULL,
 "attemptId" TEXT, "requestKey" TEXT NOT NULL, "alias" TEXT NOT NULL, "visible" BOOLEAN NOT NULL DEFAULT false,
 "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "disqualified" BOOLEAN NOT NULL DEFAULT false,
 "decision" TEXT, "score" DECIMAL(12,4), "timeSeconds" INTEGER, "rank" INTEGER,
 CONSTRAINT "CompetitionEntry_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 CONSTRAINT "CompetitionEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT "CompetitionEntry_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "MockAttempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 CONSTRAINT "CompetitionEntry_rank_check" CHECK (("rank" IS NULL OR "rank" > 0) AND ("timeSeconds" IS NULL OR "timeSeconds" >= 0))
);
CREATE UNIQUE INDEX "CompetitionEntry_attemptId_key" ON "CompetitionEntry"("attemptId");
CREATE UNIQUE INDEX "CompetitionEntry_alias_key" ON "CompetitionEntry"("alias");
CREATE UNIQUE INDEX "CompetitionEntry_competitionId_userId_key" ON "CompetitionEntry"("competitionId","userId");
CREATE UNIQUE INDEX "CompetitionEntry_userId_requestKey_key" ON "CompetitionEntry"("userId","requestKey");
CREATE INDEX "CompetitionEntry_competitionId_rank_idx" ON "CompetitionEntry"("competitionId","rank");
CREATE TABLE "AchievementDefinition" (
 "id" TEXT PRIMARY KEY, "code" TEXT NOT NULL, "title" TEXT NOT NULL, "kind" TEXT NOT NULL,
 "threshold" INTEGER NOT NULL, "badge" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'DRAFT', "version" INTEGER NOT NULL DEFAULT 0,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "AchievementDefinition_rule_check" CHECK ("threshold" BETWEEN 1 AND 100 AND "kind" IN ('FIRST_MOCK','STUDY_DAYS','LESSONS','IMPROVEMENT','PLACEMENT') AND "status" IN ('DRAFT','PUBLISHED'))
);
CREATE UNIQUE INDEX "AchievementDefinition_code_key" ON "AchievementDefinition"("code");
CREATE TABLE "EarnedAchievement" (
 "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL, "definitionId" TEXT NOT NULL, "scope" TEXT NOT NULL,
 "title" TEXT NOT NULL, "badge" TEXT NOT NULL, "explanation" TEXT NOT NULL,
 "status" TEXT NOT NULL DEFAULT 'ACTIVE', "revocationSource" TEXT, "evidence" JSONB NOT NULL, "shareHash" TEXT,
 "version" INTEGER NOT NULL DEFAULT 0, "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "EarnedAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT "EarnedAchievement_definitionId_fkey" FOREIGN KEY ("definitionId") REFERENCES "AchievementDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 CONSTRAINT "EarnedAchievement_state_check" CHECK ("status" IN ('ACTIVE','REVOKED') AND ("status" = 'ACTIVE' OR "shareHash" IS NULL))
);
CREATE UNIQUE INDEX "EarnedAchievement_userId_definitionId_scope_key" ON "EarnedAchievement"("userId","definitionId","scope");
CREATE UNIQUE INDEX "EarnedAchievement_shareHash_key" ON "EarnedAchievement"("shareHash");
CREATE INDEX "EarnedAchievement_userId_awardedAt_idx" ON "EarnedAchievement"("userId","awardedAt");
CREATE INDEX "EarnedAchievement_scope_status_idx" ON "EarnedAchievement"("scope","status");
CREATE TABLE "PrizeAward" (
 "id" TEXT PRIMARY KEY, "achievementId" TEXT NOT NULL, "label" TEXT NOT NULL,
 "status" TEXT NOT NULL DEFAULT 'PENDING_REVIEW', "decision" TEXT, "version" INTEGER NOT NULL DEFAULT 0,
 "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "PrizeAward_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "EarnedAchievement"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 CONSTRAINT "PrizeAward_state_check" CHECK ("status" IN ('PENDING_REVIEW','APPROVED','REJECTED','FULFILLED'))
);
CREATE UNIQUE INDEX "PrizeAward_achievementId_key" ON "PrizeAward"("achievementId");
