# TopRank AI master build: implementation status
Date: 2026-10-10 (Asia/Calcutta)

## Current increment: parent and institution portals

2026-10-10: Connected guardian, school, teacher/mentor/counsellor and student
consent workspaces, verified operator proposals, scoped reporting/exports,
institution lifecycle, single-use invitations, membership/assignment controls,
feedback privacy, announcements, audit and in-app notices. Canonical role/school/
guardian models extended; fresh server identity, membership and consent checks
fail closed. See PORTALS_CONSENT_TENANTS.md for exact commands and policies.
696 focused checks in 27 files passed, including 204 portal tests. Types, Prisma
validation/generation, production build and diff checks passed. Migration
20261010000400_portal_consent_tenants is UNAPPLIED. Persistence tests are mocked;
real PostgreSQL and authenticated browser acceptance are NOT VERIFIED. Legal
consent/identity/retention policies require approval. No commit, push, deployment,
database access, migration/seed, dependency installation or integration activation.
63 of 68 pre-existing dirty paths remain byte-for-byte unchanged; five were
deliberately extended. Production auth/payment delivery remains disabled.

Next task: controlled disposable-PostgreSQL and authenticated-browser verification
of pending migrations and portal authorization, after explicit target confirmation.

## Previous increment: commerce foundation

2026-10-10: Added immutable administrator-defined package versions, boolean
feature grants/gates, server-owned orders, test-only Razorpay transport, verified
capture/event fulfilment, payment receipts, refund review/confirmation and
notification intent/consent/retry foundations. Student /packages and admin
/admin/commerce connect to Profile and administration. See COMMERCE_FOUNDATION.md
for exact commands, policies and limitations. 416 focused tests in 15 files
passed, including 124 commerce tests. Types, Prisma and build checks passed.
Migration 20261010000300_commerce_foundation is UNAPPLIED. Runtime commerce is
unconditionally disabled; no credentials or toggles activate it. No provider
calls, messages, transactions or database access occurred. No legacy financial
implementation exists in this checkout; AI pooled accounting remains unresolved.

## Previous increment: competitions and achievement administration

2026-10-10: Added dedicated timed-mock challenges, server-derived ranked results,
opt-in aliases/pagination, explicit earned-activity checks, placement awards,
prize moderation, corrections/revocation and revocable minimal sharing. Compete,
Digital Profile, mock results, existing revision-to-mission flow and deterministic
SIA are connected. See COMPETITIONS_ACHIEVEMENTS.md for policies and exact checks.
282 focused tests in 11 files passed, including 93 competition tests. TypeScript,
Prisma validation/client generation and production build passed. Persistence and
overall-ranking SQL are mocked, not live PostgreSQL evidence. Forward migration
created but unapplied; no auth activation, commit, push, deployment or DB access.

## Previous increment: timed mocks and revision

2026-10-10: Implemented timed mock blueprints/admin publication, owner-bound
resumable attempts, server deadlines/scoring, results and persisted review state.
Practice/learning, Digital Profile, mission revision and deterministic SIA are
connected. See [TIMED_MOCK_EXAMS.md](TIMED_MOCK_EXAMS.md) for current commands,
policies and limitations. Focused checks passed: 285 tests in 15 files,
TypeScript, Prisma validation/generation and production build. No full-suite
rerun, PostgreSQL integration or authenticated browser verification was performed.

This increment started from a clean main at
544b9f3a6d4ba3deb3c10b2cfa65fda8ea4eaf42; new changes are uncommitted.
The forward timed-mock migration is created but unapplied. No historical
migration changed, database accessed, commit/push/deployment or authentication
activation occurred. Remote synchronization was not verified.

## Previous increment summary (historical evidence)

This is a substantial implementation increment, not completion of the master
programme and not approval for private staging deployment. No commit, push,
deployment, database connection, migration application, seed or provider call
was performed. New persistence is implemented in code and tested with mocks;
it has NOT been demonstrated against PostgreSQL.

