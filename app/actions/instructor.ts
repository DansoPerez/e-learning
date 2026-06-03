"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import { instructorApplicationSchema, withdrawalSchema } from "@/lib/validations/course";

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

  try {
    await prisma.$transaction(async (tx) => {
      const profile = await tx.instructorProfile.findUnique({
        where: { userId: user.id },
      });

      if (!profile || profile.status !== "APPROVED") {
        throw new Error("Instructor profile not approved");
      }
      if (profile.earningsFrozen) {
        throw new Error("Your earnings are frozen. Contact support.");
      }
      if (parsed.data.amount > Number(profile.balance)) {
        throw new Error("Insufficient balance");
      }

      const deducted = await tx.instructorProfile.updateMany({
        where: { userId: user.id, balance: { gte: parsed.data.amount } },
        data: { balance: { decrement: parsed.data.amount } },
      });
      if (deducted.count === 0) {
        throw new Error("Insufficient balance");
      }

      await tx.withdrawal.create({
        data: {
          instructorId: user.id,
          amount: parsed.data.amount,
          note: parsed.data.note,
        },
      });
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Withdrawal request failed",
    };
  }

  revalidatePath("/dashboard/instructor/withdrawals");
  return { success: true };
}
