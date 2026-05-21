import { prisma } from "@/lib/prisma";
import type { Role } from "@/app/generated/prisma/client";

const START_NUM = 1001;

export function nameToInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "XX";
  if (parts.length === 1) {
    const w = parts[0];
    return (w[0] + (w[1] ?? w[0])).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function prefixForRole(role: Role): string {
  switch (role) {
    case "INSTRUCTOR":
      return "L";
    case "ADMIN":
      return "A";
    default:
      return "S";
  }
}

async function nextNumericPart(prefix: string): Promise<number> {
  const users = await prisma.user.findMany({
    where: { userCode: { startsWith: prefix } },
    select: { userCode: true },
  });

  let max = START_NUM - 1;
  for (const u of users) {
    if (!u.userCode) continue;
    const match = u.userCode.match(new RegExp(`^${prefix}(\\d{4})`));
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > max) max = n;
    }
  }
  return max + 1;
}

export async function generateUserCode(role: Role, name: string): Promise<string> {
  const prefix = prefixForRole(role);
  const num = await nextNumericPart(prefix);
  const digits = String(num).padStart(4, "0");

  if (role === "STUDENT") {
    return `${prefix}${digits}${nameToInitials(name)}`;
  }
  return `${prefix}${digits}`;
}

export async function assignUserCodeIfMissing(
  userId: string,
  role: Role,
  name: string | null,
): Promise<string> {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { userCode: true },
  });
  if (existing?.userCode) return existing.userCode;

  const userCode = await generateUserCode(role, name ?? "User");
  await prisma.user.update({
    where: { id: userId },
    data: { userCode },
  });
  return userCode;
}

export async function backfillMissingUserCodes(): Promise<number> {
  const users = await prisma.user.findMany({
    where: { userCode: null },
    select: { id: true, role: true, name: true },
  });

  for (const u of users) {
    await assignUserCodeIfMissing(u.id, u.role, u.name);
  }
  return users.length;
}

export function normalizeLoginIdentifier(value: string): string {
  return value.trim();
}

export async function findUserByLoginIdentifier(identifier: string) {
  const id = normalizeLoginIdentifier(identifier);
  if (id.includes("@")) {
    return prisma.user.findUnique({ where: { email: id.toLowerCase() } });
  }
  return prisma.user.findUnique({
    where: { userCode: id.toUpperCase() },
  });
}
