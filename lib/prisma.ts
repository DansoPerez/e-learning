import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/app/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const isLocalDev =
    connectionString.includes("localhost") ||
    connectionString.includes("127.0.0.1");

  const pool = new Pool({
    connectionString,
    // Fewer connections locally — avoids exhausting Prisma Dev / small pools
    max: process.env.VERCEL ? 1 : isLocalDev ? 5 : 10,
    idleTimeoutMillis: isLocalDev ? 60_000 : 20_000,
    connectionTimeoutMillis: 10_000,
    keepAlive: true,
    ssl:
      connectionString.includes("supabase.com") ?
        { rejectUnauthorized: false }
      : undefined,
  });

  pool.on("error", (err) => {
    console.error(
      "[prisma] Database pool error — if using local dev, run: npx prisma dev",
      err.message,
    );
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
