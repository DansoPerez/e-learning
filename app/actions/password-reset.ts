"use server";

import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isEmailConfigured, sendPasswordResetEmail } from "@/lib/email";
import { rateLimitKey, checkRateLimit } from "@/lib/rate-limit";
import { passwordSchema } from "@/lib/validations/password";
import { normalizeEmail } from "@/lib/normalize-email";
import { logAudit } from "@/lib/audit-log";
import { requireSensitiveAdmin } from "@/lib/admin-permissions";
import { assertCanManageUser } from "@/lib/admin-guard";
import { invalidateUserSessions } from "@/lib/session-invalidate";

const RESET_EXPIRY_MIN = 60;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export type PasswordResetState = { error?: string; success?: boolean };

export async function requestPasswordResetAction(
  _prev: PasswordResetState,
  formData: FormData,
): Promise<PasswordResetState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));

  if (!email) {
    return { error: "Enter your email address." };
  }

  const limited = await checkRateLimit(
    rateLimitKey("pwd-reset", email),
    5,
    15 * 60_000,
  );
  if (!limited.ok) {
    return { error: `Too many attempts. Try again in ${limited.retryAfterSec}s.` };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (user && isEmailConfigured()) {
    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);

    await prisma.passwordResetToken.deleteMany({ where: { email } });
    await prisma.passwordResetToken.create({
      data: {
        email,
        tokenHash,
        expiresAt: new Date(Date.now() + RESET_EXPIRY_MIN * 60_000),
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL?.trim() || process.env.AUTH_URL?.trim() || "http://localhost:3000";
    const resetUrl = `${baseUrl.replace(/\/$/, "")}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

    try {
      await sendPasswordResetEmail({
        to: email,
        resetUrl,
        expiresMinutes: RESET_EXPIRY_MIN,
      });
    } catch {
      await prisma.passwordResetToken.deleteMany({ where: { email } });
      return {
        error:
          "Could not send reset email. Check RESEND_API_KEY and RESEND_FROM_EMAIL, or ask an admin to reset your password.",
      };
    }
  }

  return {
    success: true,
  };
}

export async function resetPasswordAction(
  _prev: PasswordResetState,
  formData: FormData,
): Promise<PasswordResetState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!email || !token) {
    return { error: "Invalid reset link." };
  }

  const limited = await checkRateLimit(rateLimitKey("pwd-reset-submit", email), 10, 15 * 60_000);
  if (!limited.ok) {
    return { error: `Too many attempts. Try again in ${limited.retryAfterSec}s.` };
  }

  const parsed = passwordSchema.safeParse(password);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid password" };
  }

  if (password !== confirm) {
    return { error: "Passwords do not match." };
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });

  if (!record || record.email !== email || record.expiresAt < new Date()) {
    return { error: "This reset link is invalid or has expired." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "Account not found." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });
  await prisma.passwordResetToken.deleteMany({ where: { email } });
  await invalidateUserSessions(user.id);

  await logAudit({
    actorId: user.id,
    action: "PASSWORD_RESET",
    targetType: "User",
    targetId: user.id,
    description: "Password reset via email link",
  });

  redirect("/login?reset=1");
}

/** Admin sets a new password for a user (when email is unavailable). */
export async function adminSetUserPasswordAction(
  userId: string,
  _prev: PasswordResetState,
  formData: FormData,
): Promise<PasswordResetState> {
  const admin = await requireSensitiveAdmin();
  await assertCanManageUser(admin.id, userId);

  const password = String(formData.get("password") ?? "");
  const parsed = passwordSchema.safeParse(password);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid password" };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "User not found" };

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
  await invalidateUserSessions(userId);

  await logAudit({
    actorId: admin.id,
    action: "ADMIN_SET_PASSWORD",
    targetType: "User",
    targetId: userId,
    description: `Admin set password for ${user.email}`,
  });

  return { success: true };
}
