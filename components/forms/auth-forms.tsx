"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type ActionState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

const initial: ActionState = {};

function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mx-auto grid w-full max-w-4xl overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-white shadow-[var(--shadow-lg)] lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[var(--primary)] via-indigo-600 to-violet-700 p-10 text-white lg:flex">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMzBoMzBWMHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0uMDUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-40" />
        <div className="relative">
          <div className="flex items-center gap-2 text-xl font-bold">
            <BookOpen className="h-7 w-7" />
            Bravio
          </div>
          <p className="mt-8 text-2xl font-bold leading-snug">{title}</p>
          <p className="mt-3 text-indigo-100">{subtitle}</p>
        </div>
        <p className="relative text-sm text-indigo-200/90">Structured courses · Expert instructors</p>
      </div>
      <div className="p-6 sm:p-10">{children}</div>
    </div>
  );
}

const SESSION_ERRORS: Record<string, string> = {
  stale_session:
    "Your session was from the old database. Sign in again with your Bravio account (e.g. admin@bravio.app after seeding).",
  suspended: "Your account is suspended. Contact support.",
  banned: "Your account has been banned.",
};

export function LoginForm({
  sessionError,
  registered,
  reset,
  googleAuthEnabled,
}: {
  sessionError?: string;
  registered?: boolean;
  reset?: boolean;
  googleAuthEnabled?: boolean;
}) {
  const [state, action, pending] = useActionState(loginAction, initial);
  const bannerError =
    state?.error ?? (sessionError ? SESSION_ERRORS[sessionError] : undefined);

  return (
    <AuthShell title="Welcome back" subtitle="Pick up where you left off and keep learning.">
      <CardHeader className="px-0 pt-0 lg:hidden">
        <CardTitle className="text-2xl">Sign in</CardTitle>
        <CardDescription>Access your Bravio account</CardDescription>
      </CardHeader>
      <form action={action} className="space-y-5">
        {registered ?
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
            Account created. Sign in to continue.
          </p>
        : null}
        {reset ?
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
            Password updated. Sign in with your new password.
          </p>
        : null}
        {bannerError ?
          <p className="rounded-xl border border-red-200 bg-[var(--danger-bg)] px-4 py-3 text-sm font-medium text-red-800">
            {bannerError}
          </p>
        : null}
        <div className="space-y-2">
          <Label htmlFor="identifier">User ID or email</Label>
          <Input
            id="identifier"
            name="identifier"
            type="text"
            required
            placeholder="S1001DS or you@example.com"
            autoComplete="username"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-[var(--primary)] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input id="password" name="password" type="password" required />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending ? "Signing in..." : "Sign in"}
        </Button>
        <div className="relative py-2">
          <span className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[var(--border)]" />
          </span>
          <span className="relative flex justify-center text-xs uppercase text-[var(--foreground-muted)]">
            or
          </span>
        </div>
        <GoogleSignInButton enabled={googleAuthEnabled} />
      </form>
      <p className="mt-6 text-center text-sm text-[var(--foreground-muted)]">
        No account?{" "}
        <Link href="/register" className="font-semibold text-[var(--primary)] hover:underline">
          Create one free
        </Link>
      </p>
    </AuthShell>
  );
}

