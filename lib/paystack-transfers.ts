import { randomUUID } from "crypto";
import { getPaystackCurrency } from "@/lib/paystack-config";

const PAYSTACK_BASE = "https://api.paystack.co";

function getSecretKey(): string {
  const secretKey = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }
  return secretKey;
}

async function paystackRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<{ status: boolean; message?: string; data?: T }> {
  const response = await fetch(`${PAYSTACK_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  const body = (await response.json()) as {
    status: boolean;
    message?: string;
    data?: T;
  };

  if (!response.ok || !body.status) {
    throw new Error(body.message ?? `Paystack request failed (${response.status})`);
  }

  return body;
}

export type PaystackBankOption = {
  name: string;
  code: string;
};

export async function listPaystackMobileMoneyProviders(): Promise<PaystackBankOption[]> {
  const currency = getPaystackCurrency();
  const body = await paystackRequest<PaystackBankOption[]>(
    `/bank?currency=${encodeURIComponent(currency)}&type=mobile_money`,
  );
  return body.data ?? [];
}

export async function listPaystackBanks(): Promise<PaystackBankOption[]> {
  const currency = getPaystackCurrency();
  const body = await paystackRequest<PaystackBankOption[]>(
    `/bank?currency=${encodeURIComponent(currency)}`,
  );
  return body.data ?? [];
}

export async function createPaystackTransferRecipient(params: {
  type: "mobile_money" | "ghipss";
  name: string;
  accountNumber: string;
  bankCode: string;
}): Promise<string> {
  const body = await paystackRequest<{ recipient_code: string }>("/transferrecipient", {
    method: "POST",
    body: JSON.stringify({
      type: params.type,
      name: params.name,
      account_number: params.accountNumber,
      bank_code: params.bankCode,
      currency: getPaystackCurrency(),
    }),
  });

  const code = body.data?.recipient_code;
  if (!code) {
    throw new Error("Paystack did not return a recipient code");
  }
  return code;
}

export type PaystackTransferResult = {
  reference: string;
  transferCode: string;
  status: string;
};

export async function initiatePaystackTransfer(params: {
  recipientCode: string;
  amount: number;
  reference: string;
  reason: string;
}): Promise<PaystackTransferResult> {
  const body = await paystackRequest<{
    reference: string;
    transfer_code: string;
    status: string;
  }>("/transfer", {
    method: "POST",
    body: JSON.stringify({
      source: "balance",
      amount: Math.round(params.amount * 100),
      recipient: params.recipientCode,
      reference: params.reference,
      reason: params.reason,
      currency: getPaystackCurrency(),
    }),
  });

  if (!body.data?.reference || !body.data.transfer_code) {
    throw new Error("Paystack did not return transfer details");
  }

  return {
    reference: body.data.reference,
    transferCode: body.data.transfer_code,
    status: body.data.status,
  };
}

export function buildWithdrawalTransferReference(withdrawalId: string): string {
  return `brv_wd_${withdrawalId}_${randomUUID().slice(0, 8)}`;
}

export function isPaystackTransferSuccessful(status: string): boolean {
  return status === "success";
}

export function isPaystackTransferPending(status: string): boolean {
  return status === "pending" || status === "otp";
}
