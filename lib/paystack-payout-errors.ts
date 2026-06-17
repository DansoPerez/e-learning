const PAYSTACK_STARTER_PAYOUT_MESSAGE =
  "Paystack Starter businesses cannot send payouts to instructors. Upgrade your Paystack account (Registered business) or use Mark paid manually after paying via mobile money/bank.";

export function formatPaystackPayoutError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (message.toLowerCase().includes("starter business")) {
    return PAYSTACK_STARTER_PAYOUT_MESSAGE;
  }
  return message || "Paystack payout failed";
}

export function paystackPayoutErrorCode(error: unknown): string {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (message.includes("starter business")) return "paystack-starter";
  if (message.includes("insufficient")) return "paystack-balance";
  return "paystack-transfer";
}

export const PAYSTACK_PAYOUT_ERROR_MESSAGES: Record<string, string> = {
  "paystack-starter": PAYSTACK_STARTER_PAYOUT_MESSAGE,
  "paystack-balance":
    "Your Paystack balance is too low to send this payout. Top up your Paystack balance or mark the withdrawal paid manually.",
  "paystack-transfer":
    "Paystack could not send this payout. Try again or use Mark paid manually after paying the instructor externally.",
};
