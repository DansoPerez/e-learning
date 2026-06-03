import type { Prisma } from "@/app/generated/prisma/client";

/** Case-insensitive substring filter (PostgreSQL). */
export function containsFilter(value: string): Prisma.StringFilter | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return { contains: trimmed, mode: "insensitive" };
}
