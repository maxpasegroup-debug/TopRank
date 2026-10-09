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
- `Question.explanation` and `Question.solutionRef` are not returned by student APIs in this phase.
- `QuestionExam.marks` and `QuestionExam.negativeMarks` are stored but not returned to students.
- Draft, archived, inactive, or unmapped questions are excluded from student APIs.
- Demo fixture data is not used as a production fallback when real practice data is requested.

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
