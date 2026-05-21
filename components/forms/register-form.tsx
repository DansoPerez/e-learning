"use client";

import { useActionState, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  sendRegistrationOtpAction,
  verifyRegistrationOtpAction,
  resendRegistrationOtpAction,
  type RegistrationState,
} from "@/app/actions/registration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SelfieCapture } from "@/components/instructor/selfie-capture";
import { BookOpen } from "lucide-react";

const initial: RegistrationState = {};

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

function StatusMessage({ state }: { state: RegistrationState }) {
  if (!state.error && !state.message && !state.fieldErrors) return null;
  return (
    <>
      {state.error ?
        <p className="rounded-xl border border-red-200 bg-[var(--danger-bg)] px-4 py-3 text-sm font-medium text-red-800">
          {state.error}
        </p>
      : null}
      {state.message ?
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
          {state.message}
        </p>
      : null}
      {state.fieldErrors ?
        <div className="rounded-xl border border-red-200 bg-[var(--danger-bg)] px-4 py-3 text-sm text-red-800">
          {Object.entries(state.fieldErrors).map(([key, msgs]) =>
            msgs?.map((m) => <p key={`${key}-${m}`}>{m}</p>),
          )}
        </div>
      : null}
    </>
  );
}

export function RegisterForm() {
  const searchParams = useSearchParams();
  const [sendState, sendAction, sendPending] = useActionState(sendRegistrationOtpAction, initial);
  const [verifyState, verifyAction, verifyPending] = useActionState(
    verifyRegistrationOtpAction,
    initial,
  );
  const [resendState, resendAction, resendPending] = useActionState(
    resendRegistrationOtpAction,
    initial,
  );

  const [role, setRole] = useState<"STUDENT" | "INSTRUCTOR">("STUDENT");
  const [selfieUrl, setSelfieUrl] = useState("");
  const [step, setStep] = useState<"details" | "verify">("details");
  const [pendingEmail, setPendingEmail] = useState("");
  const [savedPassword, setSavedPassword] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [expertise, setExpertise] = useState("");
  const [qualification, setQualification] = useState("");
  const [experienceYears, setExperienceYears] = useState("0");
  const [bio, setBio] = useState("");

  useEffect(() => {
    const param = searchParams.get("role")?.toLowerCase();
    if (param === "instructor") setRole("INSTRUCTOR");
    else if (param === "student") setRole("STUDENT");
  }, [searchParams]);

  useEffect(() => {
    if (sendState.step === "verify" && sendState.email) {
      setStep("verify");
      setPendingEmail(sendState.email);
    }
  }, [sendState]);

  useEffect(() => {
    if (resendState.step === "verify" && resendState.email) {
      setPendingEmail(resendState.email);
    }
  }, [resendState]);

  const isInstructor = role === "INSTRUCTOR";
  const state = step === "verify" ? { ...sendState, ...verifyState, ...resendState } : sendState;

  if (step === "verify") {
    return (
      <AuthShell
        title="Verify your email"
        subtitle="Enter the 6-digit code we sent to your inbox to activate your account."
      >
        <CardHeader className="px-0 pt-0 lg:hidden">
          <CardTitle className="text-2xl">Email verification</CardTitle>
          <CardDescription>Code sent to {pendingEmail}</CardDescription>
        </CardHeader>

        <form action={verifyAction} className="space-y-5">
          <StatusMessage state={state} />
          <input type="hidden" name="email" value={pendingEmail} />
          <input type="hidden" name="password" value={savedPassword} />

          <div className="space-y-2">
            <Label htmlFor="code">Verification code</Label>
            <Input
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={6}
              pattern="\d{6}"
              placeholder="000000"
              className="text-center text-2xl tracking-[0.4em]"
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={verifyPending}>
            {verifyPending ? "Verifying..." : "Verify and create account"}
          </Button>
        </form>

        <form action={resendAction} className="mt-3">
          <input type="hidden" name="email" value={pendingEmail} />
          <Button
            type="submit"
            variant="outline"
            className="w-full"
            disabled={resendPending}
          >
            {resendPending ? "Sending..." : "Resend code"}
          </Button>
        </form>

        <Button
          type="button"
          variant="ghost"
          className="mt-3 w-full"
          onClick={() => setStep("details")}
        >
          Back to registration
        </Button>
      </AuthShell>
    );
  }

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

      <form
        action={sendAction}
        className="space-y-5"
        onSubmit={() => setSavedPassword(password)}
      >
        <StatusMessage state={sendState} />

        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            name="name"
            required
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
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
          <div className="space-y-4 rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
            <p className="text-sm font-semibold text-indigo-900">Instructor application (required)</p>
            <p className="text-xs text-indigo-800">
              You cannot create or publish courses until an admin approves this application.
            </p>
            <div className="space-y-2">
              <Label htmlFor="expertise">Area of expertise</Label>
              <Input
                id="expertise"
                name="expertise"
                required
                placeholder="e.g. Web Development"
                value={expertise}
                onChange={(e) => setExpertise(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qualification">Highest qualification</Label>
              <Input
                id="qualification"
                name="qualification"
                required
                placeholder="e.g. BSc Computer Science"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
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
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
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
                value={bio}
                onChange={(e) => setBio(e.target.value)}
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
          disabled={sendPending || (isInstructor && !selfieUrl)}
        >
          {sendPending ?
            "Sending code..."
          : "Send verification code"}
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
