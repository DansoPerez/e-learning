import { PrismaClient } from "@/app/generated/prisma/client";
import { getDatabaseUrl, isDevSessionPoolerUrl } from "@/lib/database-url";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient() {
  const url = getDatabaseUrl();

  if (isDevSessionPoolerUrl(process.env.DATABASE_URL ?? "")) {
    console.warn(
      "[prisma] Local dev is using the Supabase session pooler. " +
        "Using auto-derived direct connection (db.*.supabase.co). " +
        "Set DIRECT_DATABASE_URL to override.",
    );
  }

  return new PrismaClient({
    datasources: { db: { url } },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Reuse one client per runtime (critical in dev — Turbopack HMR otherwise opens new pools).
globalForPrisma.prisma = prisma;
