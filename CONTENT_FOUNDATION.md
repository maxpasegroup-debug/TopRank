# TopRank AI Content Foundation

## Scope

Phase 3 establishes database-backed academic content for entrance preparation:

```text
Exam -> ExamSubject -> Subject -> Chapter -> Lesson -> LearningResource
```

It does not implement questions, attempts, scoring, analytics, AI content generation, or a CMS/admin editor.

## Models

- `Exam`: stable `code`, display `name`, `status`, `active`.
- `Subject`: stable `code`, `slug`, display `name`, `status`, `active`.
- `ExamSubject`: exam-specific subject mapping with `order`, `status`, `active`.
- `Chapter`: subject-owned content unit with `slug`, `summary`, `order`, `status`, `active`.
- `Lesson`: chapter-owned lesson with `slug`, `summary`, `order`, `status`, `active`.
- `LearningResource`: lesson-owned resource with `type`, `url`, `reference`, `order`, `status`, `active`.

Student-facing services return only `PUBLISHED` and `active` content.

## Supported Exams

Seeded exams:

- `NEET`
- `JEE_MAIN`
- `JEE_ADVANCED`
- `KEAM`
- `CUET`

The older generic `JEE` code is archived by seed/migration if present.

## Initial Subject Mappings

- NEET: Physics, Chemistry, Biology
- JEE Main: Physics, Chemistry, Mathematics
- JEE Advanced: Physics, Chemistry, Mathematics
- KEAM: Physics, Chemistry, Mathematics
- CUET: General Test

Subjects are reusable records. Exam-specific ordering and visibility live in `ExamSubject`.

## Seed Process

Run:

```bash
npm run db:seed
```

The seed is deterministic and idempotent:

- uses stable exam codes and slugs
- uses `upsert`
- does not delete user/student records
- does not reset the database
- avoids duplicate content records through unique constraints

Seeded foundation counts:

- Exams: 5
- Subjects: 5
- Exam-subject mappings: 13
- Chapters: 20
- Lessons: 20
- Learning resources: 20

## Student APIs

- `GET /api/student/content/exams`
- `GET /api/student/content/exams/:examCode/subjects`
- `GET /api/student/content/subjects/:subjectSlug/chapters`
- `GET /api/student/content/chapters/:chapterSlug/lessons`
- `GET /api/student/content/lessons/:lessonSlug`

All endpoints require an authenticated student session. They do not accept browser-supplied user IDs.

## Learning UI

Production learning screens use PostgreSQL content:

- `/learn` uses the authenticated student's selected exam.
- `/learn/:subjectSlug` lists published chapters.
- `/learn/:subjectSlug/:chapterSlug` lists published lessons.
- `/learn/:subjectSlug/:chapterSlug/:lessonSlug` displays lesson resources.

If production content is missing, screens show a safe empty state. They do not fall back to Rahul/demo fixtures.

## Demo Separation

Demo routes and presentation fixtures remain separate:

- `/demo`
- `/demo/start`
- `/presentation-summary`

Production content services do not read `src/data/demo.ts` or `src/data/learning.ts`.

## Future Imports

Future content importers should:

- use stable codes/slugs
- validate content before publishing
- default new records to `DRAFT`
- never scrape or import copyrighted resources without approval
- preserve existing user/student records
- use `PUBLISHED + active` for student visibility

## Known Limitations

- Seeded lessons/resources are foundation placeholders, not full launch-ready academic material.
- No content admin/editor exists yet.
- No lesson completion, bookmarks, question bank, or scoring exists yet.
- A live PostgreSQL migration/seed execution must be run in the deployment environment.
