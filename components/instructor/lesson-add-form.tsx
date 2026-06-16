"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadLessonFileToCloudinary } from "@/lib/client-cloudinary-upload";
import { MEDIA_LIMITS } from "@/lib/media-limits";
import { Film, FileText, Link2 } from "lucide-react";

export function LessonAddForm({
  moduleId,
  lessonCount,
  cloudinaryReady,
  action,
}: {
  moduleId: string;
  lessonCount: number;
  cloudinaryReady: boolean;
  action: (formData: FormData) => void;
}) {
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const videoMb = Math.round(MEDIA_LIMITS.videoBytes / (1024 * 1024));
  const pdfMb = Math.round(MEDIA_LIMITS.pdfBytes / (1024 * 1024));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const videoFile = formData.get("video");
      if (videoFile instanceof File && videoFile.size > 0) {
        const { videoUrl } = await uploadLessonFileToCloudinary(videoFile, "video");
        if (videoUrl) formData.set("videoUrl", videoUrl);
        formData.delete("video");
      }

      const pdfFile = formData.get("pdf");
      if (pdfFile instanceof File && pdfFile.size > 0) {
        const { pdfStorageKey } = await uploadLessonFileToCloudinary(pdfFile, "pdf");
        if (pdfStorageKey) formData.set("uploadedPdfStorageKey", pdfStorageKey);
        formData.delete("pdf");
      }

      startTransition(() => {
        action(formData);
      });
    } catch (err) {
      setFieldError(err instanceof Error ? err.message : "Upload failed");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 space-y-4 rounded-lg border border-dashed border-[var(--border)] bg-[var(--background-subtle)] p-4 sm:p-5"
    >
      <p className="text-sm font-semibold text-[var(--foreground)]">Add lesson</p>

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
          <Label htmlFor={`lesson-title-${moduleId}`}>Lesson title</Label>
          <Input
            id={`lesson-title-${moduleId}`}
            name="title"
            placeholder="e.g. Introduction to pandas"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`lesson-order-${moduleId}`}>Order</Label>
          <Input
            id={`lesson-order-${moduleId}`}
            name="orderIndex"
            type="number"
            min={0}
            step={1}
            defaultValue={lessonCount}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`lesson-duration-${moduleId}`}>Duration (minutes)</Label>
          <Input
            id={`lesson-duration-${moduleId}`}
            name="durationMin"
            type="number"
            min={0}
            step={1}
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-[var(--border)] bg-white p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
          <Film className="h-4 w-4 text-[var(--primary)]" />
          Video for students
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`lesson-video-url-${moduleId}`} className="flex items-center gap-1.5 text-xs">
            <Link2 className="h-3.5 w-3.5" />
            Video URL (YouTube, Vimeo, Cloudinary, or .mp4 link)
          </Label>
          <Input
            id={`lesson-video-url-${moduleId}`}
            name="videoUrl"
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`lesson-video-file-${moduleId}`}>
            Or upload video (max {videoMb}MB — uploads go directly to Cloudinary)
          </Label>
          <Input
            id={`lesson-video-file-${moduleId}`}
            name="video"
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/x-m4v,.mp4,.webm,.mov"
            disabled={!cloudinaryReady}
          />
          <p className="text-xs text-[var(--foreground-muted)]">
            Requires Cloudinary env vars on Vercel. Upload overrides the URL field above.
          </p>
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-[var(--border)] bg-white p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
          <FileText className="h-4 w-4 text-[var(--primary)]" />
          Reading material
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`lesson-pdf-${moduleId}`}>PDF (view-only for students)</Label>
          <Input
            id={`lesson-pdf-${moduleId}`}
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
          <Label htmlFor={`lesson-content-${moduleId}`}>Written content</Label>
          <Textarea
            id={`lesson-content-${moduleId}`}
            name="content"
            placeholder="Lesson notes, instructions, or transcript..."
            rows={4}
          />
        </div>
      </div>

      <Button type="submit" className="w-full sm:w-auto" disabled={isPending}>
        {isPending ? "Saving…" : "Add lesson"}
      </Button>
    </form>
  );
}
