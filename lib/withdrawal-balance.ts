import type { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const RESERVED_STATUSES = ["PENDING", "APPROVED", "PROCESSING"] as const;

type DbClient = Prisma.TransactionClient | typeof prisma;

/**
 * Backfill SALE ledger rows for successful payments that never got one
 * (e.g. older data). Skips payments that already have any SALE ledger entry.
 */
export async function ensureSaleLedgerForInstructor(
  instructorId: string,
  db: DbClient = prisma,
): Promise<void> {
  const profile = await db.instructorProfile.findUnique({
    where: { userId: instructorId },
    select: { status: true, earningsFrozen: true },
  });
  if (!profile || profile.status !== "APPROVED" || profile.earningsFrozen) {
    return;
  }

  const payments = await db.payment.findMany({
    where: { status: "SUCCESS", course: { instructorId } },
    select: {
      id: true,
      instructorShare: true,
      course: { select: { title: true } },
    },
  });
  if (payments.length === 0) return;

  const existing = await db.earningsLedger.findMany({
    where: {
      type: "SALE",
      referenceId: { in: payments.map((p) => p.id) },
    },
    select: { referenceId: true },
  });
  const credited = new Set(existing.map((e) => e.referenceId).filter(Boolean));

  for (const payment of payments) {
    if (credited.has(payment.id)) continue;

    await db.earningsLedger.create({
      data: {
        userId: instructorId,
        amount: Number(payment.instructorShare),
        type: "SALE",
        description: `Sale for course: ${payment.course.title}`,
        referenceId: payment.id,
      },
    });
  }
}

/** Lifetime instructor share actually credited (sales ledger), not raw payment rows. */
export async function getInstructorLifetimeEarnings(
  instructorId: string,
  db: DbClient = prisma,
): Promise<number> {
  const result = await db.earningsLedger.aggregate({
    where: { userId: instructorId, type: "SALE" },
    _sum: { amount: true },
  });
  return Number(result._sum.amount ?? 0);
}

/** Sum of withdrawal amounts already paid out. */
export async function getCompletedWithdrawalAmount(
  instructorId: string,
  db: DbClient = prisma,
): Promise<number> {
  const result = await db.withdrawal.aggregate({
    where: { instructorId, status: "COMPLETED" },
    _sum: { amount: true },
  });
  return Number(result._sum.amount ?? 0);
}

/**
 * Wallet total: credited sales minus completed payouts.
 * Always ≤ lifetime earnings; stays correct if courses are reassigned later.
 */
export async function getInstructorWalletBalance(
  instructorId: string,
  db: DbClient = prisma,
): Promise<number> {
  const [earnings, completed] = await Promise.all([
    getInstructorLifetimeEarnings(instructorId, db),
    getCompletedWithdrawalAmount(instructorId, db),
  ]);
  return Math.max(0, earnings - completed);
}

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
  const [wallet, reserved] = await Promise.all([
    getInstructorWalletBalance(instructorId, db),
    getReservedWithdrawalAmount(instructorId, db),
  ]);
  return Math.max(0, wallet - reserved);
}

/** Keep denormalized `InstructorProfile.balance` aligned with the derived wallet. */
export async function syncInstructorProfileBalance(
  instructorId: string,
  db: DbClient = prisma,
): Promise<number> {
  await ensureSaleLedgerForInstructor(instructorId, db);
  const wallet = await getInstructorWalletBalance(instructorId, db);
  await db.instructorProfile.update({
    where: { userId: instructorId },
    data: { balance: wallet },
  });
  return wallet;
}
