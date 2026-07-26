/**
 * Send a test email using whichever provider is configured (Gmail SMTP preferred, else Resend).
 * Usage: npm run email:check
 */
import "dotenv/config";
import {
  getEmailTransport,
  getFromAddress,
  isEmailConfigured,
  isSmtpConfigured,
} from "../lib/email-config";
import { sendVerificationOtpEmail } from "../lib/email";

async function main() {
  if (!isEmailConfigured()) {
    console.error("❌ Email is not configured.");
    console.error("   Gmail SMTP: set SMTP_HOST, SMTP_USER, SMTP_PASS in .env");
    console.error("   Or Resend: set RESEND_API_KEY and RESEND_FROM_EMAIL");
    process.exit(1);
  }

  const transport = getEmailTransport();
  const from = getFromAddress();
  const to =
    process.env.EMAIL_TEST_TO?.trim() ||
    process.env.RESEND_TEST_TO?.trim() ||
    process.env.SMTP_USER?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim();

  if (!to) {
    console.error("❌ Set EMAIL_TEST_TO to the inbox that should receive the test.");
    process.exit(1);
  }

  console.log(`Transport: ${transport === "smtp" ? "Gmail / SMTP" : "Resend"}`);
  console.log(`From: ${from}`);
  console.log(`To:   ${to}`);
  console.log("Sending test verification email …");

  await sendVerificationOtpEmail({
    to,
    code: "123456",
    expiresMinutes: 10,
  });

  console.log("✓ Test email sent.");
  if (isSmtpConfigured()) {
    console.log("Check the inbox (and spam) for a Bravio verification code email.");
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error("❌ Email check failed:", message);
  if (/invalid login|not accepted|application-specific/i.test(message)) {
    console.error("   Tip: use a Google App Password, not your normal Gmail password.");
    console.error("   https://myaccount.google.com/apppasswords");
  }
  process.exit(1);
});
