ALTER TABLE "StudentProfile" ADD COLUMN "onboardingCompletedAt" TIMESTAMP(3);

INSERT INTO "Exam" ("id", "code", "name", "status", "createdAt", "updatedAt")
VALUES
  ('seed_exam_neet', 'NEET', 'National Eligibility cum Entrance Test', 'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed_exam_jee_main', 'JEE_MAIN', 'JEE Main', 'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed_exam_jee_advanced', 'JEE_ADVANCED', 'JEE Advanced', 'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed_exam_keam', 'KEAM', 'Kerala Engineering Architecture Medical', 'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed_exam_cuet', 'CUET', 'Common University Entrance Test', 'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO UPDATE SET
  "name" = EXCLUDED."name",
  "status" = EXCLUDED."status",
  "updatedAt" = CURRENT_TIMESTAMP;

UPDATE "Exam"
SET "status" = 'ARCHIVED', "updatedAt" = CURRENT_TIMESTAMP
WHERE "code" = 'JEE';
