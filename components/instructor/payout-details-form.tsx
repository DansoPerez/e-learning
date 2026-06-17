"use client";

import { useActionState, useState } from "react";
import { savePayoutDetailsAction, type ActionState } from "@/app/actions/instructor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PayoutDetailsFormProps = {
  payoutType: string | null;
  payoutAccountNumber: string | null;
  payoutBankCode: string | null;
  mobileProviders: { name: string; code: string }[];
  banks: { name: string; code: string }[];
};

export function PayoutDetailsForm({
  payoutType,
  payoutAccountNumber,
  payoutBankCode,
  mobileProviders,
  banks,
}: PayoutDetailsFormProps) {
  const [state, action, pending] = useActionState(savePayoutDetailsAction, {} as ActionState);
  const [selectedType, setSelectedType] = useState(payoutType ?? "mobile_money");
  const options = selectedType === "ghipss" ? banks : mobileProviders;

  return (
    <form action={action} className="max-w-md space-y-4 surface-card p-6">
      <div>
        <h2 className="font-bold text-[var(--foreground)]">Payout details</h2>
        <p className="mt-1 text-sm text-[var(--foreground-muted)]">
          Required for Paystack withdrawals — mobile money or bank account in Ghana.
        </p>
      </div>

      {state.error ?
        <p className="text-sm text-red-600">{state.error}</p>
      : null}
      {state.success ?
        <p className="text-sm text-emerald-600">Payout details saved.</p>
      : null}

      <div className="space-y-2">
        <Label htmlFor="payoutType">Payout method</Label>
        <select
          id="payoutType"
          name="payoutType"
          value={selectedType}
          onChange={(event) => setSelectedType(event.target.value)}
          className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-white px-3 py-2 text-sm"
        >
          <option value="mobile_money">Mobile money</option>
          <option value="ghipss">Bank account</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="payoutAccountNumber">
          {selectedType === "ghipss" ? "Account number" : "Mobile money number"}
        </Label>
        <Input
          id="payoutAccountNumber"
          name="payoutAccountNumber"
          defaultValue={payoutAccountNumber ?? ""}
          placeholder={selectedType === "ghipss" ? "0123456789" : "0551234567"}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="payoutBankCode">
          {selectedType === "ghipss" ? "Bank" : "Mobile money provider"}
        </Label>
        <select
          id="payoutBankCode"
          name="payoutBankCode"
          defaultValue={payoutBankCode ?? ""}
          required
          key={selectedType}
          className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-white px-3 py-2 text-sm"
        >
          <option value="" disabled>
            Select…
          </option>
          {options.map((option) => (
            <option key={option.code} value={option.code}>
              {option.name}
            </option>
          ))}
        </select>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save payout details"}
      </Button>
    </form>
  );
}