The initial full suite confirmed 287 passing tests and one skipped Upstash live
test. The final suite has 373 passing tests and the same skipped live test.
Branch remains main, HEAD bd2a14d99fe236bea5b8edd2b020d047c4c49364.
GitHub synchronization was not refreshed or verified in this implementation.

All 31 pre-existing dirty files other than the deliberately extended schema
match the preservation snapshot byte-for-byte. The snapshot was taken after
the first small schema edit, not before it; schema preservation was reviewed
against its existing contents/diff. Existing protected-answer and security
changes remain intact. Historical migrations were not changed.

## Feature matrix

"Implemented" here means connected code plus local checks, NOT live persistence.

| Area | State | Evidence and remaining work |
| --- | --- | --- |
| Authentication/security | Existing implementation preserved; production disabled | Student-only signup, sessions, origin/body protection, POST logout, distributed limiter preserved; Upstash/ingress/DB not live-verified |
| Onboarding | Implemented code; approved visual matching pending | Five steps, saved aspirations/goals/exam/year/date/time/subjects, preview, confirmation; no Stitch exports were accessible |
| Exam directory | Partial | Published active catalogue, searchable exam choice, category metadata, audited admin draft creation and publication; no invented official notices |
| Learning | Partial | Existing exam/subject/chapter/lesson queries, scoped full-path navigation, HTTPS resource links, saved lessons and self-reported completion; mock revision links are connected; full content authoring/import UI remains |
| Mission Board | Implemented core; broader scheduling partial | Seven-day deterministic draft, transactions, owner-bound tasks, completion, skips, rescheduling, version conflicts, events, one active plan/session; no separate weekly milestone engine |
| Practice | Implemented single-question core | Server scoring, idempotent immutable attempt snapshots/history, explanations after submission; explicit per-link rule required |
| Timed mock exams/revision | Implemented code; live verification pending | Blueprints/publication, frozen private snapshots, server deadlines/resume/save/flags/bookmarks, immutable results and persisted revision; forward migration unapplied; see TIMED_MOCK_EXAMS.md |
| Digital Profile | Partial | Actual task/lesson/session data plus recent observed mock results and revision links; no competency/readiness, improvement estimates or certificates |
| Get Help | Partial | Saved owner-bound requests, admin response queue/audit; teacher directory, availability, booking and counselling not implemented |
| TeachX Guru | Disabled; interface contract only | No concrete transport, credentials or verified external API contract found |
| Competition/achievements | Connected implementation; live verification pending | Dedicated mock challenges, verified-source ranks, private aliases, opt-in overall points, earned activity/placement badges, prize review, corrections and revocable sharing; migration unapplied; no fulfilment transport |
| Packages/entitlements/payments | Commerce foundation connected; runtime disabled | Immutable catalogue, resource gates/grants, verified-capture fulfilment, receipts/refund operations; test-only Razorpay adapter; migration unapplied; checkout hand-off/live verification/recurring billing pending |
| Notifications/delivery | Persisted foundation; external delivery disabled | In-app messages, consent, event/channel deduplication, bounded claims/retries, delivery states and expiry checks; no external provider connected or remote delivery claimed |
| Parent/school/teacher portals | Connected code; live verification pending | Fresh tenant/guardian/assignment scopes, dual consent, provisioning, scoped summaries/exports, private feedback and announcements; migration unapplied; external legal verification/policy and authenticated DB/browser tests pending |
| Operations | Partial implemented workspace | Platform-admin-only publication, question review/scoring-mode selection, exam draft creation and help responses; audited; authoring, staff provisioning and pagination remain |
| SIA | Deterministic fallback implemented; AI disabled | Uses saved goals/missions/revision and observed active challenge suggestions; no invented eligibility or provider calls |
| Navigation/polish | Partial | Six requested primary destinations, real Learn/Practice paths, responsive CSS and loading/error/empty states; browser/accessibility QA not performed |
| Railway | Configuration prepared only | Node 22 family, build/start, database-free liveness, setup/recovery guide; not deployed or staging-ready |

