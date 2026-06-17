import { getPaystackCurrency } from "@/lib/paystack-config";

export type PaystackBankRecipientType = "ghipss" | "nuban" | "kepss" | "basa";

export type PayoutCountry = {
  code: string;
  name: string;
  currency: string;
  supportsMobileMoney: boolean;
  bankRecipientType: PaystackBankRecipientType;
};

export const PAYOUT_COUNTRIES: PayoutCountry[] = [
  {
    code: "GH",
    name: "Ghana",
    currency: "GHS",
    supportsMobileMoney: true,
    bankRecipientType: "ghipss",
  },
  {
    code: "NG",
    name: "Nigeria",
    currency: "NGN",
    supportsMobileMoney: false,
    bankRecipientType: "nuban",
  },
  {
    code: "KE",
    name: "Kenya",
    currency: "KES",
    supportsMobileMoney: true,
    bankRecipientType: "kepss",
  },
  {
    code: "ZA",
    name: "South Africa",
    currency: "ZAR",
    supportsMobileMoney: false,
    bankRecipientType: "basa",
  },
];

export function getPayoutCountry(code: string): PayoutCountry | undefined {
  return PAYOUT_COUNTRIES.find((country) => country.code === code.toUpperCase());
}

/** Countries whose currency matches the platform Paystack currency. */
export function getAvailablePayoutCountries(): PayoutCountry[] {
  const platformCurrency = getPaystackCurrency().toUpperCase();
  return PAYOUT_COUNTRIES.filter((country) => country.currency === platformCurrency);
}

export function defaultPayoutCountryCode(): string {
  return getAvailablePayoutCountries()[0]?.code ?? "GH";
}

export type StoredPayoutType = "mobile_money" | "bank" | "ghipss";

export function normalizePayoutType(value: string | null | undefined): "mobile_money" | "bank" {
  if (value === "mobile_money") return "mobile_money";
  return "bank";
}

export function resolvePaystackRecipientType(
  countryCode: string,
  payoutType: "mobile_money" | "bank",
): "mobile_money" | PaystackBankRecipientType {
  const country = getPayoutCountry(countryCode);
  if (!country) {
    throw new Error("Unsupported payout country");
  }
  if (payoutType === "mobile_money") {
    if (!country.supportsMobileMoney) {
      throw new Error("Mobile money is not available for this country");
    }
    return "mobile_money";
  }
  return country.bankRecipientType;
}

export function getCurrencyForPayoutCountry(countryCode: string): string {
  const country = getPayoutCountry(countryCode);
  if (!country) {
    throw new Error("Unsupported payout country");
  }
  return country.currency;
}
