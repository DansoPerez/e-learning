"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, registerAction, type ActionState } from "@/app/actions/auth";
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
    <div className="mx-auto grid w-full max-w-4xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-lg)] lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-800 p-10 text-white lg:flex">
        <div>
          <div className="flex items-center gap-2 text-xl font-bold">
            <BookOpen className="h-7 w-7" />
            Bravio
          </div>
          <p className="mt-8 text-2xl font-bold leading-snug">{title}</p>
          <p className="mt-3 text-indigo-100">{subtitle}</p>
        </div>
        <p className="text-sm text-indigo-200">Structured courses · Fair payouts · Admin control</p>
      </div>
      <div className="p-8 sm:p-10">{children}</div>
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
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required placeholder="you@example.com" />
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

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initial);

  return (
    <AuthShell title="Start your journey" subtitle="Join as a student or apply to teach on Bravio.">
      <CardHeader className="px-0 pt-0 lg:hidden">
        <CardTitle className="text-2xl">Create account</CardTitle>
        <CardDescription>Join Bravio in seconds</CardDescription>
      </CardHeader>
      <form action={action} className="space-y-5">
        {state?.error ?
          <p className="rounded-xl border border-red-200 bg-[var(--danger-bg)] px-4 py-3 text-sm font-medium text-red-800">
            {state.error}
          </p>
        : null}
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" required placeholder="Your name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required placeholder="you@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">I want to</Label>
          <select id="role" name="role" className="input-field" defaultValue="STUDENT">
            <option value="STUDENT">Learn as a student</option>
            <option value="INSTRUCTOR">Teach as an instructor</option>
          </select>
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending ? "Creating..." : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--foreground-muted)]">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[var(--primary)] hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
