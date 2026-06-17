/**
 * Verify Paystack credentials and callback URL configuration.
 * Usage: npm run paystack:check
 */
import "dotenv/config";
import { getAppBaseUrl, getPaystackCurrency, isPaymentsEnabled } from "../lib/paystack-config";

async function main() {
  const secretKey = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!secretKey) {
    console.error("❌ PAYSTACK_SECRET_KEY is not set in .env");
    console.error("   Get your test secret key from https://dashboard.paystack.com/#/settings/developer");
    process.exit(1);
  }

  if (!isPaymentsEnabled()) {
    console.error("❌ Payments are disabled (PAYMENTS_ENABLED=false).");
    process.exit(1);
  }

  let baseUrl: string;
  try {
    baseUrl = getAppBaseUrl();
  } catch (error) {
    console.error(`❌ ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }

  const currency = getPaystackCurrency();
  console.log(`Checking Paystack (${currency}) …`);
  console.log(`Callback URL: ${baseUrl}/courses/payment/callback`);
  console.log(`Webhook URL:  ${baseUrl}/api/paystack/webhook`);

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "paystack-check@bravio.app",
      amount: 100,
      reference: `brv_check_${Date.now()}`,
      currency,
      callback_url: `${baseUrl}/courses/payment/callback`,
    }),
  });

  const data = (await response.json()) as { status?: boolean; message?: string };
  if (!response.ok || !data.status) {
    console.error("❌ Paystack rejected the request:", data.message ?? response.statusText);
    process.exit(1);
  }

  console.log("✓ Paystack secret key is valid");
  console.log("Next: set a course price > 0, enroll as a student, and complete a test payment.");
  console.log("Register the webhook URL in Paystack → Settings → Webhooks.");
}

main().catch((error) => {
  console.error("❌ Paystack check failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
