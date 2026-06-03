"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  requestPasswordResetAction,
  type PasswordResetState,
} from "@/app/actions/password-reset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const initial: PasswordResetState = {};

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, initial);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-[var(--radius)] border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-lg)]">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-2xl">Forgot password</CardTitle>
          <CardDescription>
            Enter your email. If an account exists and email is configured, you will receive a reset
            link.
          </CardDescription>
        </CardHeader>
        <form action={action} className="mt-6 space-y-4">
          {state.error ?
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</p>
          : null}
          {state.success ?
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              If an account exists for that email, we sent reset instructions. Check your inbox and
              spam folder. If email is not configured on this server, ask an admin to reset your
              password.
            </p>
          : null}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Sending…" : "Send reset link"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-[var(--foreground-muted)]">
          <Link href="/login" className="font-semibold text-[var(--primary)] hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
