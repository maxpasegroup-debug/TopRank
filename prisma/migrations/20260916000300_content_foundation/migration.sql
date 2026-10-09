CREATE TYPE "LearningResourceType" AS ENUM ('VIDEO', 'ARTICLE', 'PDF', 'NOTES', 'EXTERNAL', 'OTHER');

ALTER TABLE "Exam" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Subject" ADD COLUMN "code" TEXT;
ALTER TABLE "Subject" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "ExamSubject" ADD COLUMN "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED';
ALTER TABLE "ExamSubject" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Chapter" ADD COLUMN "summary" TEXT;
ALTER TABLE "Chapter" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Lesson" ADD COLUMN "summary" TEXT;
ALTER TABLE "Lesson" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE "LearningResource" (
  "id" TEXT NOT NULL,
  "lessonId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "type" "LearningResourceType" NOT NULL DEFAULT 'OTHER',
  "url" TEXT,
  "reference" TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LearningResource_pkey" PRIMARY KEY ("id")
);

UPDATE "Subject" SET "code" = UPPER(REPLACE("slug", '-', '_')) WHERE "code" IS NULL;

CREATE UNIQUE INDEX "Subject_code_key" ON "Subject"("code");
CREATE INDEX "Exam_status_active_idx" ON "Exam"("status", "active");
CREATE INDEX "Subject_status_active_idx" ON "Subject"("status", "active");
CREATE INDEX "ExamSubject_status_active_idx" ON "ExamSubject"("status", "active");
CREATE INDEX "Chapter_status_active_idx" ON "Chapter"("status", "active");
CREATE INDEX "Lesson_status_active_idx" ON "Lesson"("status", "active");
CREATE UNIQUE INDEX "LearningResource_lessonId_slug_key" ON "LearningResource"("lessonId", "slug");
CREATE INDEX "LearningResource_lessonId_idx" ON "LearningResource"("lessonId");
CREATE INDEX "LearningResource_status_active_idx" ON "LearningResource"("status", "active");

ALTER TABLE "LearningResource" ADD CONSTRAINT "LearningResource_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
