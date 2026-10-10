# Commerce foundation: packages, access and payment operations

Date: 2026-10-10. Implementation increment, NOT production activation or release approval.

## Implemented and connected

- Immutable package versions with explicit administrator-entered INR prices in
  paise, billing metadata, fixed access duration, features and availability dates.
  Draft/publication/retirement and one published version per code. No products,
  prices, commercial terms or catalogue fixtures were seeded.
- Boolean feature definitions, explicitly bound lesson/mock access rules,
  owner-bound purchased access, trial/admin grants, half-open validity windows,
  expiration and revocation. Protected lesson detail checks cover both API and
  server-rendered content. New mock starts check the gate inside their transaction.
  Unbound resources stay free; existing owned mock attempts/results remain
  accessible under their original lifecycle, including after a grant expires.
- Server-created orders freeze package terms, amount and currency. Owner/request
  keys protect retries. Provider order creation is claimed before the external
  call. Ambiguous creation becomes REVIEW; interrupted CREATING needs review.
  Neither is automatically retried because Razorpay order creation was not
  assumed to have a provider-side idempotency guarantee.
- Normalized provider orchestration and a test-key-only Razorpay REST adapter:
  order creation, payment lookup, raw-body HMAC validation, refund requests with
  stable idempotency keys, and refund status lookup. Existing integrations/
  providers.ts interfaces and availability flags remain unchanged. The old
  checkout-URL contract is not falsely implemented as a hosted Razorpay URL.
- Durable verified event metadata (not full payloads), collision/replay checks,
  recoverable failures and admin retry. Every callback/event requires fresh
  server API payment verification and exact local order/amount/currency binding.
  Client success redirects do not authorize access. Authorization alone does not
  fulfil. An unassociated provider-side partial/full refund blocks fulfilment.
- Capture, purchase grants, notification intent and payment receipt are written
  transactionally. Unique grant provenance/receipt keys and serializable bounded
  retries protect local fulfilment. Old failures cannot downgrade capture;
  duplicate captures cannot extend grants or resurrect refunded access.
- Owner-bound refund requests, reserved remaining amounts, explicit admin
  review/audit, provider-idempotent submission and independent status lookup.
  Submission is not completion. Ambiguous submissions remain SUBMITTING and use
  the same key on retry. Verified pending/failed/processed states are separate.
- Conservative refund policy: ANY confirmed refund, including a partial refund,
  revokes ONLY the purchase grants from that order. Other purchases/trials/admin
  grants are untouched. Original order amounts and receipts remain unchanged.
  This technical policy needs commercial approval before activation.
- Receipt records and owner-only history identify the order, original amount,
  currency, verification time and current payment state. They are explicitly
  payment receipts, NOT tax invoices. No tax registrations were fabricated.
- In-app notification records, plain-text templates, channel/event deduplication,
  owner read state, consent preferences, bounded delivery claims/retries and
  operational failures. Payment/order/grant/refund/expiry triggers are connected.
  Admin dispatch checks up to 100 near-expiry grants and 25 delivery jobs.
  IN_APP AVAILABLE does not imply email/WhatsApp delivery. ACCEPTED is distinct
  from DELIVERED; only provider delivery lookup can establish remote delivery.
- External email requires an adapter explicitly declaring idempotent sending,
  stable record IDs, current consent and active account checks. Transport work
  has a five-second timeout. WhatsApp stays blocked: an existing phone field is
  insufficient evidence of a verified contact/channel contract.
- /packages contains persisted catalogue comparisons, access, orders, receipt
  details, refunds and notifications. /admin/commerce contains package/feature
  management, gates/grants/revocation, orders/events, refund review and delivery
  operations/audits. Digital Profile and the admin workspace link these views.
  Forms retain in-memory request keys for repeated purchase/refund/grant intent.

## Disabled and partial functionality

configuredCommerceProvider() unconditionally returns null. No environment
variable, credential, client input or consent toggle activates commerce.
Runtime purchases, payment callbacks, refund submission/refresh and webhooks
fail closed with PAYMENTS_DISABLED. Runtime notification dispatch has no
external provider. There were NO provider API calls, charges, refunds or messages.

The adapter supports only test-mode credentials and INR normal refunds; no
instant refunds, subscriptions/mandates, automatic capture, provider cancellation,
settlement/disputes, payment links or tax invoices are claimed. Billing intervals
are metadata on fixed-duration one-time access purchases, not auto-renewal.
No legacy subscription was imported or treated as paid without verified evidence.

