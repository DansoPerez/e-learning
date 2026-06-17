/**
 * Send a sample withdrawal alert email (same path as a real request).
 * Usage: npm run email:withdrawal-test
 */
import "dotenv/config";
import { sendWithdrawalRequestAdminEmail } from "../lib/email";
import { getAdminNotificationInbox, isEmailConfigured } from "../lib/email-config";
import { getAppBaseUrl } from "../lib/paystack-config";

async function main() {
  if (!isEmailConfigured()) {
    console.error("❌ Set RESEND_API_KEY and RESEND_FROM_EMAIL in .env");
    process.exit(1);
  }

  const to = getAdminNotificationInbox();
  if (!to) {
    console.error("❌ Set ADMIN_NOTIFICATION_EMAIL in .env (your Resend account email for test mode)");
    process.exit(1);
  }

  const baseUrl = process.env.NEXTAUTH_URL?.trim() || process.env.AUTH_URL?.trim() || "http://localhost:3000";

  await sendWithdrawalRequestAdminEmail({
    to: [to],
    instructorName: "Test Instructor",
    instructorUserCode: "INS-TEST",
    instructorEmail: "instructor@example.com",
    amountLabel: "GH₵50.00",
    note: "Test withdrawal notification",
    reviewUrl: `${baseUrl.replace(/\/$/, "")}/dashboard/admin/withdrawals`,
  });

  console.log(`✓ Withdrawal alert sent to ${to}`);
}

main().catch((error) => {
  console.error("❌ Failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
