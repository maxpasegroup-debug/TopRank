# Parent and institution portals: implementation evidence

Date: 2026-10-10. Branch: main. Changes are uncommitted.

## Completed and connected

- Dedicated /parent, /teacher, /school, /consent and /admin/portals workspaces;
  /invitations provides bounded token/email/password acceptance, not public signup.
- Reused UserRole, School, SchoolMembership and StudentParentRelationship.
  Institution memberships carry verified duties: teaching, mentor, counselling,
  administration. Existing memberships default UNVERIFIED and cannot authorize
  portal access until an authorized operator reviews them.
- Session-derived identity is reloaded from User. Stale roles, inactive accounts,
  missing/ambiguous tenants, inactive schools and inactive memberships fail closed.
  Platform school access requires explicit tenant selection and audited reason;
  the institution list is bounded and audited. Parents never inherit student APIs.
- Verified guardian proposals are platform-only. Both the student and guardian
  must accept before access becomes ACTIVE. Consent can be narrowed, rejected,
  revoked or expire. Scope expansion requires a new verified proposal after
  revocation; neither acceptance nor narrowing can broaden the proposed scope.
- Institution administrators propose enrolments with an external authorization
  basis/reference; the student must consent before reports or staff access.
  Transfers atomically revoke previous active enrolments and assignments.
  Students and authorized tenant administrators can revoke institution access.
- Staff invitations store SHA-256 token digests only. Tokens are generated with
  32 random bytes, returned once, never placed in a URL or delivered externally.
  Acceptance rechecks issuer, institution, invitation state, expiry and allowed
  role/duty combinations; a compare-and-set claim prevents replay. Existing users
  must authenticate their existing password and have the invited global role.
  Public student accounts cannot be upgraded. No login session is created.
  Reactivated memberships lose old assignments and need explicit reassignment.
- School administrators can invite teachers/mentors/counsellors, not guardians,
  institution administrators or platform administrators. Platform operators alone
  can issue guardian/institution-administrator invitations. Membership changes
  clear assignments and revoke database sessions. School suspension invalidates
  subsequent access and revokes member sessions; reactivation is platform-only.
- Reports return explicit allowlists: learner name, authorized mission/lesson
  counts, latest-100 session minutes, bounded missions and finalized mock scores,
  earned achievements and prize status. Existing verifiedScore is reused.
  Answer snapshots, numerical keys, response explanations, contacts, private
  Help/SIA conversations, moderation evidence and payment records are excluded.
- Staff see only assigned, actively enrolled students with appropriate scopes.
  Counsellors receive COUNSELLING only; ordinary staff and administrators cannot
  read confidential feedback. Counsellors see their own confidential notes and
  the student sees shared notes under current consent. Private Get Help records
  are not repurposed as institution data. No unrestricted student search exists.
- Bounded 25-enrolment CSV pages enforce the same tenant and activity-consent
  rules, require an audit reason and escape spreadsheet formula prefixes.
  Institution profiles, scoped announcements/withdrawal and audit views connect
  to the workspace. Parents see school announcements only under guardian and
  active enrolment announcement scopes. Portal notices reuse the existing
  CommerceNotification persistence, IN_APP only; no delivery transport is invoked.
- Digital Profile links to consent. Administration links to institution controls.
  The student six-item primary navigation is unchanged. Parent SIA guidance is
  deterministic and based only on shared activity, not private conversations.

## Schema and unapplied migration

`prisma/migrations/20261010000400_portal_consent_tenants/migration.sql`
was generated with Prisma's schema-to-schema diff, without database access.
It extends the canonical guardian lifecycle and school/member metadata, adds
SchoolEnrollment, SchoolStaffAssignment, PortalInvitation, PortalFeedback and
SchoolAnnouncement, and leaves all historical migrations untouched.

Composite tenant foreign keys prevent an assignment crossing school/enrolment
or school/membership ownership. Unique relationships/memberships/request keys,
one-active-institution enrolment and one-pending-target invitation indexes,
invitation role/duty/state checks and consent constraints complement serializable
transactions with bounded retries. Guardian ACTIVE-consent validation is NOT VALID
for historical rows; new/updated rows must satisfy it, while old incomplete ACTIVE
records fail closed in application checks. Review real existing data before any
future constraint validation. Nothing was migrated, reset, deleted or seeded.

