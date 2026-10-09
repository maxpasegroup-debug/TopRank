# Private staging: not approved for deployment yet

The repository has build/start configuration, not a deployed environment.
The full master programme is not complete. Do not deploy publicly or enable
production authentication based on a green build or liveness check.

## Configuration

`railway.json` uses Railpack, `npm run build`, `npm run start`, and `/api/live`.
`.node-version` selects Node 22; the local verification runtime is 22.14.0.
Record Railway's resolved patch version and repeat checks on that runtime.
Next's existing start script binds all interfaces and uses Railway's `PORT`.
No automatic migration or seed command is configured.

These settings follow [Railway config-as-code](https://docs.railway.com/config-as-code)
and [Railpack Node version resolution](https://railpack.com/languages/node/).

## Human approval and account prerequisites

1. Identify the Railway account/project and approve any service costs. No
   resources have been provisioned. Create an isolated staging environment,
   never reuse the production database, and keep automatic deployments off.
2. Provide an approved private-access mechanism for browser testers. Do not
   create an unrestricted public domain. Private networking alone is not a
   browser authentication gateway. Staging access must be independently gated
   while signup/login are disabled.
3. Identify a disposable PostgreSQL test database and explicitly authorize
   migration integration tests on it. Supply its credentials locally, not in
   chat. Review the protected-answer backfill and every new migration.
4. Supply the five Stitch exports, including revised Goal Setting and Mission
   Control. The approved designs have not been inspected.
5. Supply dedicated Upstash test configuration described in
   `AUTHENTICATION_HARDENING.md`. Run its existing gated live test only after
   verifying the test database identity. Never flush or broadly delete keys.
6. Verify the trusted ingress actually strips incoming client-IP headers and
   supplies the reserved header itself. Railway ingress behavior is unresolved.
   Do not set verification/activation flags simply to bypass the gate.

## Variables

Set `NODE_ENV=production`, a verified staging `DATABASE_URL`, an exact HTTPS
`APP_URL` for the approved private gateway, and optionally `LOG_LEVEL` and
`NEXT_TELEMETRY_DISABLED=1`. Keep all values in Railway variables/local secret
settings. Never place them in Git or build logs.

Keep `AUTH_RATE_LIMIT_ACTIVATED` and verification flags unset until the checks
in `AUTHENTICATION_HARDENING.md` are genuinely completed. That document is the
authoritative list of limiter credentials, namespace and ingress requirements.
AI/payment/TeachX/email/WhatsApp credentials do not enable an implementation:
their concrete transports are not implemented or verified.

## Migration strategy (instructions only; not executed)

Back up the verified target and test restore first. On the disposable test
database, generate the client, validate schema, and use the project's existing
`npm run prisma:deploy` after checking its config selection. This repository
uses `prisma7.config.ts`; when necessary use the explicit command:

```powershell
node node_modules/prisma/build/index.js migrate deploy --config prisma7.config.ts
```

Inspect migration status before and after, confirm the protected numerical
backfill behavior, and exercise constraints/transactions with real PostgreSQL.
Then separately approve the same migration sequence for staging. No migrations
were applied here, and no database content was inspected.

The journey migration contains partial unique indexes for one active plan and
one active study session per user. Preserve them when reviewing future diffs;
Prisma's schema does not represent those partial indexes.

## Health, backups and recovery

`/api/live` verifies process liveness only; `/api/health` reads the database;
`/api/auth/readiness` verifies authentication readiness and must remain 503
until configured. Liveness success does not make authentication ready.
Do not call database health on an unidentified target.

Snapshot before each migration; confirm backup retention/access and restore
in an isolated environment. Roll back application artifacts only when compatible
with the forward schema. Do not reset/drop data or edit applied migrations to
recover. Disable affected workflows during provider/database outages; never
replace fail-closed authentication with a local production limiter.

## Post-hosting acceptance

- Real signup/login/logout/session expiry with the verified distributed limiter.
- Two-instance rate limiting, Lua concurrency/TTL, timeout and recovery.
- Cross-role, cross-student, parent-consent and school-tenant isolation.
- Migration application/replay and protected-answer backfill cases.
- Saved onboarding, reviewed preview consistency, duplicate confirmations.
- Concurrent task completion/rescheduling and study-session reconnect behavior.
- Bookmark/completion persistence and safe resource rendering.
- Answer confidentiality, negative marking, idempotency and history snapshots.
- Mock deadline/reconnect tests once that implementation exists.
- Payment sandbox/webhook replay tests once the provider is implemented.
- Browser mobile/desktop screenshots, keyboard access, overflow and accessibility.
- Performance, sanitized logs, provider failures and backup restoration.
