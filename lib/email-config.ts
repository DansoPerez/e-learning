import { PLATFORM_NAME } from "@/lib/constants";

/** Gmail / any SMTP — preferred when `SMTP_HOST`, `SMTP_USER`, and `SMTP_PASS` are set. */
export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.replace(/\s+/g, ""),
  );
}

/** Resend API — used when SMTP is not configured. */
export function isResendConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() && process.env.RESEND_FROM_EMAIL?.trim(),
  );
}

/** True when either Gmail SMTP or Resend can send mail. */
export function isEmailConfigured(): boolean {
  return isSmtpConfigured() || isResendConfigured();
}

/**
 * OTP registration is enabled when an email provider is configured.
 * Set EMAIL_VERIFICATION_ENABLED=true to force it on, or =false to disable.
 */
export function isEmailVerificationEnabled(): boolean {
  if (process.env.EMAIL_VERIFICATION_ENABLED === "false") return false;
  if (process.env.EMAIL_VERIFICATION_ENABLED === "true") return true;
  return isEmailConfigured();
}

/** Inboxes that should receive operational admin alerts (withdrawals, etc.). */
export function getAdminNotificationInbox(): string | undefined {
  return process.env.ADMIN_NOTIFICATION_EMAIL?.trim() || undefined;
}

export type EmailTransport = "smtp" | "resend";

export function getEmailTransport(): EmailTransport {
  if (isSmtpConfigured()) return "smtp";
  if (isResendConfigured()) return "resend";
  throw new Error(
    "Email is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS (Gmail), or RESEND_API_KEY and RESEND_FROM_EMAIL.",
  );
}

/**
 * Sender shown to recipients.
 * SMTP: `SMTP_FROM` or your Gmail address (`SMTP_USER`).
 * Resend: `RESEND_FROM_EMAIL` (verified domain or onboarding@resend.dev).
 */
export function getFromAddress(): string {
  const transport = getEmailTransport();
  const fromName =
    process.env.SMTP_FROM_NAME?.trim() ||
    process.env.RESEND_FROM_NAME?.trim() ||
    PLATFORM_NAME;

  if (transport === "smtp") {
    const fromEmail =
      process.env.SMTP_FROM?.trim() || process.env.SMTP_USER?.trim();
    if (!fromEmail) {
      throw new Error("SMTP_FROM or SMTP_USER is not configured");
    }
    if (fromEmail.includes("<") && fromEmail.includes(">")) return fromEmail;
    return `${fromName} <${fromEmail}>`;
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim();
  if (!fromEmail) {
    throw new Error("RESEND_FROM_EMAIL is not configured");
  }
  if (fromEmail.includes("<") && fromEmail.includes(">")) return fromEmail;
  return `${fromName} <${fromEmail}>`;
}

/** @deprecated Use getFromAddress — kept for older scripts. */
export function getResendFromAddress(): string {
  return getFromAddress();
}

export function getSmtpConnectionOptions() {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  // Gmail App Passwords are often copied with spaces — strip them.
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, "") ?? "";
  if (!host || !user || !pass) {
    throw new Error("SMTP_HOST, SMTP_USER, and SMTP_PASS are required");
  }

  const port = Number(process.env.SMTP_PORT?.trim() || "465");
  const secureEnv = process.env.SMTP_SECURE?.trim()?.toLowerCase();
  const secure =
    secureEnv === "true" || secureEnv === "1"
      ? true
      : secureEnv === "false" || secureEnv === "0"
        ? false
        : port === 465;

  return {
    host,
    port,
    secure,
    auth: { user, pass },
  };
}
