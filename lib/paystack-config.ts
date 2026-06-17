/** Paystack currency code (GHS for Ghana cedis). */
export function getPaystackCurrency(): string {
  return process.env.PAYSTACK_CURRENCY?.trim() || "GHS";
}

/**
 * Paid checkout is on when PAYSTACK_SECRET_KEY is set.
 * Set PAYMENTS_ENABLED=false to keep free enrollment even with a key (e.g. staging).
 */
export function isPaymentsEnabled(): boolean {
  if (process.env.PAYMENTS_ENABLED === "false") return false;
  return Boolean(process.env.PAYSTACK_SECRET_KEY?.trim());
}

export function getAppBaseUrl(): string {
  const url = process.env.NEXTAUTH_URL?.trim() || process.env.AUTH_URL?.trim();
  if (!url) {
    throw new Error(
      "NEXTAUTH_URL (or AUTH_URL) is required for Paystack callbacks. Set it to your site URL.",
    );
  }
  return url.replace(/\/$/, "");
}
