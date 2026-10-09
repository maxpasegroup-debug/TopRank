BEGIN;

ALTER TABLE "Question" ADD COLUMN "numericalAnswer" TEXT;

-- Copy only an unambiguous, syntactically numeric legacy key. Preserve precision as text.
WITH legacy_answers AS (
  SELECT "questionId", MIN(BTRIM("text")) AS answer
  FROM "QuestionOption"
  WHERE "active" = true AND "isCorrect" = true
  GROUP BY "questionId"
  HAVING COUNT(*) = 1
)
UPDATE "Question" AS question
SET "numericalAnswer" = legacy.answer, "updatedAt" = CURRENT_TIMESTAMP
FROM legacy_answers AS legacy
WHERE question."id" = legacy."questionId"
  AND question."type" = 'NUMERICAL'
  AND LENGTH(legacy.answer) BETWEEN 1 AND 120
  AND legacy.answer ~ '^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)([eE][+-]?[0-9]+)?$';

-- Keep ambiguous/missing legacy keys for review rather than guessing an answer.
UPDATE "Question"
SET "status" = 'DRAFT', "reviewStatus" = 'NEEDS_REVIEW', "updatedAt" = CURRENT_TIMESTAMP
WHERE "type" = 'NUMERICAL' AND "numericalAnswer" IS NULL AND "status" = 'PUBLISHED';

-- Retain legacy rows and answer flags for audit; they are no longer active choices.
UPDATE "QuestionOption" AS option
SET "active" = false, "updatedAt" = CURRENT_TIMESTAMP
FROM "Question" AS question
WHERE option."questionId" = question."id" AND question."type" = 'NUMERICAL';

COMMIT;
