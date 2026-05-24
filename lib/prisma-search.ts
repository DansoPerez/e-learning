/**
 * Substring filter for MongoDB (Prisma `mode: "insensitive"` is PostgreSQL-only).
 * Searches are case-sensitive; use lowercase queries for best results.
 */
export function containsFilter(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return { contains: trimmed };
}