## Architecture and database

Existing Next.js/React/TypeScript/Prisma/PostgreSQL architecture is retained.
Domain services live under server/journey, server/practice, server/help,
server/operations and server/sia. Shared student/admin handlers obtain the
authenticated server identity, enforce roles, validate bounded JSON and origin,
and use the existing response envelope. Personal reads/mutation successes are
no-store. Unexpected driver/provider error objects are no longer copied into
API logs or responses.

Added profile fields: aspiration, personal target score, preparation start date,
focus subjects. Added exam metadata: category, description, official URL.
Added StudyPlan, MissionTask, MissionTaskEvent, StudySession,
StudentLessonProgress, PracticeAttempt, HelpRequest and AuditEvent.

Plan confirmation hashes the reviewable draft to detect intervening goal/content
changes, rereads data inside a serializable transaction and uses a unique
owner/request identifier. Conflicts get bounded retries. Task updates compare
versions and append history transactionally. Sessions use server timestamps
and owner filters, not browser elapsed-time claims.

Study/session/completion data is self-reported activity, not verified mastery.
The progress view shows elapsed time for the latest 100 finished sessions,
clamped to 720 minutes per session. It is not a total-lifetime study metric.

Practice uses Prisma Decimal, existing configured marks/negative marks and
explicit EXACT_SET or DECIMAL_EXACT mode. There is no partial-credit, tolerance,
rounding or blank-answer policy inferred automatically. Unsupported/incomplete
rules fail validation before insertion. Student question responses still exclude
keys and explanations; attempt explanations are available only after submission.
Attempts snapshot question text, explanation and results. This is ordinary
practice, not a secure timed examination or award eligibility engine.

## Migrations and execution

| Migration | Origin | Execution |
| --- | --- | --- |
| 20261009000100_protected_numerical_answers | Existing preserved work | Not applied here |
| 20261009000200_student_journey | New | Not applied |
| 20261009000300_practice_attempts | New | Not applied |
| 20261009000400_help_and_audit | New | Not applied |
| 20261010000100_timed_mock_exams | Timed-mock increment | Not applied |
| 20261010000200_competitions_achievements | Competition increment | Not applied |
| 20261010000300_commerce_foundation | Commerce increment | Not applied |

No migration history/checksum was changed. No database-reset/delete commands
were run. Schema validation/client generation do not validate SQL application,
real foreign keys, transactions, index enforcement, migration replay or drift.
Partial unique indexes in journey SQL enforce one active plan/session; Prisma
does not represent these indexes, so preserve them during future diffs.

## Previous increment verification (historical)

- `node node_modules/vitest/vitest.mjs run --no-cache --no-fsModuleCache --configLoader runner`: PASS, 373 tests; 26 files passed, one live test/file skipped.
- Focused student/content tests: PASS before the final full run.
- Focused question suite: PASS before the final full run.
- `node node_modules/typescript/bin/tsc --noEmit`: PASS.
- `node node_modules/prisma/build/index.js validate --config prisma7.config.ts`: PASS.
- `node node_modules/prisma/build/index.js generate --config prisma7.config.ts`: PASS.
- `npm run build`: PASS, client generation + Next production compilation/type checks/prerender.
- `git diff --check`: PASS (line-ending warnings only).
- Built local preview GET /api/live: HTTP 200, alive.
- Built local preview GET /api/auth/readiness: HTTP 503, generic AUTH_UNAVAILABLE.
- No signup/login request, production authentication activation or provider call was run.
- No browser was available through CUA; local Playwright packages were absent.
  No dependencies/browsers were installed. Screenshots, mobile interaction,
  canvas/pixel checks and accessibility verification were NOT performed.

The development server initially started on port 3000 was stopped. The built
preview now runs at http://127.0.0.1:3000 on production runtime, PID 60968.
It listens on loopback only. Signup/login are intentionally unavailable.
Do not use credentials or attempt database-dependent workflows until the
disposable database target is identified and its migrations are approved.

## External prerequisites and unresolved security blockers

