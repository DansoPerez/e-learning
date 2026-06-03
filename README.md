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
- `PAYSTACK_SECRET_KEY` — From Paystack dashboard (test key for dev)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Optional, for Google login

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

## Paystack webhook

For local testing, use [ngrok](https://ngrok.com/) and set your Paystack webhook URL to:

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
