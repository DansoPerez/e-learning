import { PLATFORM_NAME } from "@/lib/constants";

/** True when Resend API key and sender are configured. */
export function isEmailConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() && process.env.RESEND_FROM_EMAIL?.trim(),
  );
}

/**
 * OTP registration flow is on when Resend is configured.
 * Set EMAIL_VERIFICATION_ENABLED=false to skip OTP even with a key (e.g. staging).
 */
export function isEmailVerificationEnabled(): boolean {
  if (process.env.EMAIL_VERIFICATION_ENABLED === "false") return false;
  return isEmailConfigured();
}

/** Inboxes that should receive operational admin alerts (withdrawals, etc.). */
export function getAdminNotificationInbox(): string | undefined {
  return process.env.ADMIN_NOTIFICATION_EMAIL?.trim() || undefined;
}

/** Resend `from` field — `Name <email@domain.com>`. */
export function getResendFromAddress(): string {
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim();
  if (!fromEmail) {
    throw new Error("RESEND_FROM_EMAIL is not configured");
  }
  if (fromEmail.includes("<") && fromEmail.includes(">")) {
    return fromEmail;
  }
  const fromName = process.env.RESEND_FROM_NAME?.trim() || PLATFORM_NAME;
  return `${fromName} <${fromEmail}>`;
}