## Verification

Commands actually run:

```powershell
node node_modules/vitest/vitest.mjs run tests/portal --no-cache --no-fsModuleCache --configLoader runner
node node_modules/vitest/vitest.mjs run tests/portal tests/mock tests/competition tests/commerce tests/student tests/content tests/auth/signup-route.test.ts tests/auth/validation.test.ts tests/auth/roles.test.ts tests/auth/hardening-routes.test.ts tests/auth/request-security.test.ts --no-cache --no-fsModuleCache --configLoader runner
node node_modules/typescript/bin/tsc --noEmit
node node_modules/prisma/build/index.js validate --config prisma7.config.ts
node node_modules/prisma/build/index.js generate --config prisma7.config.ts
npm.cmd run build
git diff --check
git status --short --untracked-files=all
git branch --show-current
git rev-parse HEAD
git remote
```

Final focused run: **696 passing tests in 27 files**, including **204 portal
tests in 4 files**. TypeScript, Prisma validation/client generation, production
build and tracked diff whitespace checks passed. An intermediate TypeScript
failure in a table-driven test was corrected to use explicitly wrapped fixtures;
the final runs passed. This was not a full-suite rerun or live Upstash verification.

Tests cover fresh role/status authorization; guardian ownership/expiry/revocation;
tenant injection; assigned teachers/mentors/counsellors; private projections;
invitation lifecycle/digests/replay/issuer changes; no public-role upgrades;
consent narrowing/version conflicts/transfers/removal; bounded exports; scoped
feedback; notification ownership; origin/body limits; activation gating and
generic errors. Existing signup/authentication and module regressions passed.

All persistence tests use mocks. Transaction rollback, concurrent uniqueness,
actual FK/CHECK enforcement and PostgreSQL migration execution are **NOT VERIFIED**.
Authenticated browser acceptance is **MANUAL / NOT VERIFIED**. Anonymous HTTP
checks on port 3003 found /invitations 200, protected portal pages 307 to login,
/api/portal 401 with no-store and /api/auth/readiness 503 with no-store. No cookies,
credentials, protected student records or database connections were used.

## Limitations and operator prerequisites

- This is not production-ready. Supply a positively identified disposable
  PostgreSQL target and explicit authorization before migration/integration work.
  Verify concurrent claims, rollback, transfers, composite tenant constraints,
  legacy-data handling and revocation across authenticated sessions there.
- Authorization basis/reference fields record trusted operator attestations;
  they do not automatically verify legal guardianship or identity documents.
  Age-dependent consent, lawful basis, identity proof, retention/deletion policy
  and institutional access policy need approved requirements and operator review.
  No legal compliance, legal retention periods or guardian verification provider
  is invented or claimed. This workflow requires explicit student consent and
  guardian acceptance rather than assuming an institution can substitute for it.
- No classes/group hierarchy, attendance, grades, wellbeing assessments,
  competency estimates, counselling booking or teacher availability exists in
  this increment. Individual staff assignments are the authorization unit.
  Read-only consent oversight is confined to institution enrolments; school admins
  cannot inspect or grant guardian relationships. Broader access policies require
  a reviewed extension, not inherited permissions.
- Reports are recent bounded summaries, not complete longitudinal analytics or
  inferred improvement scores. Institution student/export pages paginate; staff,
  invitation, audit, feedback and announcement views return bounded recent lists.
  Guardian/own consent views are capped at 100 records. Full-history workflows,
  invitation resend/delivery, proactive expiry jobs and policy-defined deletion
  remain unimplemented. Expired authorization is rejected on every request.
- No external invitations/notifications, payments or AI transports are connected
  or activated. Production auth remains blocked; Railway trusted-ingress and
  dedicated live Upstash verification remain unresolved by this task.
- API limits protect body size and public invitation acceptance uses existing
  auth budgets. Broader authenticated portal write/read abuse quotas remain a
  separate operational hardening task. No production activation occurred.
- Local preview: http://localhost:3003/invitations. It is an anonymous HTTP smoke
  preview, not an authenticated browser acceptance environment.

## Preservation and Git

