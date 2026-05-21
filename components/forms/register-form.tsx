"use client";

import { useActionState, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { registerAction, type ActionState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SelfieCapture } from "@/components/instructor/selfie-capture";
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
        <p className="text-sm text-indigo-200">Admin-verified instructors · Secure learning</p>
      </div>
      <div className="max-h-[90vh] overflow-y-auto p-8 sm:p-10">{children}</div>
    </div>
  );
}

export function RegisterForm() {
  const searchParams = useSearchParams();
  const [state, action, pending] = useActionState(registerAction, initial);
  const [role, setRole] = useState<"STUDENT" | "INSTRUCTOR">("STUDENT");
  const [selfieUrl, setSelfieUrl] = useState("");

  useEffect(() => {
    const param = searchParams.get("role")?.toLowerCase();
    if (param === "instructor") setRole("INSTRUCTOR");
    else if (param === "student") setRole("STUDENT");
  }, [searchParams]);

  const isInstructor = role === "INSTRUCTOR";

  return (
    <AuthShell
      title={isInstructor ? "Apply to teach" : "Start learning"}
      subtitle={
        isInstructor ?
          "Complete your application and live selfie. An admin must approve you before you can publish courses."
        : "Create your student account and explore courses."
      }
    >
      <CardHeader className="px-0 pt-0 lg:hidden">
        <CardTitle className="text-2xl">Create account</CardTitle>
        <CardDescription>
          {isInstructor ? "Instructor application" : "Student registration"}
        </CardDescription>
      </CardHeader>

      <form action={action} className="space-y-5">
        {state?.error ?
          <p className="rounded-xl border border-red-200 bg-[var(--danger-bg)] px-4 py-3 text-sm font-medium text-red-800">
            {state.error}
          </p>
        : null}
        {state?.fieldErrors ?
          <div className="rounded-xl border border-red-200 bg-[var(--danger-bg)] px-4 py-3 text-sm text-red-800">
            {Object.entries(state.fieldErrors).map(([key, msgs]) =>
              msgs?.map((m) => <p key={`${key}-${m}`}>{m}</p>),
            )}
          </div>
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
          <Input id="password" name="password" type="password" required minLength={8} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">I want to</Label>
          <select
            id="role"
            name="role"
            className="input-field"
            value={role}
            onChange={(e) => {
              setRole(e.target.value as "STUDENT" | "INSTRUCTOR");
              setSelfieUrl("");
            }}
          >
            <option value="STUDENT">Learn as a student</option>
            <option value="INSTRUCTOR">Teach as an instructor (requires approval)</option>
          </select>
        </div>

        {isInstructor ?
          <div className="space-y-4 rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
            <p className="text-sm font-semibold text-indigo-900">Instructor application (required)</p>
            <p className="text-xs text-indigo-800">
              You cannot create or publish courses until an admin approves this application.
            </p>
            <div className="space-y-2">
              <Label htmlFor="expertise">Area of expertise</Label>
              <Input id="expertise" name="expertise" required placeholder="e.g. Web Development" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qualification">Highest qualification</Label>
              <Input
                id="qualification"
                name="qualification"
                required
                placeholder="e.g. BSc Computer Science"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experienceYears">Years of teaching experience</Label>
              <Input
                id="experienceYears"
                name="experienceYears"
                type="number"
                min={0}
                max={50}
                required
                defaultValue={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Professional bio</Label>
              <Textarea
                id="bio"
                name="bio"
                required
                rows={4}
                minLength={50}
                placeholder="Describe your teaching background (minimum 50 characters)..."
              />
            </div>
            <SelfieCapture onCaptured={setSelfieUrl} />
            <input type="hidden" name="selfieUrl" value={selfieUrl} />
          </div>
        : null}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={pending || (isInstructor && !selfieUrl)}
        >
          {pending ?
            "Submitting..."
          : isInstructor ?
            "Submit application"
          : "Create account"}
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
