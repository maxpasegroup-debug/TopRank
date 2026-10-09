# TopRank AI Production Architecture

## Architecture Diagram

```text
Browser
  |
  | HTTPS
  v
Next.js App Router
  |-- Public routes: landing, login, signup, demo
  |-- Protected routes: student app, parent preview, school preview
  |-- Route handlers: /api/auth/*, /api/health
  |
  v
Server foundation
  |-- Auth/session helpers
  |-- Role authorization helpers
  |-- API response/error helpers
  |-- Logger and request IDs
  |
  v
Prisma ORM
  |
  v
PostgreSQL
```

## Application Layers

- `src/screens` and `src/components` preserve the Level 1 UI.
- `src/app/[[...path]]/page.tsx` maps existing routes into Next.js server routing.
- `src/app/api` contains route handlers for backend APIs.
- `src/server` contains production-only server foundations.
- `prisma/schema.prisma` defines the initial PostgreSQL data model.

## Authentication Flow

1. Signup and login submit to `/api/auth/signup` and `/api/auth/login`.
2. Passwords are hashed with bcrypt.
3. Successful authentication creates a database-backed session.
4. The session token is stored in an HTTP-only cookie named `toprank_session`.
5. Protected server routes call `requireAuth()` before rendering.
6. Logout revokes the session and clears the cookie.

Google, WhatsApp OTP, and other providers are intentionally left as future extensions.

## Authorization Model

Roles:

- `STUDENT`
- `PARENT`
- `TEACHER`
- `SCHOOL_ADMIN`
- `PLATFORM_ADMIN`

Central helpers live in `src/server/auth/session.ts` and `src/server/auth/roles.ts`.
Production routes should use helpers such as `requireAuth()` and `requireRole()` rather than scattering role checks through UI components.

## Database Overview

Initial foundation models:

- `User`
- `Session`
- `StudentProfile`
- `ParentProfile`
- `TeacherProfile`
- `StudentParentRelationship`
- `School`
- `SchoolMembership`
- `Exam`
- `Subject`
- `ExamSubject`
- `Chapter`
- `Lesson`

Detailed question attempts, payments, AI conversations, notifications, and analytics are intentionally deferred.

## API Structure

Current endpoints:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/health`

API responses use:

```json
{ "ok": true, "data": {}, "requestId": "..." }
```

or:

```json
{ "ok": false, "error": { "code": "...", "message": "..." }, "requestId": "..." }
```

Validation uses Zod. Server errors are logged without exposing stack traces to clients.

## Environment Structure

Use `.env.example` as the template. Required now:

- `DATABASE_URL`
- `APP_URL`
- `AUTH_SECRET`
- `NODE_ENV`

Reserved for future phases:

- AI provider key
- payment provider keys
- email provider key
- WhatsApp token
- storage bucket
- Redis URL
- monitoring DSN

Never commit `.env` or real secrets.

## Deployment Approach

Railway services:

- Web service running the Next.js app
- PostgreSQL service

Build command:

```bash
npm run build
```

Start command:

```bash
npm run start
```

Migration command:

```bash
npm run prisma:deploy
```

Production migration procedure:

1. Set production environment variables.
2. Run `npm run prisma:deploy`.
3. Run `npm run build`.
4. Start the app with `npm run start`.
5. Verify `/api/health`.

## Future Extension Points

- Exam engine: add question, option, attempt, answer, and scoring models.
- Tara AI: add conversation/message models and provider adapters.
- Payments: add subscription, payment, invoice, and webhook processing.
- Notifications: add email/WhatsApp/push infrastructure and jobs.
- School ecosystem: expand memberships into classes, enrollments, attendance, and notices.
- Background jobs: add Redis/queue workers when asynchronous workloads appear.