At the historical audit, all five live-test variables were checked by presence only and were missing (not rechecked in the commerce increment):
UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, AUTH_RATE_LIMIT_TEST_TARGET,
AUTH_RATE_LIMIT_TEST_ENDPOINT_SHA256, RUN_UPSTASH_LIVE_TESTS. No credential,
connection string or actual fingerprint was printed. Production activation,
live-verification and trusted-ingress attestations are not enabled.

Configure the dedicated disposable Free-tier target locally using
AUTHENTICATION_HARDENING.md and the existing gated test. The target marker is
dedicated-upstash-free; endpoint confirmation is the lowercase 64-character
SHA256 of the normalized endpoint computed by the existing helper. Never
invent that fingerprint or set attestation flags merely to bypass validation.

Railway trusted ingress remains unresolved. Existing loopback DATABASE_URL
does not establish a safe test target; no connection was made. Supply an
explicitly identified disposable PostgreSQL target plus permission for its
migration/integration workload before any live database verification.

Supply all five Stitch exports: SIA Welcome, Dream Book, revised Exam and Goal
Setting, Mission Board Creation, revised Student Mission Control.
The current UI is a reusable working implementation, not an approved-design match.

TeachX, payment, AI, email and WhatsApp need real provider contracts, approved
sandbox access and privacy/cost limits. Do not put secrets in chat or Git.
Interfaces are not successful integrations and do not auto-activate with keys.

## Remaining release risks and next work

The full programme has not reached its final staging-deployment boundary.
Additional safe code implementation remains; missing credentials do not explain
all unfinished features in the matrix. Commerce foundation now exists but requires
controlled database/provider/browser staging verification. Consent/tenant portals
and controlled staff provisioning are the single next recommended build module.

Live PostgreSQL verification is needed before relying on new persistence,
constraints or concurrency behavior. No migration drift/checksum audit against
an actual database was possible. Content scoring modes default to null so
existing content needs an authorized review/configuration before it can score.
The admin lists are bounded to 100 records without pagination.
Resource/lesson legacy APIs still support slug-only lookups; full UI paths are
scoped, but a future API revision should disambiguate duplicate child slugs.
Profile edits and publication workflows need broader concurrent-edit testing.
New APIs need capacity/abuse testing; the authentication limiter is not a
general-purpose limit for all student/admin endpoints.
No authoritative content/catalogue readiness, browser QA, commercial-policy
review, privacy review, backup restore or staging performance test was done.

See RAILWAY_STAGING.md for exact private-access setup, manual migration review,
environment requirements, recovery and the post-hosting acceptance checklist.
Do not activate authentication, deploy publicly, provision paid resources or
declare production readiness from these local checks.

## Previous increment Git snapshot (historical)

Current changed-file status is in COMMERCE_FOUNDATION.md. The following snapshot
predates the user's latest commit and the timed-mock increment.

This includes existing user work and this increment. No files were staged,
committed or pushed. Generated Prisma/build output is ignored. The only
pre-existing dirty file extended in this increment is prisma/schema.prisma.
The complete path inventory follows; M means modified, ?? means untracked.
`next-env.d.ts` was regenerated by Next and its original import paths and
CRLF line endings restored. Git still reports its working-tree stat as modified,
but `git diff -- next-env.d.ts` is empty; there is no content change.

