# Competitions, leaderboards and earned achievements

Implementation: 2026-10-10. Connected code and mocked persistence checks, NOT
production readiness or live PostgreSQL verification. Existing uncommitted mock
work was extended, not replaced. No external service or unidentified DB was used.

## Student and administration routes

- `/compete`: weekly/monthly/custom challenge directory, details, own entry,
  competition leaderboard and overall opt-in placement points.
- `/achievements`: actual earned badges/history, eligibility check, prize status,
  student-controlled sharing, replacement and disablement.
- `/shared/achievements/[token]`: minimal public award claim, no account name,
  user ID, contact details, progress evidence, prize details or question answers.
- `/admin/competitions`: draft configuration/editing, validation/publication,
  closure/cancellation, entry moderation, definitions, award corrections, prize
  review and decision audit trail. Exact PLATFORM_ADMIN role enforced server-side.
- Existing Compete navigation is retained. Mock results link to rankings and
  achievements; Digital Profile embeds earned badges. Competition attempts use
  the existing revision-to-mission flow and study-session navigation. SIA can
  suggest an observed active challenge only after unfinished missions/revision
  are exhausted; it does not claim that the student is eligible or will win.

## Competition configuration and lifecycle

Each competition reserves a unique dedicated mock blueprint. The mock must be
published, unused, single-attempt, unchanged and with explanations withheld.
Creation reserves it; edits/publication changes to a reserved mock require
competition cancellation. Public mock browsing excludes reserved mocks; ordinary
practice cannot start one. A server-only competition path uses the same timed
mock engine, eligibility checks and frozen scoring snapshots. Browser-injected
competition IDs, scores, ranks, identity and awards fail strict validation.

Supported rules: target exam and completed onboarding, minimum saved completed
mock count, capacity 1-1000, raw score or four-decimal percentage score, opening
and closing times, placement ranges, published placement definitions and optional
review-only prize descriptions. Weekly/monthly/custom are challenge categories;
their exact windows are administrator-configured, not invented official schedules.

Persistent states are DRAFT/PUBLISHED/COMPLETED/CANCELLED. PUBLISHED derives
SCHEDULED, ACTIVE and AWAITING_RESULTS from server time. Opening is inclusive;
closing is exclusive. Published configuration is immutable. One entry per student,
unique user/request key and unique attempt mapping prevent duplicate participation.
SERIALIZABLE transactions and bounded unique/serialization retries protect capacity.

Join is a recoverable two-phase workflow: persist one reserved entry, start the
mock with that entry's stable request key, then attach the owned matching attempt.
If interrupted, retry uses the saved key/entry rather than starting another attempt.
A failed start can leave a pending reservation; there is no background reservation
cleanup worker. New starts remain subject to the current window on every retry.

Already-started attempts may finish on their original server deadline after entry
closes, no later than end + configured duration. Admin closure waits until the
entry window closes and non-disqualified starts finish/expire. Missing attempts
receive no score/rank. Cancelled challenges accept no joins or awards; existing
owned attempts remain ordinary practice history. Cancellation clears placements,
revokes competition awards and links, and rejects unfulfilled prizes.

## Verified ranking and privacy

Rank processing reconciles expiry through the existing timed engine, then reads
only persisted finalized results attached to the correct user/mock/window.
It rejects mismatched sources, unsupported result data and late finalization.
No client score or rank is accepted. Current rows are updated in one transaction.
Student participants explicitly refresh verified rankings; administrators close
or recalculate. GET leaderboards do not manufacture results or grant awards.

Ordering: descending configured score, shorter elapsed seconds, earlier saved
participation time. Exact ties share a competition placement (1, 1, 3). A stable
record/alias order only controls pagination within ties, NOT award eligibility.
No random tie-breaking or fabricated national rank is used. Placement ranges can
therefore yield multiple tied eligible awards; prizes still require manual review.

Leaderboards use 25-row pages plus a next-page sentinel. Display names are random
generated participant aliases, never account names. Visibility defaults OFF;
hidden rows show placement but redact alias, score and time. Students explicitly
opt in to show generated alias and competition result, and may opt out later.
Authenticated students receive only their own attempt link/private score.

Overall rankings aggregate only opted-in placements of completed, non-cancelled
challenges for active student accounts: points = SUM(1001 - placement). Ties use
summed elapsed time and earliest participation; exact ties share rank. A bound
SQL query computes ranking/pagination without returning account identifiers.
Opt-in points are not lifetime performance, competency or an all-student rank.

## Earned achievements and prizes

