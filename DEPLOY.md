# Deploy Bravio to Vercel (step by step)

You deploy from GitHub. **Supabase (PostgreSQL)** holds the database.

**Time:** about 20–30 minutes the first time.

---

## Part A — GitHub (5 min)

### 1. Push your code to GitHub

If the project is not on GitHub yet:

```bash
cd "c:/Users/danso/Documents/personal projects/e_learning"
git init
git add .
git commit -m "Prepare for Vercel deployment"
```

Create a new repo on [github.com/new](https://github.com/new) (name e.g. `bravio`), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/bravio.git
git branch -M main
git push -u origin main
```

If it is already on GitHub, just commit and push your latest changes.

---

## Part B — Supabase (10 min)

### 2. Create a Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
2. Choose organization, name (e.g. `bravio`), database password (save it), region close to Vercel.
3. Wait until the project is **Active**.

### 3. Copy the connection string

1. **Project Settings** → **Database** → **Connection string**.
2. Choose **URI** tab.
3. For **local dev / migrations**, use **Direct connection** (port `5432`):

```text
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres
```

Or from the dashboard: **Connect** → **ORMs** → **Prisma** — copy the URL.

4. For **Vercel serverless**, prefer **Transaction pooler** (port `6543`) with `?pgbouncer=true`:

```text
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

Replace `[YOUR-PASSWORD]` (URL-encode special characters: `@` → `%40`).

### 4. Apply schema and seed (run once on your PC)

```bash
cd "c:/Users/danso/Documents/personal projects/e_learning"

# Paste your Supabase URI in .env as DATABASE_URL
npm run db:push
# or: npm run db:migrate   (creates migration history)

npm run db:seed
npm run db:check
```

After seed, you can log in with:

| Role       | Email                 | Password        |
|------------|-----------------------|-----------------|
| Admin      | admin@bravio.app      | Admin123!       |
| Instructor | instructor@bravio.app | Instructor123!  |
| Student    | student@bravio.app    | Student123!     |

---

## Part C — Vercel (10 min)

### 5. Import the project

1. Go to [vercel.com](https://vercel.com) → sign in with **GitHub**.
2. **Add New…** → **Project** → **Import** your repository.
3. Framework: **Next.js** (auto-detected).

### 6. Environment variables

In Vercel → **Settings** → **Environment Variables**, add:

| Name | Value |
|------|--------|
| `DATABASE_URL` | Supabase **Transaction pooler** URI (`postgresql://…:6543/…?pgbouncer=true`) |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Set after first deploy (see step 8) |
| `PAYSTACK_SECRET_KEY` | From Paystack dashboard |
| `PAYSTACK_CURRENCY` | `GHS` |
| `BREVO_API_KEY` | Optional — registration OTP |
| `BREVO_FROM_EMAIL` | Verified Brevo sender |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional OAuth |

**Important:** Use a `postgresql://` URL, not MongoDB. Copy without extra quotes in the Vercel UI.

### 7. Deploy

Click **Deploy**. Wait for the build to finish.

### 8. Fix `NEXTAUTH_URL` after first deploy

1. Copy your live URL, e.g. `https://bravio-edu.vercel.app`.
2. Set `NEXTAUTH_URL` and `AUTH_URL` to that URL (no trailing slash).
3. **Redeploy** Production.

Also update:

| Service | URL |
|---------|-----|
| Paystack webhook | `https://YOUR-URL/api/paystack/webhook` |
| Google OAuth redirect | `https://YOUR-URL/api/auth/callback/google` |

---

## Checklist

- [ ] Supabase project created
- [ ] `npm run db:push` + `npm run db:seed` against Supabase
- [ ] `DATABASE_URL` set on Vercel (pooler URI for production)
- [ ] `AUTH_SECRET` set on Vercel
- [ ] `NEXTAUTH_URL` matches your real Vercel URL, redeployed

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `DATABASE_URL` errors on build | Use `postgresql://` Supabase URI; check password encoding |
| Auth / login broken | Set `NEXTAUTH_URL` to exact production URL, redeploy |
| `Can't reach database` | Use pooler URL on Vercel; direct URL for local `db:push` |
| `P2025` / no record on sign-in | Run `db:seed` on Supabase, sign out, sign in again |
| `prepared statement` errors on Vercel | Add `?pgbouncer=true` and use port `6543` pooler |
| Migrating from MongoDB | Re-seed — data is not auto-migrated |

---

## Rename Vercel project / domain

1. **Settings** → **General** → change project name.
2. **Settings** → **Domains** → add custom domain.
3. Update `NEXTAUTH_URL`, Paystack, and Google URLs to match.
