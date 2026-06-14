/**
 * Validates DATABASE_URL for Supabase PostgreSQL + Prisma before the client connects.
 *
 * Any Supabase pooler host (PgBouncer) breaks Prisma's prepared statements:
 *   - "prepared statement sN does not exist"  (transaction mode dropped it)
 *   - "prepared statement sN already exists"  (connection reused with it cached)
 * Both are fixed by forcing `pgbouncer=true` (statement_cache_size=0) on pooler URLs.
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

  // Local dev: never serialize all queries through one pool connection.
  if (process.env.NODE_ENV !== "production" && process.env.VERCEL !== "1") {
    url = url.replace(/([?&])connection_limit=1(&|$)/, (_, sep, tail) =>
      tail === "&" ? sep : "",
    );
  }

  return url;
}

/**
 * Disable prepared statements on any Supabase pooler URL (session 5432 or transaction 6543).
 * Direct connections (db.<ref>.supabase.co) are left untouched.
 */
function applySupabasePoolerParams(url: string): string {
  const isPooler = url.includes("pooler.supabase.com");
  if (!isPooler) return url;

  const params: string[] = [];

  if (!/[?&]pgbouncer=true(?:&|$)/.test(url)) {
    params.push("pgbouncer=true");
  }
  if (!/[?&]connection_limit=/.test(url)) {
    // One connection per serverless instance in production; allow pooling locally.
    if (process.env.VERCEL === "1") {
      params.push("connection_limit=1");
    }
  }

  if (params.length === 0) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}${params.join("&")}`;
}

/** @deprecated Use getDatabaseUrl */
export const getMongoDatabaseUrl = getDatabaseUrl;