Browser checkout hand-off and sandbox runtime wiring remain a later controlled
staging task. No Razorpay checkout script is loaded, and the purchase button is
disabled. Catalogue/admin/access workflows are independent of that activation.
The adapter contract is neutral; only Razorpay has a concrete implementation.
Multiple simultaneous providers require namespaced references/callback schemas
before adding another adapter; a provider-name string does not establish support.

No automatic order-creation reconciliation, provider order cancellation,
out-of-band refund association/import, recurring billing, scheduled job hosting,
full pagination, receipt PDF/email attachment, or separate delivery-attempt
history table was added. Operational lists are bounded to 100. Notification
records retain aggregate attempts/latest state; permanent failures stop retries.
Actual external duplicate prevention depends on a verified idempotent provider
contract, not merely on an adapter capability flag. Slow-body/traffic controls,
general commerce rate limiting, retention and clock synchronization require
staging/ingress review. Public external lesson URLs are not DRM-protected by
the application's gate.

## Legacy and pooled-accounting investigation

Case-insensitive searches across current repository source, tests, schema and
documentation found NO Razorpay transport, subscription/wallet ledger, LearnX,
Save Time or earnings workflow. The existing integration file contains contracts
only. No approved package catalogue or prices exist in this checkout.
Those workflows cannot be regression-tested or repaired here without their
actual implementation/data and an approved compatibility/accounting contract.
Nothing was silently replaced; the existing integration contracts were retained.

There is no AI-credit ledger or pooled allocation/debit implementation to audit.
The reported pooled-accounting risk is UNRESOLVED, not fixed. This engine stores
boolean access, never fungible credit balances or quantities. Canonical AI,
credit, wallet and earnings feature families are rejected for packages/grants.
AI-credit sales, grants and pooled accounting remain disabled.

## Schema and migration safety

11 new models: CommerceFeature, CommerceGate, CommercePackage, CommerceOrder,
CommercePayment, CommerceEvent, Entitlement, CommerceReceipt, CommerceRefund,
NotificationPreference and CommerceNotification; inverse User relations only.
No existing column/ledger or historical migration was changed.

Forward migration: prisma/migrations/20261010000300_commerce_foundation/migration.sql.
It creates foreign keys, unique owner/request and fulfilment identifiers, money/
currency/state/window checks, one-published-version partial index and immutable
package/order/receipt triggers. It has NOT been applied. New resource reads
need the approved forward migration chain before database-backed use.

SQL was generated with a schema-to-schema diff, without a database connection:

```text
node node_modules/prisma/build/index.js migrate diff --from-schema .commerce-baseline.prisma --to-schema prisma/schema.prisma --script --output prisma/migrations/20261010000300_commerce_foundation/migration.sql
```

The task-created baseline schema was removed after generation. Checks/triggers
were then added to this NEW migration. Historical SQL was left intact. No
migrate dev/deploy/reset, seed, database cleanup or unknown connection ran.

## Verification actually performed

```text
node node_modules/vitest/vitest.mjs run tests/commerce --no-cache --no-fsModuleCache --configLoader runner
node node_modules/vitest/vitest.mjs run tests/commerce tests/mock tests/competition tests/content tests/student/admin-routes.test.ts tests/auth/request-security.test.ts tests/auth/signup-route.test.ts tests/auth/hardening-routes.test.ts --no-cache --no-fsModuleCache --configLoader runner
node node_modules/typescript/bin/tsc --noEmit
node node_modules/prisma/build/index.js validate --config prisma7.config.ts
node node_modules/prisma/build/index.js generate --config prisma7.config.ts
npm.cmd run build
git diff --check
git status --short --untracked-files=all
```

PASS: 124 commerce tests in 3 files; 416 focused tests in 15 files. TypeScript,
Prisma validation/generation, production build and diff check passed. No full
suite rerun, lint/dependency installation or authenticated browser acceptance.
Commerce signature fixtures use toy test secrets, not provider-issued signatures
or actual payment confirmations. Persistence and serialized-concurrency fixtures
are MOCKED; no real PostgreSQL constraints, trigger execution, migration replay,
multi-process races, provider refund idempotency or message delivery was verified.
Legacy financial behavior is absent and cannot be claimed regression-tested.

