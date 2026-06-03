"use client";

import { useActionState } from "react";
import { updateInstructorProfileAction } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function InstructorProfileEditForm({
  userId,
  profile,
}: {
  userId: string;
  profile: {
    bio: string;
    expertise: string;
    qualification: string;
    experienceYears: number;
  };
}) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string }, formData: FormData) =>
      updateInstructorProfileAction(userId, formData),
    {},
  );

  return (
    <form action={action} className="mt-4 space-y-3 border-t border-[var(--border)] pt-4">
      <p className="text-sm font-semibold text-[var(--foreground-secondary)]">
        Edit instructor profile (admin)
      </p>
      {state.error ?
        <p className="text-sm text-red-600">{state.error}</p>
      : null}
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" defaultValue={profile.bio} rows={3} required />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="expertise">Expertise</Label>
          <Input id="expertise" name="expertise" defaultValue={profile.expertise} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="qualification">Qualification</Label>
          <Input
            id="qualification"
            name="qualification"
            defaultValue={profile.qualification}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="experienceYears">Years of experience</Label>
        <Input
          id="experienceYears"
          name="experienceYears"
          type="number"
          min={0}
          defaultValue={profile.experienceYears}
          required
          className="max-w-[120px]"
        />
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
