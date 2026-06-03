"use client";

import { useActionState } from "react";
import { adminSetUserPasswordAction } from "@/app/actions/password-reset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminSetPasswordForm({ userId }: { userId: string }) {
  const [state, action, pending] = useActionState(
    adminSetUserPasswordAction.bind(null, userId),
    {},
  );

  return (
    <form action={action} className="space-y-3">
      {state.error ?
        <p className="text-sm text-red-600">{state.error}</p>
      : null}
      {state.success ?
        <p className="text-sm text-emerald-700">Password updated.</p>
      : null}
      <div className="space-y-2">
        <Label htmlFor="new-password">New password</Label>
        <Input id="new-password" name="password" type="password" required minLength={8} />
      </div>
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? "Saving…" : "Set password"}
      </Button>
    </form>
  );
}
