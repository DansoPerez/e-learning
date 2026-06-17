import { NextResponse } from "next/server";
import {
  getCurrencyForPayoutCountry,
  getPayoutCountry,
} from "@/lib/payout-countries";
import { listPaystackBanks, listPaystackMobileMoneyProviders } from "@/lib/paystack-transfers";
import { isPaystackPayoutsEnabled } from "@/lib/services/withdrawal-payout";

export async function GET(request: Request) {
  if (!isPaystackPayoutsEnabled()) {
    return NextResponse.json({ error: "Paystack payouts are not enabled" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const countryCode = searchParams.get("country")?.trim().toUpperCase() ?? "";
  const payoutType = searchParams.get("payoutType")?.trim() ?? "mobile_money";

  const country = getPayoutCountry(countryCode);
  if (!country) {
    return NextResponse.json({ error: "Select a valid country" }, { status: 400 });
  }

  try {
    const currency = getCurrencyForPayoutCountry(countryCode);
    const options =
      payoutType === "mobile_money" ?
        await listPaystackMobileMoneyProviders(currency)
      : await listPaystackBanks(currency);

    return NextResponse.json({ options, currency });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load payout options";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
