import { prisma } from "@/lib/prisma";
import {
  buildWithdrawalTransferReference,
  createPaystackTransferRecipient,
  initiatePaystackTransfer,
  isPaystackTransferPending,
  isPaystackTransferSuccessful,
} from "@/lib/paystack-transfers";
import { isPaymentsEnabled } from "@/lib/paystack-config";

export function isPaystackPayoutsEnabled(): boolean {
  if (process.env.PAYSTACK_PAYOUTS_ENABLED === "false") return false;
  return isPaymentsEnabled();
}

export function hasPayoutDetails(profile: {
  payoutType: string | null;
  payoutAccountNumber: string | null;
  payoutBankCode: string | null;
}): boolean {
  return Boolean(
    profile.payoutType &&
      profile.payoutAccountNumber?.trim() &&
      profile.payoutBankCode?.trim(),
  );
}

async function ensurePaystackRecipient(
  instructorId: string,
  instructorName: string,
): Promise<string> {
  const profile = await prisma.instructorProfile.findUnique({
    where: { userId: instructorId },
  });
  if (!profile || !hasPayoutDetails(profile)) {
    throw new Error("Instructor has not saved payout details");
  }

  if (profile.paystackRecipientCode) {
    return profile.paystackRecipientCode;
  }

  const recipientCode = await createPaystackTransferRecipient({
    type: profile.payoutType === "ghipss" ? "ghipss" : "mobile_money",
    name: instructorName,
    accountNumber: profile.payoutAccountNumber!.trim(),
    bankCode: profile.payoutBankCode!.trim(),
  });

  await prisma.instructorProfile.update({
    where: { userId: instructorId },
    data: { paystackRecipientCode: recipientCode },
  });

  return recipientCode;
}

/** Initiate Paystack transfer for an approved withdrawal. */
export async function initiateWithdrawalPaystackTransfer(withdrawalId: string) {
  if (!isPaystackPayoutsEnabled()) {
    throw new Error("Paystack payouts are not enabled");
  }

  const withdrawal = await prisma.withdrawal.findUnique({
    where: { id: withdrawalId },
    include: {
      instructor: { select: { id: true, name: true, email: true } },
    },
  });

  if (!withdrawal || withdrawal.status !== "APPROVED") {
    throw new Error("Only approved withdrawals can be paid via Paystack");
  }

  const recipientCode = await ensurePaystackRecipient(
    withdrawal.instructorId,
    withdrawal.instructor.name ?? "Instructor",
  );

  const reference =
    withdrawal.paystackTransferReference ?? buildWithdrawalTransferReference(withdrawal.id);

  const transfer = await initiatePaystackTransfer({
    recipientCode,
    amount: withdrawal.amount,
    reference,
    reason: `Bravio instructor withdrawal`,
  });

  if (isPaystackTransferSuccessful(transfer.status)) {
    await finalizeWithdrawalPayout(withdrawal.id, reference, transfer.transferCode);
    return { status: "completed" as const, reference };
  }

  if (isPaystackTransferPending(transfer.status)) {
    await prisma.withdrawal.update({
      where: { id: withdrawal.id },
      data: {
        status: "PROCESSING",
        paystackTransferReference: reference,
        paystackTransferCode: transfer.transferCode,
      },
    });
    return { status: "processing" as const, reference };
  }

  throw new Error(`Paystack transfer failed with status: ${transfer.status}`);
}

/** Deduct balance and mark withdrawal completed after Paystack confirms transfer. */
export async function finalizeWithdrawalPayout(
  withdrawalId: string,
  transferReference: string,
  transferCode?: string,
) {
  await prisma.$transaction(async (tx) => {
    const withdrawal = await tx.withdrawal.findUnique({
      where: { id: withdrawalId },
    });
    if (!withdrawal || withdrawal.status === "COMPLETED") return;

    const deducted = await tx.instructorProfile.updateMany({
      where: {
        userId: withdrawal.instructorId,
        balance: { gte: withdrawal.amount },
      },
      data: { balance: { decrement: withdrawal.amount } },
    });
    if (deducted.count === 0) {
      throw new Error("Instructor no longer has sufficient balance to complete this payout");
    }

    await tx.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: "COMPLETED",
        paystackTransferReference: transferReference,
        paystackTransferCode: transferCode ?? withdrawal.paystackTransferCode,
      },
    });
  });
}

export async function handlePaystackTransferWebhook(params: {
  reference: string;
  status: string;
  amount: number;
}) {
  const withdrawal = await prisma.withdrawal.findUnique({
    where: { paystackTransferReference: params.reference },
  });
  if (!withdrawal) return;

  if (
    params.status === "success" &&
    withdrawal.status !== "COMPLETED" &&
    params.amount === Math.round(withdrawal.amount * 100)
  ) {
    await finalizeWithdrawalPayout(
      withdrawal.id,
      params.reference,
      withdrawal.paystackTransferCode ?? undefined,
    );
    return;
  }

  if (params.status === "failed" || params.status === "reversed") {
    await prisma.withdrawal.update({
      where: { id: withdrawal.id },
      data: {
        status: "APPROVED",
        paystackTransferReference: null,
        paystackTransferCode: null,
        adminNote: "Paystack transfer failed — retry payout or mark paid manually.",
      },
    });
  }
}
