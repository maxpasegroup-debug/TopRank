# Timed mock exams and revision

Implementation increment: 2026-10-10. Code/build verification only, not release
approval. No identified PostgreSQL target was accessed. Production authentication
remains disabled; this module does not change activation or ingress settings.

## Connected workflows

- `/practice/mock-tests`: target-exam directory, detail view and own attempt history.
- `/practice/mock-attempts?attemptId=...`: resume, deadline countdown, saved
  answers, question navigation, review flags, bookmarks, submission and results.
- `/practice/revision`: incorrect/unanswered questions when review is permitted,
  flags/bookmarks, explanations, published lesson links and review history.
- `/admin/mock-exams`: platform-admin-only draft authoring, editing, validation,
  publication and withdrawal. Existing operations workspace links to it.
- Practice and learning revision navigation connect to these screens. Digital
  Profile shows recent actual scores/accuracy/time. Revision can add one planned
  15-minute mission task per attempt/question; this does not claim mastery or
  completed study. Existing home study-session recorder is linked, not duplicated.
- Deterministic SIA uses pending saved revision when an existing mission plan
  has no unfinished tasks. No AI/provider calls are made.

## Configuration and policies

Blueprint sections persist as validated JSON on MockExam. Each section explicitly
specifies its unique question IDs/count, correct marks, incorrect penalty and
non-positive unanswered marks. Duration is 60-21600 seconds, attempt limit 1-10,
maximum 200 unique questions across 1-10 sections. Builder defaults are editable
draft starting values, NOT official examination rules. There is no partial credit,
tolerance or rounding: existing EXACT_SET and DECIMAL_EXACT scoring is reused.

Publishing and starting both recheck reviewed/published/active exam links,
questions, subjects, chapters, optional lessons and scoring configuration. Starts
require completed onboarding and the student's saved target exam. Unpublishing
prevents new starts; existing owner-bound snapshots can finish unchanged.

Supported explanation policies are AFTER_SUBMISSION and NEVER, frozen at start.
Question DTOs never expose numerical keys, correct option flags, solutionRef,
private snapshot metadata or another student's records. Active attempts do not
receive explanations or per-question correctness. Final results expose aggregates
and section summaries. NEVER review queues include flags/bookmarks only, avoiding
disclosure through incorrect/unanswered queue membership. Permitted explanations
may naturally describe a solution; answer-key fields are never returned.

## Persistence and concurrency

MockAttempt stores server-generated start/deadline, immutable private question
and marking snapshot, finalized status/timestamp and result JSON containing
decimal score/max, accuracy (correct / answered), elapsed seconds, per-section
counts/scores and private per-question outcomes. MockAnswer stores answers,
CAS version, flags/bookmarks, reviewed timestamp and revision-mission reference.

All student lookups use session-derived ownership. Strict schemas reject supplied
identity, role, score, answer keys and timing. Mutations keep existing exact-origin
and JSON validation. Student/auth requests remain limited to 4096 bytes. Only the
new admin blueprint endpoint uses an explicit 32768-byte bound, needed for a
200-question ID selection; actual streamed bytes are counted in the shared reader.

Start, save and finalization use SERIALIZABLE transactions with bounded retries
for PostgreSQL serialization/unique conflicts. Unique owner/request keys and the
partial one-active-attempt index prevent duplicate starts. Stale different saves
return 409; identical repeated saves are replayed. Finalization conditionally
changes IN_PROGRESS only, writes one result and creates no awards. Repeated
submissions return the saved result. Concurrent compare-and-swap failures require
reload/retry and never overwrite a result. Answer writes stop at the deadline;
late save/submit/read finalizes the previously persisted answers. Flags/bookmarks
and review actions after submission cannot change answers or scoring.

Countdown anchors to server time with a monotonic browser timer. Navigation and
confirmed submission save dirty answers first; explicit save, saved/unsaved state,
retry and refresh/resume are available. Unsent offline changes are not guaranteed
to survive closing a tab and cannot be accepted after expiry. The browser retries
expiry finalization at bounded intervals. Server reads, directory access and
starts also lazily finalize expiry. There is NO background expiry worker: an
offline abandoned row can remain IN_PROGRESS until access, but the server never
accepts an answer beyond its deadline. Elapsed time is capped at the deadline.
Application-server clocks must be synchronized across instances.

The directory/history is bounded to 100 definitions and 50 attempts; review uses
20 latest finalized attempts. The builder question catalog is bounded to its
first 200 eligible questions, not a complete bank search/import tool. Review lesson
publication is rechecked before rendering a link or adding a mission.

## Migration: created, NOT applied

`prisma/migrations/20261010000100_timed_mock_exams/migration.sql` adds MockExam,
MockAttempt, MockAnswer and MockAttemptStatus, foreign keys, lifecycle/time/policy
checks, owner/request and attempt/position uniqueness, unique revision task links,
and the partial MockAttempt_one_active index. Historical migrations are untouched.
Prisma cannot express the partial index: preserve it in subsequent schema diffs.

