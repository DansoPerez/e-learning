/**
 * Enable RLS on all public tables (fixes Supabase database linter errors).
 * Usage: npm run db:rls
 */
import fs from "node:fs";
import path from "node:path";
import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  const sqlPath = path.join(process.cwd(), "supabase", "enable-rls.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");

  const enableRlsBlock = sql.match(/DO \$\$[\s\S]*?\$\$;/);
  if (!enableRlsBlock) {
    throw new Error("Could not parse RLS block from supabase/enable-rls.sql");
  }

  const revokeStatements = [
    "REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated",
    "REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated",
    "REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon, authenticated",
    `ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
      REVOKE ALL ON TABLES FROM anon, authenticated`,
    `ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
      REVOKE ALL ON SEQUENCES FROM anon, authenticated`,
  ];

  console.log("Applying Supabase RLS lockdown …");

  try {
    await prisma.$connect();

    await prisma.$executeRawUnsafe(enableRlsBlock[0]);
    console.log("✓ Enabled RLS on public tables");

    for (const statement of revokeStatements) {
      try {
        await prisma.$executeRawUnsafe(statement);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (message.includes('role "anon" does not exist')) {
          console.warn("⚠ Skipping revoke (not a Supabase database — anon role missing)");
          break;
        }
        throw error;
      }
    }
    console.log("✓ Revoked anon/authenticated grants on public schema");

    const tables = await prisma.$queryRaw<
      { tablename: string; rowsecurity: boolean }[]
    >`
      SELECT tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename NOT IN ('_prisma_migrations')
      ORDER BY tablename
    `;

    const withoutRls = tables.filter((t) => !t.rowsecurity);
    if (withoutRls.length > 0) {
      console.error(
        "❌ Some tables still lack RLS:",
        withoutRls.map((t) => t.tablename).join(", "),
      );
      process.exit(1);
    }

    console.log(`✓ Verified RLS on ${tables.length} public table(s)`);
    console.log("Re-run the Supabase database linter — rls_disabled_in_public should clear.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("❌ Failed to apply RLS:", error instanceof Error ? error.message : error);
  process.exit(1);
});
