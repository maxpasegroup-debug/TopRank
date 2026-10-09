CREATE TYPE "QuestionType" AS ENUM ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'NUMERICAL');
CREATE TYPE "QuestionDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');
CREATE TYPE "QuestionReviewStatus" AS ENUM ('NEEDS_REVIEW', 'REVIEWED');

CREATE TABLE "Question" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "type" "QuestionType" NOT NULL,
  "difficulty" "QuestionDifficulty" NOT NULL DEFAULT 'MEDIUM',
  "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "subjectId" TEXT NOT NULL,
  "chapterId" TEXT NOT NULL,
  "lessonId" TEXT,
  "explanation" TEXT,
  "solutionRef" TEXT,
  "source" TEXT,
  "sourceYear" INTEGER,
  "language" TEXT NOT NULL DEFAULT 'en',
  "reviewStatus" "QuestionReviewStatus" NOT NULL DEFAULT 'NEEDS_REVIEW',
  "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QuestionOption" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "questionId" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "isCorrect" BOOLEAN NOT NULL DEFAULT false,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "QuestionOption_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QuestionExam" (
  "id" TEXT NOT NULL,
  "questionId" TEXT NOT NULL,
  "examId" TEXT NOT NULL,
  "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "marks" DECIMAL(5,2) NOT NULL DEFAULT 4,
  "negativeMarks" DECIMAL(5,2) NOT NULL DEFAULT 1,
  "sourceYear" INTEGER,
  "category" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "QuestionExam_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Question_code_key" ON "Question"("code");
CREATE INDEX "Question_subjectId_idx" ON "Question"("subjectId");
CREATE INDEX "Question_chapterId_idx" ON "Question"("chapterId");
CREATE INDEX "Question_lessonId_idx" ON "Question"("lessonId");
CREATE INDEX "Question_type_idx" ON "Question"("type");
CREATE INDEX "Question_difficulty_idx" ON "Question"("difficulty");
CREATE INDEX "Question_status_active_idx" ON "Question"("status", "active");
CREATE UNIQUE INDEX "QuestionOption_questionId_code_key" ON "QuestionOption"("questionId", "code");
CREATE INDEX "QuestionOption_questionId_idx" ON "QuestionOption"("questionId");
CREATE INDEX "QuestionOption_active_idx" ON "QuestionOption"("active");
CREATE UNIQUE INDEX "QuestionExam_questionId_examId_key" ON "QuestionExam"("questionId", "examId");
CREATE INDEX "QuestionExam_examId_idx" ON "QuestionExam"("examId");
CREATE INDEX "QuestionExam_questionId_idx" ON "QuestionExam"("questionId");
CREATE INDEX "QuestionExam_status_active_idx" ON "QuestionExam"("status", "active");

ALTER TABLE "Question" ADD CONSTRAINT "Question_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Question" ADD CONSTRAINT "Question_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Question" ADD CONSTRAINT "Question_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "QuestionOption" ADD CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuestionExam" ADD CONSTRAINT "QuestionExam_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuestionExam" ADD CONSTRAINT "QuestionExam_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
