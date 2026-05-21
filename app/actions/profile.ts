"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { changePasswordSchema } from "@/lib/validations/profile";
import { logAudit } from "@/lib/audit-log";

export type ProfileActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function changePasswordAction(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await requireAuth();

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      error: parsed.error.issues[0]?.message,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { passwordHash: true, userCode: true },
  });

  if (!user?.passwordHash) {
    return { error: "Password login is not set up for this account" };
  }

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) {
    return { error: "Current password is incorrect" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({
    where: { id: session.id },
    data: { passwordHash },
  });

  await logAudit({
    actorId: session.id,
    action: "CHANGE_PASSWORD",
    targetType: "User",
    targetId: session.id,
    description: `Password changed (${user.userCode ?? session.id})`,
  });

  revalidatePath("/dashboard/student/profile");
  revalidatePath("/dashboard/instructor/profile");
  revalidatePath("/dashboard/admin/profile");

  return { success: "Password updated successfully" };
}

export async function updateDisplayNameAction(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await requireAuth();
  const name = (formData.get("name") as string)?.trim();
  if (!name || name.length < 2) {
    return { error: "Name must be at least 2 characters" };
  }

  await prisma.user.update({
    where: { id: session.id },
    data: { name },
  });

  await logAudit({
    actorId: session.id,
    action: "UPDATE_PROFILE",
    targetType: "User",
    targetId: session.id,
    description: `Updated display name to ${name}`,
  });

  revalidatePath("/dashboard/student/profile");
  revalidatePath("/dashboard/instructor/profile");
  revalidatePath("/dashboard/admin/profile");

  return { success: "Name updated" };
}
