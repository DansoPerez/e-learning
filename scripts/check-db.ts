/**
 * Verify DATABASE_URL reaches Supabase PostgreSQL and core tables exist.
 * Usage: npm run db:check
 */
import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("❌ DATABASE_URL is not set.");
    process.exit(1);
  }

  if (!url.startsWith("postgres")) {
    console.error(
      "❌ DATABASE_URL must be a PostgreSQL connection string (postgresql:// or postgres://).\n" +
        "   Get it from Supabase → Project Settings → Database → Connection string (URI).",
    );
    process.exit(1);
  }

  const host = url.match(/@([^/?]+)/)?.[1] ?? "postgres";
  console.log(`Checking PostgreSQL at ${host} ...`);

  try {
    await prisma.$connect();
    console.log("✓ Connected");

    const courseCount = await prisma.course.count();
    console.log(`✓ Schema ready (${courseCount} courses)`);
    if (courseCount === 0) {
      console.log("   Tip: run `npm run db:seed` to load demo data.");
    } else {
      console.log("Database is ready for Bravio.");
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("❌ Database check failed:", msg);
    console.error(
      "   Tip: run `npm run db:push` (or `npm run db:migrate`) then `npm run db:seed` after setting DATABASE_URL.",
    );
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