```text
 M QUESTION_BANK_FOUNDATION.md
 M next-env.d.ts
 M package.json
 M prisma/schema.prisma
 M prisma/seed.ts
 M src/app/[[...path]]/page.tsx
 M src/app/api/auth/login/route.ts
 M src/app/api/auth/logout/route.ts
 M src/app/api/auth/signup/route.ts
 M src/app/api/student/profile/route.ts
 M src/app/routes.ts
 M src/components/practice/QuestionCard.tsx
 M src/components/ui/Icon.tsx
 M src/screens/AuthPages.tsx
 M src/screens/Home.tsx
 M src/screens/Learn.tsx
 M src/screens/Onboarding.tsx
 M src/screens/Practice.tsx
 M src/screens/Progress.tsx
 M src/screens/learning/LessonExperience.tsx
 M src/screens/practice/PracticeReview.tsx
 M src/screens/practice/QuestionExperience.tsx
 M src/server/api/responses.ts
 M src/server/auth/validation.ts
 M src/server/content/service.ts
 M src/server/question/import.ts
 M src/server/question/service.ts
 M src/server/student/service.ts
 M src/server/student/validation.ts
 M src/styles/global.css
 M src/types/navigation.ts
 M tests/auth/validation.test.ts
 M tests/content/service.test.ts
 M tests/question/import.test.ts
 M tests/question/service.test.ts
 M tests/student/profile-route.test.ts
 M tests/student/service.test.ts
?? .node-version
?? AUTHENTICATION_HARDENING.md
?? RAILWAY_STAGING.md
?? prisma/migrations/20261009000100_protected_numerical_answers/migration.sql
?? prisma/migrations/20261009000200_student_journey/migration.sql
?? prisma/migrations/20261009000300_practice_attempts/migration.sql
?? prisma/migrations/20261009000400_help_and_audit/migration.sql
?? railway.json
?? src/app/admin/page.tsx
?? src/app/api/admin/exams/route.ts
?? src/app/api/admin/help/route.ts
?? src/app/api/admin/publication/route.ts
?? src/app/api/auth/readiness/route.ts
?? src/app/api/live/route.ts
?? src/app/api/student/help/route.ts
?? src/app/api/student/journey/route.ts
?? src/app/api/student/learning-progress/route.ts
?? src/app/api/student/missions/preview/route.ts
?? src/app/api/student/missions/route.ts
?? src/app/api/student/practice/attempts/route.ts
?? src/app/api/student/progress/route.ts
?? src/app/api/student/sia/route.ts
?? src/app/api/student/study-sessions/route.ts
?? src/components/journey/ExamEditor.tsx
?? src/components/journey/GetHelp.tsx
?? src/components/journey/JourneyWizard.tsx
?? src/components/journey/LessonActions.tsx
?? src/components/journey/MissionBoard.tsx
?? src/components/journey/OperationsWorkspace.tsx
?? src/components/journey/ProgressDashboard.tsx
?? src/components/journey/client.ts
?? src/components/practice/AnswerSubmission.tsx
?? src/components/practice/AttemptHistory.tsx
?? src/server/api/admin-handler.ts
?? src/server/api/student-handler.ts
?? src/server/auth/configured-rate-limit.ts
?? src/server/auth/rate-limit-identity.ts
?? src/server/auth/rate-limit.ts
?? src/server/auth/redis-rate-limit.ts
?? src/server/auth/request-security.ts
?? src/server/auth/upstash-rest.ts
?? src/server/content/resource-url.ts
?? src/server/help/service.ts
?? src/server/integrations/providers.ts
?? src/server/journey/planner.ts
?? src/server/journey/service.ts
?? src/server/journey/validation.ts
?? src/server/operations/service.ts
?? src/server/practice/scoring.ts
?? src/server/practice/service.ts
?? src/server/practice/validation.ts
?? src/server/sia/service.ts
?? tests/auth/hardening-routes.test.ts
?? tests/auth/readiness.test.ts
?? tests/auth/redis-rate-limit.test.ts
?? tests/auth/request-security.test.ts
?? tests/auth/signup-route.test.ts
?? tests/auth/signup-ui.test.ts
?? tests/auth/upstash-live.test.ts
?? tests/auth/upstash-rest.test.ts
?? tests/auth/upstash-test-target.ts
?? tests/question/attempts.test.ts
?? tests/question/numerical-api.test.ts
?? tests/question/scoring.test.ts
?? tests/student/admin-routes.test.ts
?? tests/student/journey-routes.test.ts
?? tests/student/journey.test.ts
?? tests/student/operations.test.ts
?? tests/student/sia.test.ts
?? MASTER_BUILD_STATUS.md
```
