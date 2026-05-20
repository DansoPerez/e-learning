/**
 * Verify DATABASE_URL reaches Postgres and the Course table exists.
 * Usage: DATABASE_URL="postgresql://..." npm run db:check
 */
import "dotenv/config";
import { Pool } from "pg";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("❌ DATABASE_URL is not set.");
    process.exit(1);
  }

  const host = url.match(/@([^/?]+)/)?.[1] ?? "unknown";
  console.log(`Checking database at ${host} ...`);

  const pool = new Pool({
    connectionString: url,
    ssl:
      url.includes("supabase.com") ?
        { rejectUnauthorized: false }
      : undefined,
  });

  try {
    await pool.query("SELECT 1");
    console.log("✓ Connected");

    const { rows } = await pool.query<{ exists: string | null }>(
      `SELECT to_regclass('public."Course"') AS exists`,
    );
    const table = rows[0]?.exists;

    if (!table) {
      console.error('❌ Table "Course" is missing. Run: npx prisma db push');
      process.exit(1);
    }

    const count = await pool.query<{ n: string }>(
      `SELECT COUNT(*)::text AS n FROM "Course"`,
    );
    console.log(`✓ Course table exists (${count.rows[0].n} rows)`);
    console.log("Database is ready for Bravio.");
  } catch (e) {
    console.error("❌ Database check failed:", e instanceof Error ? e.message : e);
    if (String(e).includes("password authentication failed")) {
      console.error("   Tip: encode @ in passwords as %40 in the connection URL.");
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
