/**
 * Verify DATABASE_URL reaches MongoDB and core collections exist.
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

  if (!url.startsWith("mongodb")) {
    console.error("❌ DATABASE_URL must be a MongoDB connection string (mongodb:// or mongodb+srv://).");
    process.exit(1);
  }

  const hasDatabaseName = /mongodb(\+srv)?:\/\/[^/]+\/[^/?]+/.test(url);
  if (!hasDatabaseName) {
    console.error(
      "❌ DATABASE_URL is missing the database name. Use:\n" +
        "   mongodb+srv://USER:PASSWORD@cluster.mongodb.net/bravio?retryWrites=true&w=majority\n" +
        "   (insert /bravio — or your DB name — before the ?)",
    );
    process.exit(1);
  }

  const host = url.match(/@([^/?]+)/)?.[1] ?? url.replace(/^mongodb(\+srv)?:\/\//, "").split("/")[0];
  console.log(`Checking MongoDB at ${host} ...`);

  try {
    await prisma.$connect();
    console.log("✓ Connected");

    const courseCount = await prisma.course.count();
    console.log(`✓ Course collection ready (${courseCount} documents)`);
    console.log("Database is ready for Bravio.");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("❌ Database check failed:", msg);
    if (msg.includes("DNS") || msg.includes("10051") || msg.includes("unreachable network")) {
      console.error(
        "   Tip: `mongodb+srv://` SRV lookup may be blocked on your network.\n" +
          "   In Atlas → Connect → Drivers, copy the **Standard connection string** (mongodb://…)\n" +
          "   with /bravio before ? and use that as DATABASE_URL instead.",
      );
    } else {
      console.error("   Tip: run `npx prisma db push` then `npm run db:seed` after setting DATABASE_URL.");
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
