"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { prepareLessonFormData } from "@/lib/client-lesson-form";
import { MEDIA_LIMITS } from "@/lib/media-limits";
import { Film, FileText, Link2 } from "lucide-react";

export type LessonFormValues = {
  title: string;
  content: string | null;
  videoUrl: string | null;
  orderIndex: number;
  durationMin: number | null;
  pdfStorageKey: string | null;
};

export function LessonForm({
  formId,
  moduleId,
  cloudinaryReady,
  action,
  submitLabel,
  lesson,
  defaultOrderIndex = 0,
  onCancel,
}: {
  formId: string;
  moduleId: string;
  cloudinaryReady: boolean;
  action: (formData: FormData) => void;
  submitLabel: string;
  lesson?: LessonFormValues;
  defaultOrderIndex?: number;
  onCancel?: () => void;
}) {
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const videoMb = Math.round(MEDIA_LIMITS.videoBytes / (1024 * 1024));
  const pdfMb = Math.round(MEDIA_LIMITS.pdfBytes / (1024 * 1024));
  const isEdit = !!lesson;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      await prepareLessonFormData(formData);
      startTransition(() => {
        action(formData);
      });
    } catch (err) {
      setFieldError(err instanceof Error ? err.message : "Upload failed");
    }
  }

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-dashed border-[var(--border)] bg-[var(--background-subtle)] p-4 sm:p-5"
    >
      {fieldError ?
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">{fieldError}</p>
      : null}

      {!cloudinaryReady ?
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Cloudinary is not detected on the server. File uploads will fail until you add
          CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in Vercel (no quotes)
          and redeploy. You can still add written content or paste a video URL.
        </p>
      : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`${formId}-title`}>Lesson title</Label>
          <Input
            id={`${formId}-title`}
            name="title"
            placeholder="e.g. Introduction to pandas"
            required
            defaultValue={lesson?.title ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${formId}-order`}>Order</Label>
          <Input
            id={`${formId}-order`}
            name="orderIndex"
            type="number"
            min={0}
            step={1}
            defaultValue={lesson?.orderIndex ?? defaultOrderIndex}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${formId}-duration`}>Duration (minutes)</Label>
          <Input
            id={`${formId}-duration`}
            name="durationMin"
            type="number"
            min={0}
            step={1}
            placeholder="Optional"
            defaultValue={lesson?.durationMin ?? ""}
          />
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-[var(--border)] bg-white p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
          <Film className="h-4 w-4 text-[var(--primary)]" />
          Video for students
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${formId}-video-url`} className="flex items-center gap-1.5 text-xs">
            <Link2 className="h-3.5 w-3.5" />
            Video URL (YouTube, Vimeo, Cloudinary, or .mp4 link)
          </Label>
          <Input
            id={`${formId}-video-url`}
            name="videoUrl"
            placeholder="https://www.youtube.com/watch?v=..."
            defaultValue={lesson?.videoUrl ?? ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${formId}-video-file`}>
            Or upload video (max {videoMb}MB — uploads go directly to Cloudinary)
          </Label>
          <Input
            id={`${formId}-video-file`}
            name="video"
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/x-m4v,.mp4,.webm,.mov"
            disabled={!cloudinaryReady}
          />
          {isEdit && lesson?.videoUrl ?
            <p className="text-xs text-[var(--foreground-muted)]">
              Current video is set. Upload a new file or change the URL to replace it.
            </p>
          : null}
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-[var(--border)] bg-white p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
          <FileText className="h-4 w-4 text-[var(--primary)]" />
          Reading material
        </div>
        {isEdit && lesson?.pdfStorageKey ?
          <label className="flex items-center gap-2 text-sm text-[var(--foreground-secondary)]">
            <input type="checkbox" name="removePdf" className="rounded border-[var(--border)]" />
            Remove current PDF reading material
          </label>
        : null}
        <div className="space-y-1.5">
          <Label htmlFor={`${formId}-pdf`}>
            {isEdit ? "Replace PDF (optional)" : "PDF (view-only for students)"}
          </Label>
          <Input
            id={`${formId}-pdf`}
            name="pdf"
            type="file"
            accept="application/pdf,.pdf"
            disabled={!cloudinaryReady}
          />
          <p className="text-xs text-[var(--foreground-muted)]">
            Max {pdfMb}MB. Uploads go directly to Cloudinary (not through Vercel).
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${formId}-content`}>Written content</Label>
          <Textarea
            id={`${formId}-content`}
            name="content"
            placeholder="Lesson notes, instructions, or transcript..."
            rows={4}
            defaultValue={lesson?.content ?? ""}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" className="w-full sm:w-auto" disabled={isPending}>
          {isPending ? "Saving…" : submitLabel}
        </Button>
        {onCancel ?
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
        : null}
      </div>
    </form>
  );
}
