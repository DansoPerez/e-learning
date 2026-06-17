import { Resend } from "resend";
import { PLATFORM_NAME } from "@/lib/constants";
import { getResendFromAddress, isEmailConfigured } from "@/lib/email-config";

export { isEmailConfigured, isEmailVerificationEnabled } from "@/lib/email-config";

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return new Resend(apiKey);
}

function formatResendError(error: { message?: string; name?: string } | null): string {
  if (!error?.message) return "Resend could not send the email";
  return error.message;
}

export async function sendVerificationOtpEmail({
  to,
  code,
  expiresMinutes,
}: {
  to: string;
  code: string;
  expiresMinutes: number;
}) {
  const resend = getResendClient();
  const { error } = await resend.emails.send({
    from: getResendFromAddress(),
    to: [to],
    subject: `${PLATFORM_NAME} — verify your email`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #0056D2; font-size: 22px; margin-bottom: 8px;">${PLATFORM_NAME}</h1>
        <p style="color: #334155; line-height: 1.5;">Use this code to verify your email and finish creating your account:</p>
        <p style="font-size: 32px; font-weight: 700; letter-spacing: 0.35em; color: #0f172a; margin: 24px 0; text-align: center;">${code}</p>
        <p style="color: #64748b; font-size: 14px;">This code expires in ${expiresMinutes} minutes. If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(formatResendError(error));
  }
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
  expiresMinutes,
}: {
  to: string;
  resetUrl: string;
  expiresMinutes: number;
}) {
  const resend = getResendClient();
  const { error } = await resend.emails.send({
    from: getResendFromAddress(),
    to: [to],
    subject: `${PLATFORM_NAME} — reset your password`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #0056D2; font-size: 22px;">${PLATFORM_NAME}</h1>
        <p style="color: #334155; line-height: 1.5;">Click the link below to reset your password. This link expires in ${expiresMinutes} minutes.</p>
        <p style="margin: 24px 0;"><a href="${resetUrl}" style="background: #0056D2; color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">Reset password</a></p>
        <p style="color: #64748b; font-size: 14px;">If you did not request this, ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(formatResendError(error));
  }
}