Important files: server/commerce/{validation,transaction,access,provider,service,
notifications,webhook}.ts; components/commerce/CommerceWorkspace.tsx; the new
student/admin commerce APIs and pages; api/payments/razorpay/route.ts; schema/SQL;
tests/commerce/*.test.ts. Existing content/mock services and focused fixtures,
Profile/admin navigation, CSS and MASTER_BUILD_STATUS.md were narrowly extended.

## External requirements and one next build task

No secret values were printed or configuration files edited. No provider account,
resource, paid plan, production activation, registration or network transaction
was created. For controlled staging supply an explicitly approved disposable
PostgreSQL target/migration workload, approved catalogue and commercial/refund
terms, Razorpay sandbox account/test keys/webhook secret/merchant identity,
verified webhook endpoint and capability tests. Authentication Upstash/trusted
ingress verification remains a separate unresolved prerequisite; no activation
settings changed. Email needs sender/domain registration and a verified idempotent
adapter. WhatsApp needs approved business/templates, verified recipient and
channel-specific consent. Tax invoices need verified business/tax information.

Single next recommended BUILD task: consent-bound parent/school/teacher portals
with tenant isolation and controlled staff provisioning. Controlled commerce
staging verification remains a release prerequisite, not permission to activate.

## Git preservation

Started with 48 changed/untracked paths. Only seven were intentionally extended:
schema.prisma, admin/page.tsx, ProgressDashboard.tsx, global.css, mock/service.ts,
tests/mock/service.test.ts and MASTER_BUILD_STATUS.md. All other pre-existing
work is retained. Complete final Git/preservation and preview evidence follows.

Final: main at 544b9f3a6d4ba3deb3c10b2cfa65fda8ea4eaf42; 14 modified tracked
files and 54 untracked files (68 paths), including prior modules. All 41 baseline
paths outside the seven intentional extensions match their initial SHA256 hashes.
The two additionally modified tracked files are content/service.ts and its test;
18 new commerce files include this report. No stage, commit, push, branch change,
deployment, migration application, seed, auth/payment activation, dependency
installation, destructive cleanup, provisioning or live transaction occurred.
Git's global-ignore permission warning did not prevent status/diff checks (exit 0).

Local production preview: http://127.0.0.1:3002/packages (PID 43200, loopback).
Existing previews on ports 3000/3001 were left alone. Database-free smoke verified
GET /api/live 200; /packages and /admin/commerce 307 to login; both private commerce
APIs 401; /api/auth/readiness 503; POST /api/payments/razorpay with an empty JSON
object 503 while the factory is disabled. No signature, credentials, signup/login
POST, payment-provider call, charge or DB query was used in this smoke.

Provider references:
- [Razorpay raw-body signing, event IDs and out-of-order delivery](https://razorpay.com/docs/webhooks/validate-test/).
- [Razorpay normal-refund idempotency](https://github.com/razorpay/markdown-docs/blob/master/api/refunds/normal-refunds-idempotent.md).
- [Official SDK refund API contract](https://github.com/razorpay/razorpay-node/blob/master/documents/refund.md).

Full final status:

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
?? TIMED_MOCK_EXAMS.md
?? prisma/migrations/20261010000100_timed_mock_exams/migration.sql
?? prisma/migrations/20261010000200_competitions_achievements/migration.sql
?? prisma/migrations/20261010000300_commerce_foundation/migration.sql
?? src/app/achievements/page.tsx
?? src/app/admin/commerce/page.tsx
?? src/app/admin/competitions/page.tsx
?? src/app/admin/mock-exams/page.tsx
?? src/app/api/admin/commerce/route.ts
?? src/app/api/admin/competitions/route.ts
?? src/app/api/admin/mocks/route.ts
?? src/app/api/payments/razorpay/route.ts
?? src/app/api/student/achievements/route.ts
?? src/app/api/student/commerce/route.ts
?? src/app/api/student/competitions/route.ts
?? src/app/api/student/mocks/revision/route.ts
?? src/app/api/student/mocks/route.ts
?? src/app/compete/page.tsx
?? src/app/packages/page.tsx
?? src/app/practice/mock-attempts/page.tsx
?? src/app/practice/mock-tests/page.tsx
?? src/app/practice/revision/page.tsx
?? src/app/shared/achievements/[token]/page.tsx
?? src/components/commerce/CommerceWorkspace.tsx
?? src/components/competition/AdminCompetitions.tsx
?? src/components/competition/CompetitionWorkspace.tsx
?? src/components/mock/AdminMocks.tsx
?? src/components/mock/MockFrame.tsx
?? src/components/mock/StudentMocks.tsx
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
?? tests/commerce/provider.test.ts
?? tests/commerce/routes.test.ts
?? tests/commerce/service.test.ts
?? tests/competition/routes.test.ts
?? tests/competition/rules.test.ts
?? tests/competition/service.test.ts
?? tests/mock/engine.test.ts
?? tests/mock/routes.test.ts
?? tests/mock/service.test.ts
```