Definitions are separate from earned records. Administrators create/edit unused
draft definitions, publish/withdraw them, and choose badge symbols/thresholds.
Rules supported:
- FIRST_MOCK: a saved finalized nonblank mock attempt, threshold fixed at one.
- STUDY_DAYS: consecutive UTC days with at least 15 recorded session minutes,
  considering up to 1000 finished sessions in the latest 30 days.
- LESSONS: saved completion of currently published lessons; explicitly
  self-reported activity, not verified learning mastery.
- IMPROVEMENT: percentage-point increase between chronologically separate saved
  attempts with identical frozen mock content/rules; no claim across changed exams.
- PLACEMENT: configured range in a completed competition, never preliminary rank.

Eligibility is checked explicitly against persisted activity, not awarded just
for opening a page. Global mock/improvement checks inspect up to 1000 attempts;
definitions/history are bounded to 100. A unique user/definition/scope constraint
and transaction retry prevent duplicate awards, including concurrent rechecks.
Completed competition settlement creates placement awards idempotently. No awards
or definitions were seeded and no real student was awarded during this task.

Earned records snapshot title, symbol, explanation and private evidence. Audit
events record material changes. Recalculation updates changed placement claims,
invalidates previous sharing, revokes lost eligibility, and preserves explicit
administrator revocation. Reordered JSON keys do not cause false corrections.
Administrator restoration rechecks current published rules/persisted evidence;
there is no arbitrary student-supplied accomplishment or score override.

Configured prizes are created PENDING_REVIEW only. An administrator may approve,
reject, return to review, or record confirmed manual fulfilment after approval,
with version checks, current eligibility and an audit reason. FULFILLED is a human
record, NOT an external-service receipt or automatic distribution. Fulfilled
history is preserved if its underlying award is later revoked. No money, gift
card, shipment or external fulfilment request is sent by this implementation.

## Sharing

An owner explicitly enables sharing of an active published achievement. A fresh
256-bit random token is returned once; only SHA256 is stored. Re-enabling rotates
it; disablement/revocation/correction clears the hash. Predictable private award
IDs cannot resolve a public page. Each public lookup requires an active award,
published definition and active student account, and whitelists minimal claim
fields. No share token/secret is logged here. Pages are dynamic, no-index,
no-referrer and no-store. Copying/screenshots cannot be remotely revoked; valid
future server requests are checked again. A replaced/disabled token yields 404.

Student and auth mutations keep the existing 4096-byte bound and exact-origin
checks. Only the new admin authoring endpoint uses a separate streamed 16384-byte
bound so multilingual prize definitions fit. The auth activation gates, login,
signup and session behavior are unchanged.

## Schema and unapplied migration

New models: Competition, CompetitionEntry, AchievementDefinition,
EarnedAchievement, PrizeAward. Existing AuditEvent gains an optional detail field
for administrator decision reasons. Existing User/MockExam/MockAttempt receive
inverse relations; there is no duplicate exam/session/scoring schema.

Forward SQL: `20261010000200_competitions_achievements/migration.sql`, dependent
on the existing unapplied timed-mock migration. Includes foreign keys, state,
window/rank checks, uniqueness for blueprint/entry/request/attempt/earned scope/
share hash/prize and relevant lookup indexes. NOT applied. Historical SQL is
unchanged; no migration/seed/reset command or DB health check was run.

## Commands and actual results

```powershell
node node_modules/vitest/vitest.mjs run tests/competition tests/mock tests/student/sia.test.ts tests/student/admin-routes.test.ts tests/auth/request-security.test.ts tests/auth/signup-route.test.ts tests/auth/hardening-routes.test.ts --no-cache --no-fsModuleCache --configLoader runner
node node_modules/vitest/vitest.mjs run tests/competition --no-cache --no-fsModuleCache --configLoader runner
node node_modules/typescript/bin/tsc --noEmit
node node_modules/prisma/build/index.js validate --config prisma7.config.ts
node node_modules/prisma/build/index.js generate --config prisma7.config.ts
npm.cmd run build
git diff --check
git status --short --untracked-files=all
```

Focused tests: 282 passed in 11 files. Separate new competition suite: 93 passed
in three files. TypeScript, Prisma validation/client generation and production
build passed. No full-suite rerun. No lint script or new dependency installation.
An initial fixture failed to model the second join phase and a fixture initially
had a TypeScript union-access error; both were corrected and final runs passed.

Tests cover windows, roles/publication, source ownership, scoring/ties, pagination,
privacy, capacity/replay, reserved-mock bypass, modeled concurrent earning,
revocation/sharing, placement correction/cancellation, prize permissions and API
origin/body boundaries. Persistence/concurrency and overall SQL are MOCKED;
no PostgreSQL constraints, migration replay or real multi-instance races are proven.

