# Deploy Bravio to Vercel (step by step)

You deploy from GitHub. **MongoDB Atlas** holds the database.

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

## Part B — MongoDB Atlas (10 min)

### 2. Create a MongoDB Atlas cluster

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) → sign up / sign in.
2. **Build a Database** → choose **M0 Free** (or a paid tier for production).
3. Pick a cloud region close to your users (and Vercel region if possible).
4. Create the cluster and wait until it is ready.

### 3. Create a database user

1. **Database Access** → **Add New Database User**.
2. Username + password (save the password).
3. Privileges: **Read and write to any database** (or restrict to `bravio`).

### 4. Allow network access

1. **Network Access** → **Add IP Address**.
2. For development: **Add Current IP Address**.
3. For Vercel: **Allow Access from Anywhere** (`0.0.0.0/0`) — required because Vercel uses dynamic IPs.

### 5. Copy the connection string

1. **Database** → **Connect** → **Drivers**.
2. Copy the `mongodb+srv://...` URI.
3. Replace `<password>` with your user password (URL-encode special characters: `@` → `%40`).
4. Set the database name in the path, e.g. `...mongodb.net/bravio?retryWrites=true&w=majority`.

Example:

```text
mongodb+srv://bravio_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/bravio?retryWrites=true&w=majority
```

### 6. Create collections (run once on your PC)

From the project folder:

```bash
cd "c:/Users/danso/Documents/personal projects/e_learning"

# Paste your Atlas URI (or local mongodb://127.0.0.1:27017/bravio)
export DATABASE_URL="mongodb+srv://..."

npx prisma db push
npm run db:seed
npm run db:check
```

MongoDB does not use SQL migrations — **`prisma db push`** syncs the schema.

> **Note:** This project uses **Prisma 6.19** for MongoDB. Prisma 7 does not yet ship the MongoDB query compiler; upgrading to Prisma 7 requires staying on PostgreSQL or waiting for MongoDB support.

After seed, you can log in with:

| Role       | Email                 | Password        |
|------------|-----------------------|-----------------|
| Admin      | admin@bravio.app      | Admin123!       |
| Instructor | instructor@bravio.app | Instructor123!  |
| Student    | student@bravio.app    | Student123!     |

### Local MongoDB (optional)

Install [MongoDB Community](https://www.mongodb.com/try/download/community) or run via Docker:

```bash
docker run -d -p 27017:27017 --name bravio-mongo mongo:7
```

Then use `DATABASE_URL="mongodb://127.0.0.1:27017/bravio"`.

---

## Part C — Vercel (10 min)

### 7. Import the project

1. Go to [vercel.com](https://vercel.com) → sign in with **GitHub**.
2. **Add New…** → **Project**.
3. **Import** your GitHub repository.
4. Framework: **Next.js** (auto-detected).  
   Build command: `npm run build` (default).

### 8. Environment variables

In Vercel → **Settings** → **Environment Variables**, add:

| Name | Value |
|------|--------|
| `DATABASE_URL` | Your Atlas **standard** `mongodb://…` URI (same as local `.env`; include `/bravio` before `?`) |

**Important:** Do not paste a PostgreSQL/Supabase URL. If logs show `clientVersion: 7.8.0` or `ERR_INVALID_URL`, redeploy after pushing the latest GitHub code and update `DATABASE_URL`.

Copy the value **without** wrapping it in extra quotes in the Vercel UI.
| `AUTH_SECRET` | `openssl rand -base64 32` (generate locally) |
| `NEXTAUTH_URL` | Set after first deploy (see step 10) |
| `PAYSTACK_SECRET_KEY` | From Paystack dashboard |
| `PAYSTACK_CURRENCY` | `GHS` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional OAuth |

### 9. Deploy

Click **Deploy**. Wait for the build to finish.

### 10. Fix `NEXTAUTH_URL` after first deploy

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

- [ ] MongoDB Atlas cluster + user + network access (`0.0.0.0/0` for Vercel)
- [ ] `npx prisma db push` + `npm run db:seed` against Atlas
- [ ] `DATABASE_URL` set on Vercel
- [ ] `AUTH_SECRET` set on Vercel
- [ ] `NEXTAUTH_URL` matches your real Vercel URL, redeployed

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `DATABASE_URL` errors on build | Use `mongodb+srv://` Atlas URI; check password encoding |
| Auth / login broken | Set `NEXTAUTH_URL` to exact production URL, redeploy |
| `db push` fails | Confirm IP allowlist includes your PC; URI has database name |
| DNS error `10051` / unreachable network | Replace `mongodb+srv://` with Atlas **Standard connection string** (`mongodb://` with shard hosts) |
| Search feels case-sensitive | MongoDB text search is case-sensitive (PostgreSQL `insensitive` mode removed) |
| Old Postgres data | Export/import manually or re-seed; schemas are not auto-migrated |

---

## Rename Vercel project / domain

1. **Settings** → **General** → change project name.
2. **Settings** → **Domains** → add `bravio-edu.vercel.app` (or custom domain).
3. Update `NEXTAUTH_URL`, Paystack, and Google URLs to match.
4. Ensure **Production** deployment is **Ready** (not `DEPLOYMENT_NOT_FOUND`).
