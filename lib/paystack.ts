import { createHmac } from "crypto";

const PAYSTACK_BASE = "https://api.paystack.co";

export async function initializePaystackPayment(params: {
  email: string;
  amount: number;
  reference: string;
  metadata?: Record<string, unknown>;
}) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }

  const response = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: Math.round(params.amount * 100),
      reference: params.reference,
      currency: process.env.PAYSTACK_CURRENCY ?? "GHS",
      metadata: params.metadata,
      callback_url: `${process.env.NEXTAUTH_URL}/courses/payment/callback`,
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.status) {
    throw new Error(data.message ?? "Failed to initialize payment");
  }

  return data.data as { authorization_url: string; access_code: string; reference: string };
}

export function verifyPaystackSignature(body: string, signature: string | null) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !signature) return false;

  const hash = createHmac("sha512", secret).update(body).digest("hex");
  return hash === signature;
}
