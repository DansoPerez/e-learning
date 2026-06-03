/**
 * Validates DATABASE_URL for Supabase PostgreSQL + Prisma before the client connects.
 */
export function getDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL;
  if (!raw?.trim()) {
    throw new Error(
      "DATABASE_URL is not set. Add your Supabase PostgreSQL connection string in .env or Vercel → Settings → Environment Variables.",
    );
  }

  const url = raw.trim().replace(/^["']|["']$/g, "");

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

  return url;
}

/** @deprecated Use getDatabaseUrl */
export const getMongoDatabaseUrl = getDatabaseUrl;
