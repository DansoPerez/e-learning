"use client";

import { useActionState, useState } from "react";
import { applyInstructorAction } from "@/app/actions/instructor";
import { getInstructorNavItems } from "@/lib/instructor-nav";
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SelfieCapture } from "@/components/instructor/selfie-capture";

export default function InstructorApplyPage() {
  const [state, action, pending] = useActionState(applyInstructorAction, {});
  const [selfieUrl, setSelfieUrl] = useState("");

  return (
    <DashboardWrapper
      role="INSTRUCTOR"
      title="Instructor application"
      navItems={getInstructorNavItems("PENDING", false)}
    >
      <form action={action} className="max-w-xl space-y-4 surface-card p-6">
        {state.error ?
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</p>
        : null}

        <p className="text-sm text-[var(--foreground-muted)]">
          All fields and a live selfie are required. An admin must approve your application before
          you can create or publish courses.
        </p>

        <div className="space-y-2">
          <Label htmlFor="expertise">Area of expertise</Label>
          <Input id="expertise" name="expertise" required placeholder="e.g. Web Development" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="qualification">Highest qualification</Label>
          <Input id="qualification" name="qualification" required />
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

        <Button type="submit" disabled={pending || !selfieUrl} className="w-full">
          {pending ? "Submitting..." : "Submit application"}
        </Button>
      </form>
    </DashboardWrapper>
  );
}
