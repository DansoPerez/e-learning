/**
 * Validates DATABASE_URL for Supabase PostgreSQL + Prisma before the client connects.
 *
 * Supabase transaction pooler (port 6543) requires `pgbouncer=true` so Prisma skips
 * prepared statements. Do NOT add that flag on session pooler (5432) — it causes
 * "prepared statement sN already exists".
 */
export function getDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL;
  if (!raw?.trim()) {
    throw new Error(
      "DATABASE_URL is not set. Add your Supabase PostgreSQL connection string in .env or Vercel → Settings → Environment Variables.",
    );
  }

  let url = raw.trim().replace(/^["']|["']$/g, "");

  if (url.startsWith("mongodb://") || url.startsWith("mongodb+srv://")) {
    throw new Error(
      "DATABASE_URL still points to MongoDB. This project uses Supabase PostgreSQL — use a postgresql:// connection string from Supabase → Project Settings → Database.",
    );
  }

  if (!url.startsWith("postgresql://") && !url.startsWith("postgres://")) {
    throw new Error(
      "DATABASE_URL must start with postgresql:// or postgres://. Copy the URI from Supabase (Database → Connection string).",
    );
  }

  url = applySupabasePoolerParams(url);
  return url;
}

/**
 * Transaction pooler (6543) only — required for Vercel/serverless.
 * Session pooler (5432) is for local dev / migrations; leave it without pgbouncer=true.
 */
function applySupabasePoolerParams(url: string): string {
  const isTransactionPooler = /:6543(\/|\?|$)/.test(url);
  if (!isTransactionPooler) return url;

  const params: string[] = [];

  if (!/[?&]pgbouncer=true(?:&|$)/.test(url)) {
    params.push("pgbouncer=true");
  }
  if (!/[?&]statement_cache_size=/.test(url)) {
    params.push("statement_cache_size=0");
  }
  if (process.env.VERCEL && !/[?&]connection_limit=/.test(url)) {
    params.push("connection_limit=1");
  }

  if (params.length === 0) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}${params.join("&")}`;
}

/** @deprecated Use getDatabaseUrl */
export const getMongoDatabaseUrl = getDatabaseUrl;
