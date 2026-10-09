-- No scoring mode is assigned to legacy content automatically.
CREATE TYPE "PracticeScoringMode" AS ENUM ('EXACT_SET', 'DECIMAL_EXACT');
ALTER TABLE "QuestionExam" ADD COLUMN "scoringMode" "PracticeScoringMode";
CREATE TABLE "PracticeAttempt" (
  "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL, "questionId" TEXT NOT NULL,
  "examId" TEXT NOT NULL, "requestKey" TEXT NOT NULL, "answer" JSONB NOT NULL,
  "correct" BOOLEAN NOT NULL, "score" DECIMAL(7,2) NOT NULL,
  "maximumScore" DECIMAL(7,2) NOT NULL CHECK ("maximumScore" > 0),
  "scoringMode" "PracticeScoringMode" NOT NULL, "explanation" TEXT, "questionText" TEXT NOT NULL,
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "PracticeAttempt_userId_requestKey_key" ON "PracticeAttempt"("userId", "requestKey");
CREATE INDEX "PracticeAttempt_userId_submittedAt_idx" ON "PracticeAttempt"("userId", "submittedAt");
CREATE INDEX "PracticeAttempt_userId_questionId_idx" ON "PracticeAttempt"("userId", "questionId");
