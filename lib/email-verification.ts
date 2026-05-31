import bcrypt from "bcryptjs";
import { randomInt } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationOtpEmail } from "@/lib/email";
import { normalizeEmail } from "@/lib/normalize-email";

export const OTP_LENGTH = 6;
export const OTP_EXPIRY_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;

export type PendingRegistrationMetadata = {
  name: string;
  passwordHash: string;
  role: "STUDENT" | "INSTRUCTOR";
  instructor?: {
    bio: string;
    expertise: string;
    experienceYears: number;
    qualification: string;
    selfieUrl: string;
  };
};

export function generateOtpCode(): string {
  return String(randomInt(0, 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, "0");
}

export async function hashOtp(code: string): Promise<string> {
  return bcrypt.hash(code, 10);
}

export async function verifyOtp(code: string, codeHash: string): Promise<boolean> {
  return bcrypt.compare(code, codeHash);
}

export async function createRegistrationOtp(
  email: string,
  metadata: PendingRegistrationMetadata,
): Promise<void> {
  const normalized = normalizeEmail(email);
  const code = generateOtpCode();
  const codeHash = await hashOtp(code);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60_000);

  await prisma.emailVerification.deleteMany({
    where: { email: normalized, purpose: "REGISTER" },
  });
  await prisma.emailVerification.create({
    data: {
      email: normalized,
      codeHash,
      purpose: "REGISTER",
      metadata,
      expiresAt,
    },
  });

  await sendVerificationOtpEmail({
    to: normalized,
    code,
    expiresMinutes: OTP_EXPIRY_MINUTES,
  });
}

export async function resendRegistrationOtp(email: string): Promise<
  | { ok: true }
  | { ok: false; error: string; retryAfterSeconds?: number }
> {
  const normalized = normalizeEmail(email);
  const existing = await prisma.emailVerification.findFirst({
    where: { email: normalized, purpose: "REGISTER" },
    orderBy: { createdAt: "desc" },
  });

  if (!existing) {
    return { ok: false, error: "No pending registration found. Please start again." };
  }

  const secondsSince =
    (Date.now() - existing.createdAt.getTime()) / 1000;
  if (secondsSince < OTP_RESEND_COOLDOWN_SECONDS) {
    return {
      ok: false,
      error: "Please wait before requesting another code.",
      retryAfterSeconds: Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - secondsSince),
    };
  }

  await createRegistrationOtp(
    normalized,
    existing.metadata as PendingRegistrationMetadata,
  );
  return { ok: true };
}

export async function verifyRegistrationOtp(
  email: string,
  code: string,
): Promise<
  | { ok: true; metadata: PendingRegistrationMetadata }
  | { ok: false; error: string }
> {
  const normalized = normalizeEmail(email);
  const record = await prisma.emailVerification.findFirst({
    where: { email: normalized, purpose: "REGISTER" },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    return { ok: false, error: "Verification expired. Please register again." };
  }

  if (record.expiresAt < new Date()) {
    await prisma.emailVerification.delete({ where: { id: record.id } });
    return { ok: false, error: "Code expired. Request a new code." };
  }

  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    await prisma.emailVerification.delete({ where: { id: record.id } });
    return { ok: false, error: "Too many attempts. Please register again." };
  }

  const valid = await verifyOtp(code.trim(), record.codeHash);
  if (!valid) {
    await prisma.emailVerification.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    const remaining = OTP_MAX_ATTEMPTS - record.attempts - 1;
    return {
      ok: false,
      error:
        remaining > 0 ?
          `Invalid code. ${remaining} attempt${remaining === 1 ? "" : "s"} left.`
        : "Invalid code. Please register again.",
    };
  }

  await prisma.emailVerification.delete({ where: { id: record.id } });
  return {
    ok: true,
    metadata: record.metadata as PendingRegistrationMetadata,
  };
}