Started with 68 dirty paths. All 63 baseline paths except the deliberately
extended schema, admin page, Profile navigation, SIA service and status document
remain byte-for-byte unchanged. The final working tree is intentionally dirty;
see the final status snapshot below. No commit, push, branch change, deployment,
dependency installation, database migration/seed, production integration
activation or destructive Git/data cleanup occurred. GitHub synchronization
was not refreshed or verified. A Git global-ignore permission warning was observed;
commands otherwise completed successfully. Review all staged files before committing.

## Single next task

Controlled disposable-PostgreSQL and authenticated-browser verification of the
pending migrations and portal authorization, with explicit target confirmation.

## Final status snapshot

Branch main, HEAD 544b9f3a6d4ba3deb3c10b2cfa65fda8ea4eaf42.
14 modified tracked files and 75 untracked files; this includes earlier modules.

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
 M src/server/content/service.ts
 M src/server/sia/service.ts
 M src/styles/global.css
 M tests/content/service.test.ts
 M tests/student/sia.test.ts
?? COMMERCE_FOUNDATION.md
?? COMPETITIONS_ACHIEVEMENTS.md
?? PORTALS_CONSENT_TENANTS.md
?? TIMED_MOCK_EXAMS.md
?? prisma/migrations/20261010000100_timed_mock_exams/migration.sql
?? prisma/migrations/20261010000200_competitions_achievements/migration.sql
?? prisma/migrations/20261010000300_commerce_foundation/migration.sql
?? prisma/migrations/20261010000400_portal_consent_tenants/migration.sql
?? src/app/achievements/page.tsx
?? src/app/admin/commerce/page.tsx
?? src/app/admin/competitions/page.tsx
?? src/app/admin/mock-exams/page.tsx
?? src/app/admin/portals/page.tsx
?? src/app/api/admin/commerce/route.ts
?? src/app/api/admin/competitions/route.ts
?? src/app/api/admin/mocks/route.ts
?? src/app/api/payments/razorpay/route.ts
?? src/app/api/portal/invitations/accept/route.ts
?? src/app/api/portal/route.ts
?? src/app/api/student/achievements/route.ts
?? src/app/api/student/commerce/route.ts
?? src/app/api/student/competitions/route.ts
?? src/app/api/student/mocks/revision/route.ts
?? src/app/api/student/mocks/route.ts
?? src/app/compete/page.tsx
?? src/app/consent/page.tsx
?? src/app/invitations/page.tsx
?? src/app/packages/page.tsx
?? src/app/parent/page.tsx
?? src/app/practice/mock-attempts/page.tsx
?? src/app/practice/mock-tests/page.tsx
?? src/app/practice/revision/page.tsx
?? src/app/school/page.tsx
?? src/app/shared/achievements/[token]/page.tsx
?? src/app/teacher/page.tsx
?? src/components/commerce/CommerceWorkspace.tsx
?? src/components/competition/AdminCompetitions.tsx
?? src/components/competition/CompetitionWorkspace.tsx
?? src/components/mock/AdminMocks.tsx
?? src/components/mock/MockFrame.tsx
?? src/components/mock/StudentMocks.tsx
?? src/components/portal/PortalWorkspace.tsx
?? src/components/portal/portal.css
?? src/server/commerce/access.ts
?? src/server/commerce/notifications.ts
?? src/server/commerce/provider.ts
?? src/server/commerce/service.ts
?? src/server/commerce/transaction.ts
?? src/server/commerce/validation.ts
?? src/server/commerce/webhook.ts
?? src/server/competition/achievements.ts
?? src/server/competition/rules.ts
?? src/server/competition/service.ts
?? src/server/competition/validation.ts
?? src/server/mock/engine.ts
?? src/server/mock/service.ts
?? src/server/mock/validation.ts
?? src/server/portal/authorization.ts
?? src/server/portal/invitations.ts
?? src/server/portal/reporting.ts
?? src/server/portal/service.ts
?? src/server/portal/validation.ts
?? tests/commerce/provider.test.ts
?? tests/commerce/routes.test.ts
?? tests/commerce/service.test.ts
?? tests/competition/routes.test.ts
?? tests/competition/rules.test.ts
?? tests/competition/service.test.ts
?? tests/mock/engine.test.ts
?? tests/mock/routes.test.ts
?? tests/mock/service.test.ts
?? tests/portal/authorization.test.ts
?? tests/portal/lifecycle.test.ts
?? tests/portal/privacy.test.ts
?? tests/portal/routes.test.ts
```