Database-free built-preview smoke: liveness 200; new private APIs 401; Compete and
Achievements redirect to login; malformed share token 404 with no-referrer and
no-store; authentication readiness 503. No signup/login POST or DB query was
performed. Preview: http://127.0.0.1:3001/compete (existing port 3000 left alone).

## Remaining verification and programme work

Identify an approved disposable PostgreSQL database before applying/replaying the
forward migration chain and exercising real concurrent joins, closure/ranking,
award/prize uniqueness and the overall SQL query. Then run authenticated admin/
student/mobile/keyboard/offline/share-revocation browser acceptance on isolated
staging. No browser screenshots or authenticated end-to-end test ran here.

This is ordinary practice-based competition, not proctored high-stakes testing.
The wider shared question bank/practice explanations are not an anti-cheating
barrier. Actual prizes require human review, legal/policy approval and stronger
integrity controls where necessary. Capacity is intentionally capped at 1000;
administration listings are bounded to 100, without full moderation pagination.
No background settlement, outbox/event worker, entry-cleanup job, delivery,
payment or commercial policy was introduced. Application clocks must synchronize.

Live authentication Upstash/ingress verification remains outside this increment;
no activation setting changed. No external provider is needed for this code;
approved PostgreSQL/sessions are needed for live testing, and fulfilment providers
can be connected later with separate authorization/privacy/cost safeguards.

Next build increment: packages, entitlements and payment-provider abstraction,
including signed webhook replay protection and receipts/refunds/notifications.
The overall application programme is NOT complete or cleared for deployment.

## Final Git and preservation

Still main at HEAD 544b9f3a6d4ba3deb3c10b2cfa65fda8ea4eaf42. Started with
29 already-changed files. This increment intentionally extends 11 of those;
the other 18 match the initial SHA256 preservation snapshot byte-for-byte.
One previously clean tracked file (sharing headers in middleware.ts) and
18 new competition files were added to the change scope. Total working tree:
12 modified tracked files and 36 untracked files, including prior mock work.
No file was staged, committed or pushed. No deployment, migration application,
seed, database cleanup, auth activation or dependency installation occurred.
Git reports a global-ignore permission warning but status/diff checks exit 0.
Full status:

```text
 M MASTER_BUILD_STATUS.md
 M middleware.ts
 M prisma/schema.prisma
 M src/app/[[...path]]/page.tsx
 M src/app/admin/page.tsx
 M src/components/journey/ProgressDashboard.tsx
 M src/screens/Practice.tsx
 M src/server/api/admin-handler.ts
 M src/server/auth/request-security.ts
 M src/server/sia/service.ts
 M src/styles/global.css
 M tests/student/sia.test.ts
?? COMPETITIONS_ACHIEVEMENTS.md
?? TIMED_MOCK_EXAMS.md
?? prisma/migrations/20261010000100_timed_mock_exams/migration.sql
?? prisma/migrations/20261010000200_competitions_achievements/migration.sql
?? src/app/achievements/page.tsx
?? src/app/admin/competitions/page.tsx
?? src/app/admin/mock-exams/page.tsx
?? src/app/api/admin/competitions/route.ts
?? src/app/api/admin/mocks/route.ts
?? src/app/api/student/achievements/route.ts
?? src/app/api/student/competitions/route.ts
?? src/app/api/student/mocks/revision/route.ts
?? src/app/api/student/mocks/route.ts
?? src/app/compete/page.tsx
?? src/app/practice/mock-attempts/page.tsx
?? src/app/practice/mock-tests/page.tsx
?? src/app/practice/revision/page.tsx
?? src/app/shared/achievements/[token]/page.tsx
?? src/components/competition/AdminCompetitions.tsx
?? src/components/competition/CompetitionWorkspace.tsx
?? src/components/mock/AdminMocks.tsx
?? src/components/mock/MockFrame.tsx
?? src/components/mock/StudentMocks.tsx
?? src/server/competition/achievements.ts
?? src/server/competition/rules.ts
?? src/server/competition/service.ts
?? src/server/competition/validation.ts
?? src/server/mock/engine.ts
?? src/server/mock/service.ts
?? src/server/mock/validation.ts
?? tests/competition/routes.test.ts
?? tests/competition/rules.test.ts
?? tests/competition/service.test.ts
?? tests/mock/engine.test.ts
?? tests/mock/routes.test.ts
?? tests/mock/service.test.ts
```
