"use client";

import { useActionState } from "react";
import { requestWithdrawalAction } from "@/app/actions/instructor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function WithdrawalForm() {
  const [state, action, pending] = useActionState(requestWithdrawalAction, {});

  return (
    <>
      <form action={action} className="max-w-md space-y-4 surface-card p-6">
        {state.error ?
          <p className="text-sm text-red-600">{state.error}</p>
        : null}
        {state.success ?
          <p className="text-sm text-emerald-600">Withdrawal request submitted.</p>
        : null}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (GHS)</Label>
          <Input id="amount" name="amount" type="number" min={1} step="0.01" required />
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
        Admin will process payouts externally and mark requests as completed.
      </p>
    </>
  );
}
