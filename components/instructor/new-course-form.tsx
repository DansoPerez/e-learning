"use client";

import { useActionState, useState, useTransition } from "react";
import { createCourseAction } from "@/app/actions/courses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CourseThumbnailField } from "@/components/instructor/course-thumbnail-field";
import { prepareCourseThumbnailFormData } from "@/lib/client-cloudinary-upload";

export function NewCourseForm({ cloudinaryReady }: { cloudinaryReady: boolean }) {
  const [state, action, pending] = useActionState(createCourseAction, {});
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, startUploadTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploadError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      await prepareCourseThumbnailFormData(formData, cloudinaryReady);
      startUploadTransition(() => {
        action(formData);
      });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Image upload failed");
    }
  }

  const saving = pending || isUploading;

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4 surface-card p-6">
      {state.error ?
        <p className="text-sm text-red-600">{state.error}</p>
      : null}
      {uploadError ?
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">{uploadError}</p>
      : null}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" required rows={5} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="price">Price (GHS, 0 = free)</Label>
        <Input id="price" name="price" type="number" min={0} step="0.01" defaultValue={0} />
      </div>
      <CourseThumbnailField idPrefix="new" cloudinaryReady={cloudinaryReady} />
      <Button type="submit" disabled={saving}>
        {saving ? "Creating..." : "Create course"}
      </Button>
    </form>
  );
}
