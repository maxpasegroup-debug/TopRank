# TopRank AI Question Bank Foundation

Phase 4 adds the storage, seed, service, API, and read-only UI bridge for production practice questions.

## What Exists

- Prisma models for `Question`, `QuestionOption`, and `QuestionExam`.
- Question enums for type, difficulty, and review status.
- Published/active filtering on every student-facing question query.
- Student-only read APIs for question list, question detail, subject questions, and chapter questions.
- A sanitized student DTO that excludes answer keys, explanations, solution references, and scoring metadata.
- Idempotent seed data for a small original foundation question set.
- Import validation helpers for future controlled question ingestion.
- Read-only practice UI wiring for real bank data.

## Seed Coverage

The seed contains 6 original foundation questions:

- Physics: Motion in a Straight Line
- Physics: Laws of Motion
- Chemistry: Some Basic Concepts of Chemistry
- Biology: The Living World
- Mathematics: Sets
- General Test: Quantitative Aptitude

The seed covers `SINGLE_CHOICE`, `MULTIPLE_CHOICE`, and `NUMERICAL` question types across NEET, JEE Main, JEE Advanced, KEAM, and CUET mappings.

## Student APIs

- `GET /api/student/practice/questions`
- `GET /api/student/practice/questions/:questionId`
- `GET /api/student/practice/subjects/:subjectSlug/questions`
- `GET /api/student/practice/chapters/:chapterSlug/questions`

Supported filters:

- `exam`
- `subject`
- `chapter`
- `difficulty`
- `type`

All APIs require an authenticated `STUDENT` user.

## Security Rules

- `QuestionOption.isCorrect` is stored only server-side and is never returned by student APIs.
- `Question.numericalAnswer` stores the protected numerical key as text; student queries never select it and numerical DTOs always contain `options: []`, including legacy records.
- New numerical imports require `numericalAnswer` and forbid answer-bearing options. Choice imports retain their existing option/answer-key validation.
- Student question reads require `PUBLISHED`, `active`, and `REVIEWED`. Unknown question types fail with a generic validation error.
- `Question.explanation` and `Question.solutionRef` are not returned by student APIs in this phase.
- `QuestionExam.marks` and `QuestionExam.negativeMarks` are stored but not returned to students.
- Draft, archived, inactive, or unmapped questions are excluded from student APIs.
- Demo fixture data is not used as a production fallback when real practice data is requested.

## Numerical Answer Migration

`20261009000100_protected_numerical_answers` adds the nullable protected field. It copies a legacy key only when there is exactly one active correct option with a valid numeric text value. Published numerical records without an unambiguous key become draft/needs-review. Legacy option rows are retained but deactivated, not deleted. Apply only through a separately reviewed deployment after database backup and migration testing; this change does not apply the migration or run the seed.

Numerical import syntax accepts signed decimal/scientific-notation text without converting it to floating point. This is storage validation, not a scoring policy. Accepted formats, units, precision, rounding, ranges, and tolerance must be defined separately for each applicable exam/question type before scoring is implemented.

## What Does Not Exist Yet

- Attempt creation
- Answer submission
- Scoring
- Negative marking execution
- Timers
- Mock test sessions
- Previous-year-paper workflows
- Question bookmarks
- Question history
- Result review with explanations
- Adaptive question recommendation
- Admin question management UI

This phase is the real question-bank foundation only.
