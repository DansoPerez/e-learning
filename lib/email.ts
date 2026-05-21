import { Resend } from "resend";
import { PLATFORM_NAME } from "@/lib/constants";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return new Resend(apiKey);
}

function getFromAddress(): string {
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!from) {
    throw new Error("RESEND_FROM_EMAIL is not configured");
  }
  return from.includes("<") ? from : `${PLATFORM_NAME} <${from}>`;
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
  const resend = getResend();

  const { error } = await resend.emails.send({
    from: getFromAddress(),
    to,
    subject: `${PLATFORM_NAME} — verify your email`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #4f46e5; font-size: 22px; margin-bottom: 8px;">${PLATFORM_NAME}</h1>
        <p style="color: #334155; line-height: 1.5;">Use this code to verify your email and finish creating your account:</p>
        <p style="font-size: 32px; font-weight: 700; letter-spacing: 0.35em; color: #0f172a; margin: 24px 0; text-align: center;">${code}</p>
        <p style="color: #64748b; font-size: 14px;">This code expires in ${expiresMinutes} minutes. If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(error.message ?? "Failed to send verification email");
  }
}
