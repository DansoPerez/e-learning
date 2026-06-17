"use client";

import { useActionState } from "react";
import { requestWithdrawalAction } from "@/app/actions/instructor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";

type WithdrawalFormProps = {
  balance: number;
  availableBalance: number;
  paystackPayouts?: boolean;
};

export function WithdrawalForm({
  balance,
  availableBalance,
  paystackPayouts = false,
}: WithdrawalFormProps) {
  const [state, action, pending] = useActionState(requestWithdrawalAction, {});
  const reserved = Math.max(0, balance - availableBalance);

  return (
    <>
      <div className="mb-4 max-w-md rounded-lg border border-[var(--border)] bg-[var(--background-subtle)] px-4 py-3 text-sm">
        <p>
          Total balance: <strong>{formatCurrency(balance)}</strong>
        </p>
        {reserved > 0 ?
          <p className="mt-1 text-[var(--foreground-muted)]">
            Pending withdrawals: {formatCurrency(reserved)} · Available:{" "}
            <strong>{formatCurrency(availableBalance)}</strong>
          </p>
        : <p className="mt-1 text-[var(--foreground-muted)]">
            Available to withdraw: <strong>{formatCurrency(availableBalance)}</strong>
          </p>
        }
      </div>
      <form action={action} className="max-w-md space-y-4 surface-card p-6">
        {state.error ?
          <p className="text-sm text-red-600">{state.error}</p>
        : null}
        {state.success ?
          <p className="text-sm text-emerald-600">Withdrawal request submitted.</p>
        : null}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (GHS)</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            min={1}
            max={availableBalance > 0 ? availableBalance : undefined}
            step="0.01"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="note">Note (optional)</Label>
          <Input id="note" name="note" />
        </div>
        <Button type="submit" disabled={pending}>
          Request withdrawal
        </Button>
      </form>
      <p className="mt-4 text-sm text-[var(--foreground-muted)]">
        {paystackPayouts ?
          "Your balance is deducted after an admin approves the request and pays you via Paystack (or marks it paid manually)."
        : "Your balance is deducted only after an admin approves the request and marks it as paid."}
      </p>
    </>
  );
}
