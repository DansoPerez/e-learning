/**
 * Validates DATABASE_URL for Supabase PostgreSQL + Prisma before the client connects.
 *
 * Any Supabase pooler host (PgBouncer) breaks Prisma's prepared statements:
 *   - "prepared statement sN does not exist"  (transaction mode dropped it)
 *   - "prepared statement sN already exists"  (connection reused with it cached)
 * Both are fixed by forcing `pgbouncer=true` (statement_cache_size=0) on pooler URLs.
 *
 * Session pooler URLs (port 5432) are rewritten to transaction pooler (6543) automatically.
 * Optional DIRECT_DATABASE_URL: only used when explicitly set (Supabase direct host).
 * Do not auto-derive direct URLs — many networks cannot reach db.*.supabase.co.
 */
export function getDatabaseUrl(): string {
  const explicitDirect = process.env.DIRECT_DATABASE_URL?.trim();
  const isLocalDev = process.env.NODE_ENV !== "production" && process.env.VERCEL !== "1";

  let raw = process.env.DATABASE_URL;
  if (!raw?.trim()) {
    throw new Error(
      "DATABASE_URL is not set. Add your Supabase PostgreSQL connection string in .env or Vercel → Settings → Environment Variables.",
    );
  }

  if (isLocalDev && explicitDirect) {
    raw = explicitDirect;
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
 * Build direct Supabase URI from pooler URI (for manual DIRECT_DATABASE_URL setup only).
 * postgres.<ref>:pass@*.pooler.supabase.com → postgres:pass@db.<ref>.supabase.co
 */
export function deriveDirectUrlFromPooler(poolerUrl: string): string | null {
  const cleaned = poolerUrl.trim().replace(/^["']|["']$/g, "");
  const match = cleaned.match(
    /^postgres(?:ql)?:\/\/postgres\.([a-z0-9]+):([^@]+)@[^/]+\/([^?]*)/i,
  );
  if (!match) return null;

  const [, projectRef, password, database] = match;
  return `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/${database || "postgres"}`;
}

/** True when DATABASE_URL still points at the session pooler in local dev. */
export function isDevSessionPoolerUrl(databaseUrl: string): boolean {
  const url = databaseUrl.trim();
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.VERCEL !== "1" &&
    !process.env.DIRECT_DATABASE_URL?.trim() &&
    url.includes("pooler.supabase.com") &&
    /:5432(\/|\?|$)/.test(url)
  );
}

/**
 * Pooler URLs: use transaction mode (6543) + pgbouncer for Prisma.
 * Direct db.<ref>.supabase.co URLs are left untouched.
 */
function applySupabasePoolerParams(url: string): string {
  const isDirect = /\/\/postgres(?:\.|:)[^@]+@db\.[a-z0-9]+\.supabase\.co/i.test(url);
  if (isDirect) return url;

  const isPooler = url.includes("pooler.supabase.com");
  if (!isPooler) return url;

  // Session pooler (5432) holds connections — Prisma needs transaction pooler (6543).
  url = url.replace(
    /(pooler\.supabase\.com):5432(\/|$|\?)/,
    "$1:6543$2",
  );

  const params: string[] = [];

  if (!/[?&]pgbouncer=true(?:&|$)/.test(url)) {
    params.push("pgbouncer=true");
  }
  if (!/[?&]connection_limit=/.test(url)) {
    params.push("connection_limit=1");
  }
  if (!/[?&]pool_timeout=/.test(url)) {
    params.push("pool_timeout=20");
  }
  if (!/[?&]connect_timeout=/.test(url)) {
    params.push("connect_timeout=10");
  }

  if (params.length === 0) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}${params.join("&")}`;
}

/** @deprecated Use getDatabaseUrl */
export const getMongoDatabaseUrl = getDatabaseUrl;
