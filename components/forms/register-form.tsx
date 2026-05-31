"use client";

import { useActionState, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { registerAction, type ActionState } from "@/app/actions/auth";
import {
  resendRegistrationOtpAction,
  sendRegistrationOtpAction,
  verifyRegistrationOtpAction,
  type RegistrationState,
} from "@/app/actions/registration";
import { EMAIL_VERIFICATION_ENABLED } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SelfieCapture } from "@/components/instructor/selfie-capture";
import { BookOpen } from "lucide-react";

const initial: ActionState = {};
const otpInitial: RegistrationState = {};

function str(value: string | undefined | null): string {
  return value ?? "";
}

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
        <p className="text-sm text-blue-200">Admin-verified instructors · Secure learning</p>
      </div>
      <div className="max-h-[90vh] overflow-y-auto p-6 sm:p-10">{children}</div>
    </div>
  );
}

function ErrorBanner({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="rounded-xl border border-red-200 bg-[var(--danger-bg)] px-4 py-3 text-sm font-medium text-red-800">
      {error}
    </p>
  );
}

function FieldErrors({ fieldErrors }: { fieldErrors?: Record<string, string[]> }) {
  if (!fieldErrors) return null;
  return (
    <div className="rounded-xl border border-red-200 bg-[var(--danger-bg)] px-4 py-3 text-sm text-red-800">
      {Object.entries(fieldErrors).map(([key, msgs]) =>
        msgs?.map((m) => <p key={`${key}-${m}`}>{m}</p>),
      )}
    </div>
  );
}

function RegisterFormDirect() {
  const [state, action, pending] = useActionState(registerAction, initial);
  const searchParams = useSearchParams();
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
        <ErrorBanner error={state?.error} />
        <FieldErrors fieldErrors={state?.fieldErrors} />

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
          <InstructorFields selfieUrl={selfieUrl} onSelfie={setSelfieUrl} />
        : null}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={pending || (isInstructor && !selfieUrl)}
        >
          {pending ?
            "Creating account..."
          : isInstructor ?
            "Submit application"
          : "Create account"}
        </Button>
      </form>

      <SignInLink />
    </AuthShell>
  );
}

function InstructorFields({
  selfieUrl,
  onSelfie,
}: {
  selfieUrl: string;
  onSelfie: (url: string) => void;
}) {
  return (
    <div className="space-y-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] p-4">
      <p className="text-sm font-semibold text-[var(--foreground)]">Instructor application (required)</p>
      <p className="text-xs text-[var(--foreground-muted)]">
        You cannot create or publish courses until an admin approves this application.
      </p>
      <div className="space-y-2">
        <Label htmlFor="expertise">Area of expertise</Label>
        <Input id="expertise" name="expertise" required placeholder="e.g. Web Development" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="qualification">Highest qualification</Label>
        <Input id="qualification" name="qualification" required placeholder="e.g. BSc Computer Science" />
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
      <SelfieCapture onCaptured={(url) => onSelfie(str(url))} />
      <input type="hidden" name="selfieUrl" value={str(selfieUrl)} readOnly />
    </div>
  );
}

function RegisterFormWithOtp() {
  const searchParams = useSearchParams();
  const [sendState, sendAction, sendPending] = useActionState(sendRegistrationOtpAction, otpInitial);
  const [verifyState, verifyAction, verifyPending] = useActionState(
    verifyRegistrationOtpAction,
    otpInitial,
  );
  const [resendState, resendAction, resendPending] = useActionState(
    resendRegistrationOtpAction,
    otpInitial,
  );

  const [role, setRole] = useState<"STUDENT" | "INSTRUCTOR">("STUDENT");
  const [selfieUrl, setSelfieUrl] = useState("");
  const [password, setPassword] = useState("");

  const activeState = sendState.step === "verify" || verifyState.step === "verify" ? verifyState : sendState;
  const isVerifyStep = sendState.step === "verify" || verifyState.step === "verify";
  const verifyEmail = verifyState.email ?? sendState.email ?? "";

  useEffect(() => {
    const param = searchParams.get("role")?.toLowerCase();
    if (param === "instructor") setRole("INSTRUCTOR");
    else if (param === "student") setRole("STUDENT");
  }, [searchParams]);

  const isInstructor = role === "INSTRUCTOR";

  if (isVerifyStep && verifyEmail) {
    return (
      <AuthShell
        title="Verify your email"
        subtitle="Enter the 6-digit code we sent to your inbox to finish registration."
      >
        <CardHeader className="px-0 pt-0 lg:hidden">
          <CardTitle className="text-2xl">Verify email</CardTitle>
          <CardDescription>Check your inbox for the code from Bravio</CardDescription>
        </CardHeader>

        {(resendState.message || activeState.message) ?
          <p className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            {resendState.message ?? activeState.message}
          </p>
        : null}

        <form action={verifyAction} className="space-y-5">
          <ErrorBanner error={verifyState.error} />
          <FieldErrors fieldErrors={verifyState.fieldErrors} />

          <input type="hidden" name="email" value={verifyEmail} readOnly />
          <input type="hidden" name="password" value={password} readOnly />

          <div className="space-y-2">
            <Label htmlFor="code">Verification code</Label>
            <Input
              id="code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              minLength={6}
              maxLength={6}
              placeholder="123456"
              className="text-center text-lg tracking-[0.35em]"
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={verifyPending}>
            {verifyPending ? "Verifying..." : "Verify and create account"}
          </Button>
        </form>

        <form action={resendAction} className="mt-4">
          <input type="hidden" name="email" value={verifyEmail} readOnly />
          <Button type="submit" variant="outline" className="w-full" disabled={resendPending}>
            {resendPending ? "Sending..." : "Resend code"}
          </Button>
          {resendState.error ?
            <p className="mt-2 text-center text-sm text-red-700">{resendState.error}</p>
          : null}
        </form>

        <SignInLink />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={isInstructor ? "Apply to teach" : "Start learning"}
      subtitle={
        isInstructor ?
          "We will email you a verification code before your instructor application is submitted."
        : "We will email you a verification code to confirm your address."
      }
    >
      <CardHeader className="px-0 pt-0 lg:hidden">
        <CardTitle className="text-2xl">Create account</CardTitle>
        <CardDescription>
          {isInstructor ? "Instructor application" : "Student registration"}
        </CardDescription>
      </CardHeader>

      <form action={sendAction} className="space-y-5">
        <ErrorBanner error={sendState.error} />
        <FieldErrors fieldErrors={sendState.fieldErrors} />

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
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
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
          <InstructorFields selfieUrl={selfieUrl} onSelfie={setSelfieUrl} />
        : null}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={sendPending || (isInstructor && !selfieUrl)}
        >
          {sendPending ?
            "Sending code..."
          : isInstructor ?
            "Send code & continue"
          : "Send verification code"}
        </Button>
      </form>

      <SignInLink />
    </AuthShell>
  );
}

function SignInLink() {
  return (
    <p className="mt-6 text-center text-sm text-[var(--foreground-muted)]">
      Already have an account?{" "}
      <Link href="/login" className="font-semibold text-[var(--primary)] hover:underline">
        Sign in
      </Link>
    </p>
  );
}

export function RegisterForm() {
  if (EMAIL_VERIFICATION_ENABLED) {
    return <RegisterFormWithOtp />;
  }
  return <RegisterFormDirect />;
}
