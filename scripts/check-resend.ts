/**
 * Verify Resend credentials (sends a test email to RESEND_TEST_TO or the from address).
 * Usage: npm run resend:check
 */
import "dotenv/config";
import { Resend } from "resend";
import { getResendFromAddress, isEmailConfigured } from "../lib/email-config";

async function main() {
  if (!isEmailConfigured()) {
    console.error("❌ Resend is not configured.");
    console.error("   Set RESEND_API_KEY and RESEND_FROM_EMAIL in .env");
    console.error("   Get your API key: https://resend.com/api-keys");
    process.exit(1);
  }

  const apiKey = process.env.RESEND_API_KEY!.trim();
  const from = getResendFromAddress();
  const to = process.env.RESEND_TEST_TO?.trim() || process.env.RESEND_FROM_EMAIL!.trim();

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
  console.log("Registration OTP and password reset emails will use this sender.");
}

main().catch((error) => {
  console.error("❌ Resend check failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
