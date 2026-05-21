"use client";

import { useActionState } from "react";
import {
  createAdminAccountAction,
  type CreateAdminResult,
} from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateAdminForm() {
  const [result, action, pending] = useActionState(createAdminAccountAction, null);

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5">
      <h3 className="font-bold text-[var(--foreground)]">Create admin account</h3>
      <p className="mt-1 text-sm text-[var(--foreground-muted)]">
        Super admin only. Generates user ID, email login, and a one-time password.
      </p>
      <form action={action} className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="admin-name">Full name</Label>
          <Input id="admin-name" name="name" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="admin-email">Email</Label>
          <Input id="admin-email" name="email" type="email" required />
        </div>
        <Button type="submit" disabled={pending} className="sm:col-span-2">
          {pending ? "Creating..." : "Generate admin credentials"}
        </Button>
      </form>
      {result?.error ?
        <p className="mt-3 text-sm text-red-700">{result.error}</p>
      : null}
      {result?.userCode && result.password ?
        <div className="mt-4 rounded-xl border border-emerald-200 bg-white p-4 text-sm">
          <p>
            <strong>User ID:</strong> {result.userCode}
          </p>
          <p>
            <strong>Email:</strong> {result.email}
          </p>
          <p>
            <strong>Password:</strong>{" "}
            <code className="rounded bg-zinc-100 px-1">{result.password}</code>
          </p>
          <p className="mt-2 text-xs text-[var(--foreground-muted)]">
            Share securely. Sensitive actions require super admin unless permissions are
            restored.
          </p>
        </div>
      : null}
    </div>
  );
}
