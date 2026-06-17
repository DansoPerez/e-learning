# Bravio

A secure e-learning marketplace built with Next.js, connecting students, instructors, and administrators through structured courses, assessments, and monetization.

## Features

- **Authentication** — Email/password and Google OAuth (Auth.js)
- **Roles** — Student, Instructor, Super Admin
- **Courses** — Modules, lessons, video/text content, approval workflow
- **Enrollment** — Free and paid (Paystack) courses
- **Instructor system** — Application, admin approval, earnings (60/40 split)
- **Quizzes** — MCQ, true/false, auto-grading, attempt history
- **Admin control** — Users, courses, instructors, withdrawals, commission, audit logs
- **Announcements** — Platform-wide (admin)

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Backend | Next.js Server Actions & API Routes |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma 6 |
| Auth | Auth.js (next-auth v5) |
| Payments | Paystack |
| Hosting | Vercel |

## Deploy to Vercel

See **[DEPLOY.md](./DEPLOY.md)** for a full step-by-step guide (Supabase + Vercel + Blob storage).

## Getting started

### 1. Clone and install

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` and fill in:

- `DATABASE_URL` — Supabase PostgreSQL connection string
- `AUTH_SECRET` — Run `openssl rand -base64 32`
- `NEXTAUTH_URL` — `http://localhost:3000` for local dev
- `PAYSTACK_SECRET_KEY` — Paystack test/live secret key (paid checkout enables automatically)
- `RESEND_API_KEY` / `RESEND_FROM_EMAIL` — Resend for OTP registration and password reset
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Optional, for Google login

Verify Paystack after adding your key:

```bash
npm run paystack:check
```

Verify Resend after adding your key:

```bash
npm run resend:check
```

### 3. Database

```bash
npm run db:push    # or: npm run db:migrate
npm run db:seed
```

### 4. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo accounts (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@bravio.app | Admin123! |
| Instructor | instructor@bravio.app | Instructor123! |
| Student | student@bravio.app | Student123! |

## Paystack (paid courses)

1. Add `PAYSTACK_SECRET_KEY` to `.env` (test key from [Paystack dashboard](https://dashboard.paystack.com/#/settings/developer)).
2. Run `npm run paystack:check` to confirm the key and callback URL.
3. Set a course price above **0** (instructor or admin).
4. Enroll as a student — you are redirected to Paystack checkout, then back to the course.

**Webhook** (recommended for production): register in Paystack → Settings → Webhooks:

```
https://your-domain.com/api/paystack/webhook
```

For local testing, use [ngrok](https://ngrok.com/) and point the webhook at:

```
https://your-ngrok-url/api/paystack/webhook
```

## Project structure

```
app/
  actions/          # Server actions
  api/              # API routes (auth, paystack webhook)
  courses/          # Public course catalog
  dashboard/        # Role-based dashboards
  learn/            # Learning player & quizzes
components/         # UI components
lib/                # Prisma, auth, services, validations
prisma/             # Schema & seed
```

## Deployment (Vercel + Supabase)

1. Create a Supabase project and copy the connection string to `DATABASE_URL`
2. Deploy to Vercel and add all env vars from `.env.example`
3. Run migrations against production: `npx prisma migrate deploy`
4. Seed production once: `npm run db:seed`
5. Configure Paystack live keys and webhook URL

## Roadmap status

| Phase | Status |
|-------|--------|
| Phase 1 — Core MVP (auth, courses, learning, enrollment) | Implemented |
| Phase 2 — Marketplace (payments, instructor approval, admin) | Implemented |
| Phase 3 — Quizzes, analytics, audit logs | Implemented |
| Phase 4 — AI features | Not implemented (optional) |
