import type { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const RESERVED_STATUSES = ["PENDING", "APPROVED", "PROCESSING"] as const;

type DbClient = Prisma.TransactionClient | typeof prisma;

/** Sum of withdrawal amounts not yet paid out (pending admin review or approved, awaiting payout). */
export async function getReservedWithdrawalAmount(
  instructorId: string,
  db: DbClient = prisma,
): Promise<number> {
  const result = await db.withdrawal.aggregate({
    where: {
      instructorId,
      status: { in: [...RESERVED_STATUSES] },
    },
    _sum: { amount: true },
  });
  return Number(result._sum.amount ?? 0);
}

/** Balance available for new withdrawal requests (excludes amounts already requested). */
export async function getAvailableWithdrawalBalance(
  instructorId: string,
  db: DbClient = prisma,
): Promise<number> {
  const profile = await db.instructorProfile.findUnique({
    where: { userId: instructorId },
    select: { balance: true },
  });
  if (!profile) return 0;

  const reserved = await getReservedWithdrawalAmount(instructorId, db);
  return Math.max(0, Number(profile.balance) - reserved);
}
