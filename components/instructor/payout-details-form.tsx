"use client";

import { useActionState, useEffect, useState } from "react";
import { savePayoutDetailsAction, type ActionState } from "@/app/actions/instructor";
import {
  getPayoutCountry,
  normalizePayoutType,
  type PayoutCountry,
} from "@/lib/payout-countries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PaystackBankOption = { name: string; code: string };

type PayoutDetailsFormProps = {
  countries: PayoutCountry[];
  payoutCountry: string | null;
  payoutType: string | null;
  payoutAccountNumber: string | null;
  payoutBankCode: string | null;
};

export function PayoutDetailsForm({
  countries,
  payoutCountry,
  payoutType,
  payoutAccountNumber,
  payoutBankCode,
}: PayoutDetailsFormProps) {
  const [state, action, pending] = useActionState(savePayoutDetailsAction, {} as ActionState);
  const [selectedCountry, setSelectedCountry] = useState(payoutCountry ?? "");
  const country = getPayoutCountry(selectedCountry);
  const initialType = normalizePayoutType(payoutType);
  const [selectedType, setSelectedType] = useState<"mobile_money" | "bank">(
    country && !country.supportsMobileMoney ? "bank" : initialType,
  );
  const [options, setOptions] = useState<PaystackBankOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedCountry) {
      setOptions([]);
      return;
    }

    const countryConfig = getPayoutCountry(selectedCountry);
    if (!countryConfig) return;

    const payoutMethod =
      selectedType === "mobile_money" && countryConfig.supportsMobileMoney ?
        "mobile_money"
      : "bank";

    if (payoutMethod === "bank") {
      setSelectedType("bank");
    }

    let cancelled = false;
    setOptionsLoading(true);
    setOptionsError(null);

    fetch(
      `/api/paystack/payout-options?country=${encodeURIComponent(selectedCountry)}&payoutType=${payoutMethod}`,
    )
      .then(async (response) => {
        const data = (await response.json()) as {
          options?: PaystackBankOption[];
          error?: string;
        };
        if (!response.ok) {
          throw new Error(data.error ?? "Could not load providers");
        }
        if (!cancelled) {
          setOptions(data.options ?? []);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setOptions([]);
          setOptionsError(
            error instanceof Error ? error.message : "Could not load providers",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setOptionsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCountry, selectedType]);

  const showMobileMoney = country?.supportsMobileMoney ?? false;
  const effectiveType =
    showMobileMoney ? selectedType : "bank";

  return (
    <form action={action} className="max-w-md space-y-4 surface-card p-6">
      <div>
        <h2 className="font-bold text-[var(--foreground)]">Payout details</h2>
        <p className="mt-1 text-sm text-[var(--foreground-muted)]">
          Select your country, then add mobile money or bank details for Paystack payouts.
        </p>
      </div>

      {state.error ?
        <p className="text-sm text-red-600">{state.error}</p>
      : null}
      {state.success ?
        <p className="text-sm text-emerald-600">Payout details saved.</p>
      : null}

      <div className="space-y-2">
        <Label htmlFor="payoutCountry">Country</Label>
        <select
          id="payoutCountry"
          name="payoutCountry"
          value={selectedCountry}
          onChange={(event) => {
            const code = event.target.value;
            setSelectedCountry(code);
            const nextCountry = getPayoutCountry(code);
            if (nextCountry && !nextCountry.supportsMobileMoney) {
              setSelectedType("bank");
            }
          }}
          required
          className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-white px-3 py-2 text-sm"
        >
          <option value="" disabled>
            Select country…
          </option>
          {countries.map((option) => (
            <option key={option.code} value={option.code}>
              {option.name}
            </option>
          ))}
        </select>
      </div>

      {selectedCountry ?
        <>
          <div className="space-y-2">
            <Label htmlFor="payoutType">Payout method</Label>
            <select
              id="payoutType"
              name="payoutType"
              value={effectiveType}
              onChange={(event) =>
                setSelectedType(event.target.value as "mobile_money" | "bank")
              }
              className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-white px-3 py-2 text-sm"
            >
              {showMobileMoney ?
                <option value="mobile_money">Mobile money</option>
              : null}
              <option value="bank">Bank account</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payoutAccountNumber">
              {effectiveType === "bank" ? "Account number" : "Mobile money number"}
            </Label>
            <Input
              id="payoutAccountNumber"
              name="payoutAccountNumber"
              defaultValue={payoutAccountNumber ?? ""}
              placeholder={effectiveType === "bank" ? "0123456789" : "0551234567"}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payoutBankCode">
              {effectiveType === "bank" ? "Bank" : "Mobile money provider"}
            </Label>
            <select
              id="payoutBankCode"
              name="payoutBankCode"
              defaultValue={payoutBankCode ?? ""}
              required
              disabled={optionsLoading || options.length === 0}
              key={`${selectedCountry}-${effectiveType}`}
              className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-white px-3 py-2 text-sm disabled:opacity-60"
            >
              <option value="" disabled>
                {optionsLoading ? "Loading…" : "Select…"}
              </option>
              {options.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.name}
                </option>
              ))}
            </select>
            {optionsError ?
              <p className="text-xs text-red-600">{optionsError}</p>
            : null}
          </div>
        </>
      : null}

      <Button type="submit" disabled={pending || !selectedCountry || optionsLoading}>
        {pending ? "Saving…" : "Save payout details"}
      </Button>
    </form>
  );
}