Schema validation and client generation passed locally. They do not prove SQL
application, migration replay, drift, foreign keys or real transaction behavior.
Review and test the forward migration on an explicitly identified disposable
PostgreSQL database before separately authorizing deployment. No migrate or seed
command was executed.

## Checks actually run

```powershell
node node_modules/vitest/vitest.mjs run tests/mock tests/question tests/student/sia.test.ts tests/student/admin-routes.test.ts tests/student/journey-routes.test.ts tests/auth/request-security.test.ts tests/auth/signup-route.test.ts tests/auth/hardening-routes.test.ts --no-cache --no-fsModuleCache --configLoader runner
node node_modules/typescript/bin/tsc --noEmit
node node_modules/prisma/build/index.js validate --config prisma7.config.ts
node node_modules/prisma/build/index.js generate --config prisma7.config.ts
npm.cmd run build
```

Focused verification: 285 tests passed in 15 files. The separate `tests/mock`
command also passed all 94 new tests in three files. This is NOT a full-suite rerun.
The new mock tests exercise pure decimal scoring and mocked persistence/services:
server timing, eligibility, publication, ownership/roles, answer persistence/CAS,
keys, numerical validation, blank penalties, expiry, duplicate starts/submission,
retry exhaustion, modeled conflicting saves, revision restrictions and mission
idempotency. Existing question/auth/request-security and selected journey/admin/SIA
tests passed. TypeScript, Prisma validation/client generation and production build
passed. No lint script exists. No PostgreSQL integration, authenticated browser
interaction, mobile screenshots, offline recovery or actual multi-process races
have been verified. No dependencies were installed.

Database-free smoke check of the built local preview: GET `/api/live` returned
200; unauthenticated GET of `/api/student/mocks`, `/api/student/mocks/revision`
and `/api/admin/mocks` returned 401; `/practice/mock-tests` returned 307 to
`/login`; `/api/auth/readiness` returned 503. No signup/login POST or database
health route was called. Local preview: http://127.0.0.1:3000/practice/mock-tests
(authentication and the unapplied migration still prevent a real exam run).

## Git change manifest

Branch: main. HEAD: 544b9f3a6d4ba3deb3c10b2cfa65fda8ea4eaf42, unchanged.
Started clean; final scope is 11 modified tracked files and 18 new untracked
files. Git emits a permission warning for the global ignore file; repository
status and whitespace checks still exit successfully.

Modified tracked files:
- MASTER_BUILD_STATUS.md
- prisma/schema.prisma
- src/app/[[...path]]/page.tsx
- src/app/admin/page.tsx
- src/components/journey/ProgressDashboard.tsx
- src/screens/Practice.tsx
- src/server/api/admin-handler.ts
- src/server/auth/request-security.ts
- src/server/sia/service.ts
- src/styles/global.css
- tests/student/sia.test.ts

New untracked files:
- TIMED_MOCK_EXAMS.md
- prisma/migrations/20261010000100_timed_mock_exams/migration.sql
- src/app/admin/mock-exams/page.tsx
- src/app/api/admin/mocks/route.ts
- src/app/api/student/mocks/route.ts
- src/app/api/student/mocks/revision/route.ts
- src/app/practice/mock-attempts/page.tsx
- src/app/practice/mock-tests/page.tsx
- src/app/practice/revision/page.tsx
- src/components/mock/AdminMocks.tsx
- src/components/mock/MockFrame.tsx
- src/components/mock/StudentMocks.tsx
- src/server/mock/engine.ts
- src/server/mock/service.ts
- src/server/mock/validation.ts
- tests/mock/engine.test.ts
- tests/mock/routes.test.ts
- tests/mock/service.test.ts

## Remaining release requirements

Identify a disposable PostgreSQL target, review/apply the complete forward
migration chain with approval and exercise real constraints/concurrent instances.
Then run authenticated student/admin browser flows on approved isolated staging,
including disconnection/reconnect, expiry, keyboard access and mobile overflow.
Do not infer staging readiness from mocked tests or a successful build.

This is ordinary practice, not proctored or award-eligible testing. Shared question
bank content can also be practiced through the existing per-question workflow;
its post-submission explanations are not an exam-integrity barrier. No awards,
leaderboards, scheduling windows, delayed-until-window reveal, section-specific
timers, entitlements/payments or external integrations were introduced.

Upstash live credentials/verified disposable target and Railway trusted ingress
remain unresolved external auth prerequisites. No credentials are needed for the
mock domain itself beyond an approved PostgreSQL target and existing sessions.
No commit, push, deployment, database migration, seed, auth activation or
destructive cleanup occurred.

Next build increment: competitions with server-verified attempt eligibility,
leaderboards and idempotent achievement/award administration.
