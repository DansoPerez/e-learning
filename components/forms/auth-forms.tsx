"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type ActionState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

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
    <div className="mx-auto grid w-full max-w-4xl overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-white shadow-[var(--shadow-lg)] lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-[var(--primary)] p-10 text-white lg:flex">
        <div>
          <div className="flex items-center gap-2 text-xl font-bold">
            <BookOpen className="h-7 w-7" />
            Bravio
          </div>
          <p className="mt-8 text-2xl font-bold leading-snug">{title}</p>
          <p className="mt-3 text-blue-100">{subtitle}</p>
        </div>
        <p className="text-sm text-blue-200">Structured courses · Expert instructors</p>
      </div>
      <div className="p-6 sm:p-10">{children}</div>
    </div>
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initial);

  return (
    <AuthShell title="Welcome back" subtitle="Pick up where you left off and keep learning.">
      <CardHeader className="px-0 pt-0 lg:hidden">
        <CardTitle className="text-2xl">Sign in</CardTitle>
        <CardDescription>Access your Bravio account</CardDescription>
      </CardHeader>
      <form action={action} className="space-y-5">
        {state?.error ?
          <p className="rounded-xl border border-red-200 bg-[var(--danger-bg)] px-4 py-3 text-sm font-medium text-red-800">
            {state.error}
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
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending ? "Signing in..." : "Sign in"}
        </Button>
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

