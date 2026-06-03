"use client";

import { useActionState } from "react";
import { createCourseAnnouncementAction } from "@/app/actions/announcements";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function CourseAnnouncementForm({ courseId }: { courseId: string }) {
  const [state, action, pending] = useActionState(
    createCourseAnnouncementAction.bind(null, courseId),
    {},
  );

  return (
    <form action={action} className="space-y-3">
      <Label htmlFor="announcement-message">Message enrolled students</Label>
      <Textarea
        id="announcement-message"
        name="message"
        rows={3}
        placeholder="e.g. New module added, quiz deadline reminder..."
        required
      />
      {state.error ?
        <p className="text-sm text-red-600">{state.error}</p>
      : null}
      {state.success ?
        <p className="text-sm text-emerald-700">Announcement published.</p>
      : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Publishing…" : "Publish course announcement"}
      </Button>
    </form>
  );
}
