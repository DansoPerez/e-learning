/**
 * Verify Resend credentials (sends a test email to RESEND_TEST_TO or the from address).
 * Usage: npm run resend:check
 *
 * For Gmail SMTP, use `npm run email:check` instead.
 */
import "dotenv/config";
import { Resend } from "resend";
import { PLATFORM_NAME } from "../lib/constants";

async function main() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim();

  if (!apiKey || !fromEmail) {
    console.error("❌ Resend is not configured.");
    console.error("   Set RESEND_API_KEY and RESEND_FROM_EMAIL in .env");
    console.error("   Prefer Gmail SMTP? Use: npm run email:check");
    console.error("   Get your API key: https://resend.com/api-keys");
    process.exit(1);
  }

  const fromName = process.env.RESEND_FROM_NAME?.trim() || PLATFORM_NAME;
  const from =
    fromEmail.includes("<") && fromEmail.includes(">")
      ? fromEmail
      : `${fromName} <${fromEmail}>`;
  const to = process.env.RESEND_TEST_TO?.trim() || fromEmail;

  console.log(`Sending test email from ${from} to ${to} …`);

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject: "Bravio — Resend test",
    html: "<p>If you received this, Resend is configured correctly for Bravio.</p>",
  });

  if (error) {
    console.error("❌ Resend rejected the request:", error.message);
    if (error.message?.toLowerCase().includes("domain")) {
      console.error("   Verify your domain at https://resend.com/domains");
      console.error("   For local testing use RESEND_FROM_EMAIL=onboarding@resend.dev");
    }
    process.exit(1);
  }

  console.log("✓ Test email sent", data?.id ? `(id: ${data.id})` : "");
  console.log("Note: if SMTP_* is also set, the app prefers Gmail SMTP over Resend.");
}

main().catch((error) => {
  console.error("❌ Resend check failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
