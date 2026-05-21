# Deploy Bravio to Vercel (step by step)

You deploy from GitHub. Vercel builds the app; Supabase holds the database.

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

## Part B — Supabase database (10 min)

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **Start your project** → sign in.
2. **New project** → pick a name (e.g. `bravio`), set a **database password** (save it).
3. Wait until the project is ready.

### 3. Copy the database URL (use the pooler)

1. In Supabase: **Project Settings** (gear) → **Database**.
2. Under **Connection string**, choose **URI**.
3. Select **Transaction pooler** (important for Vercel).
4. Copy the URL. It looks like:
   `postgresql://postgres.[ref]:[PASSWORD]@aws-0-...pooler.supabase.com:6543/postgres`
5. Replace `[YOUR-PASSWORD]` with your database password.

Save this as your **production `DATABASE_URL`**.

### 4. Create tables in production (run once on your PC)

**Important:** `prisma db push` must **not** use the **Transaction** pooler (port 6543) — it often hangs or fails. Use one of these for `db push` only:

| Use for | Connection in Supabase UI |
|---------|---------------------------|
| `db push` + `db:seed` | **Session pooler** (port **5432**) or **Direct connection** |
| Vercel `DATABASE_URL` | **Transaction pooler** (port **6543**) |

In a terminal, from the project folder:

```bash
cd "c:/Users/danso/Documents/personal projects/e_learning"

# Session pooler OR direct URL (NOT :6543 transaction pooler):
export DATABASE_URL="postgresql://postgres.[ref]:[PASSWORD]@aws-0-....pooler.supabase.com:5432/postgres"

npx prisma db push
npm run db:seed
npm run db:check
```

Encode `@` in passwords as `%40`. Put the **transaction pooler (:6543)** URL in Vercel only.

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
2. **Add New…** → **Project**.
3. **Import** your `bravio` (or e_learning) repository.
4. Framework: **Next.js** (auto-detected).  
   Build command: `npm run build` (default).  
   Install command: `npm install` (default).

Do **not** deploy yet — add environment variables first.

### 6. Environment variables

In **Environment Variables**, add these for **Production** (and Preview if you want):

| Name | Value |
|------|--------|
| `DATABASE_URL` | Your Supabase **transaction pooler** URL |
| `AUTH_SECRET` | Run locally: `openssl rand -base64 32` and paste the output |
| `NEXTAUTH_URL` | Leave empty for first deploy; set after step 8 |
| `PAYSTACK_SECRET_KEY` | From [Paystack Dashboard](https://dashboard.paystack.com) → Settings → API Keys (test key is fine to start) |
| `PAYSTACK_CURRENCY` | `GHS` |

Optional (Google login):

| Name | Value |
|------|--------|
| `GOOGLE_CLIENT_ID` | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console |

### 7. Vercel Blob (instructor selfie uploads)

1. In your Vercel project → **Storage** tab → **Create Database** → **Blob**.
2. Name it (e.g. `bravio-blob`) → **Create**.
3. **Connect to Project** → select this Next.js project.

Vercel adds `BLOB_READ_WRITE_TOKEN` automatically. No manual copy needed.

### 8. Deploy

Click **Deploy**. Wait for the build to finish (green **Visit**).

### 9. Fix `NEXTAUTH_URL` after first deploy

1. Copy your live URL, e.g. `https://bravio-xxx.vercel.app`.
2. Vercel → **Settings** → **Environment Variables**.
3. Set `NEXTAUTH_URL` = `https://bravio-xxx.vercel.app` (no trailing slash).
4. **Deployments** → latest deployment → **⋯** → **Redeploy**.

Login and sessions will work correctly after this redeploy.

---

## Part D — Paystack webhook (if you use paid courses)

1. [Paystack Dashboard](https://dashboard.paystack.com) → **Settings** → **Webhooks**.
2. URL: `https://YOUR-VERCEL-URL.vercel.app/api/paystack/webhook`
3. Save.

---

## Part E — Google OAuth (optional)

1. [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials.
2. Edit your OAuth client → **Authorized redirect URIs** add:
   `https://YOUR-VERCEL-URL.vercel.app/api/auth/callback/google`
3. Save.

---

## Checklist before you share the site

- [ ] `DATABASE_URL` uses Supabase **pooler** (port 6543), not direct `5432`
- [ ] `npx prisma db push` + `db:seed` ran against production DB
- [ ] `NEXTAUTH_URL` matches your real Vercel URL
- [ ] Vercel Blob connected (for instructor registration selfies)
- [ ] Paystack webhook points to production URL (if using payments)

---

## If something fails

| Problem | Fix |
|---------|-----|
| Build fails on Vercel | Open deployment → **Building** logs; often missing env var |
| `DATABASE_URL is not set` | Add `DATABASE_URL` in Vercel env, redeploy |
| Login redirects broken | Set `NEXTAUTH_URL` to exact Vercel URL, redeploy |
| Instructor selfie fails | Connect Vercel Blob storage to the project |
| Paystack payments not completing | Check webhook URL and `PAYSTACK_SECRET_KEY` |

---

## Custom domain (later)

Vercel → **Settings** → **Domains** → add your domain, then update `NEXTAUTH_URL` and Paystack/Google URLs to match.
