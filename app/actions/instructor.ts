"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import { instructorApplicationSchema, withdrawalSchema } from "@/lib/validations/course";
import { notifyAdminsOfWithdrawalRequest } from "@/lib/notifications";
import { getAvailableWithdrawalBalance } from "@/lib/withdrawal-balance";
import { payoutDetailsSchema } from "@/lib/validations/payout";
import { hasPayoutDetails, isPaystackPayoutsEnabled } from "@/lib/services/withdrawal-payout";

export type ActionState = { error?: string; success?: boolean };

export async function applyInstructorAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireAuth();

  const existingProfile = await prisma.instructorProfile.findUnique({
    where: { userId: user.id },
    select: { status: true },
  });
  if (existingProfile?.status === "APPROVED") {
    return { error: "You are already an approved instructor." };
  }

  const parsed = instructorApplicationSchema.safeParse({
    bio: formData.get("bio"),
    expertise: formData.get("expertise"),
    experienceYears: formData.get("experienceYears"),
    qualification: formData.get("qualification"),
    selfieUrl: formData.get("selfieUrl"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid application" };
  }

  await prisma.instructorProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      ...parsed.data,
      status: "PENDING",
    },
    update: {
      ...parsed.data,
      status: "PENDING",
      rejectionReason: null,
    },
  });

  if (user.role === "STUDENT") {
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "INSTRUCTOR" },
    });
  }

  revalidatePath("/dashboard/instructor");
  redirect("/dashboard/instructor/pending");
}

export async function requestWithdrawalAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole("INSTRUCTOR");

  const parsed = withdrawalSchema.safeParse({
    amount: formData.get("amount"),
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid amount" };
  }

  let withdrawalId: string;

  try {
    const withdrawal = await prisma.$transaction(async (tx) => {
      const profile = await tx.instructorProfile.findUnique({
        where: { userId: user.id },
      });

      if (!profile || profile.status !== "APPROVED") {
        throw new Error("Instructor profile not approved");
      }
      if (profile.earningsFrozen) {
        throw new Error("Your earnings are frozen. Contact support.");
      }
      if (isPaystackPayoutsEnabled() && !hasPayoutDetails(profile)) {
        throw new Error("Save your mobile money or bank payout details before requesting a withdrawal");
      }

      const available = await getAvailableWithdrawalBalance(user.id, tx);
      if (parsed.data.amount > available) {
        throw new Error("Insufficient available balance");
      }

      return tx.withdrawal.create({
        data: {
          instructorId: user.id,
          amount: parsed.data.amount,
          note: parsed.data.note,
        },
      });
    });
    withdrawalId = withdrawal.id;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Withdrawal request failed",
    };
  }

  await notifyAdminsOfWithdrawalRequest({
    withdrawalId,
    instructorName: user.name ?? "Instructor",
    instructorUserCode: user.userCode ?? null,
    instructorEmail: user.email,
    amount: parsed.data.amount,
    note: parsed.data.note,
  });

  revalidatePath("/dashboard/instructor/withdrawals");
  return { success: true };
}

export async function savePayoutDetailsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireRole("INSTRUCTOR");

  const parsed = payoutDetailsSchema.safeParse({
    payoutCountry: formData.get("payoutCountry"),
    payoutType:
      formData.get("payoutType") === "ghipss" ? "bank" : formData.get("payoutType"),
    payoutAccountNumber: formData.get("payoutAccountNumber"),
    payoutBankCode: formData.get("payoutBankCode"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid payout details" };
  }

  await prisma.instructorProfile.update({
    where: { userId: user.id },
    data: {
      payoutCountry: parsed.data.payoutCountry,
      payoutType: parsed.data.payoutType,
      payoutAccountNumber: parsed.data.payoutAccountNumber,
      payoutBankCode: parsed.data.payoutBankCode,
      paystackRecipientCode: null,
    },
  });

  revalidatePath("/dashboard/instructor/withdrawals");
  return { success: true };
}
