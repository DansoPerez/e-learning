/**
 * Validates DATABASE_URL for MongoDB + Prisma before the client connects.
 * Throws a clear message for Vercel misconfiguration (common cause of ERR_INVALID_URL).
 */
export function getMongoDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL;
  if (!raw?.trim()) {
    throw new Error(
      "DATABASE_URL is not set. Add your MongoDB connection string in Vercel → Settings → Environment Variables, then redeploy.",
    );
  }

  const url = raw.trim().replace(/^["']|["']$/g, "");

  if (url.startsWith("postgresql://") || url.startsWith("postgres://")) {
    throw new Error(
      "DATABASE_URL still points to PostgreSQL. This project uses MongoDB — paste your Atlas mongodb:// or mongodb+srv:// URL and redeploy.",
    );
  }

  if (!url.startsWith("mongodb://") && !url.startsWith("mongodb+srv://")) {
    throw new Error(
      "DATABASE_URL must start with mongodb:// or mongodb+srv://. Check Vercel environment variables (no extra quotes).",
    );
  }

  const hasDatabaseName = /mongodb(\+srv)?:\/\/[^/]+\/[^/?]+/.test(url);
  if (!hasDatabaseName) {
    throw new Error(
      "DATABASE_URL is missing the database name. Use ...mongodb.net/bravio?... (insert /bravio before ?).",
    );
  }

  return url;
}
