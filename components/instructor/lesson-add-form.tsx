import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { isCloudinaryEnabled } from "@/lib/cloudinary";
import { MEDIA_LIMITS } from "@/lib/lesson-pdf-storage";
import { Film, FileText, Link2 } from "lucide-react";

export function LessonAddForm({
  moduleId,
  lessonCount,
  action,
}: {
  moduleId: string;
  lessonCount: number;
  action: (formData: FormData) => void;
}) {
  const cloudinaryReady = isCloudinaryEnabled();
  const videoMb = Math.round(MEDIA_LIMITS.videoBytes / (1024 * 1024));
  const pdfMb = Math.round(MEDIA_LIMITS.pdfBytes / (1024 * 1024));

  return (
    <form action={action} className="mt-4 space-y-4 rounded-lg border border-dashed border-[var(--border)] bg-[var(--background-subtle)] p-4 sm:p-5">
      <p className="text-sm font-semibold text-[var(--foreground)]">Add lesson</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`lesson-title-${moduleId}`}>Lesson title</Label>
          <Input id={`lesson-title-${moduleId}`} name="title" placeholder="e.g. Introduction to pandas" required />
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
            Or upload video {cloudinaryReady ? `(max ${videoMb}MB via Cloudinary)` : "(configure Cloudinary in .env)"}
          </Label>
          <Input
            id={`lesson-video-file-${moduleId}`}
            name="video"
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/x-m4v,.mp4,.webm,.mov"
            disabled={!cloudinaryReady}
          />
          {!cloudinaryReady ?
            <p className="text-xs text-amber-700">
              Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to enable uploads. You can still paste a video URL above.
            </p>
          : <p className="text-xs text-[var(--foreground-muted)]">
              If you upload a file, it overrides the URL field. Supported: MP4, WebM, MOV.
            </p>
          }
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-[var(--border)] bg-white p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
          <FileText className="h-4 w-4 text-[var(--primary)]" />
          Reading material
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`lesson-pdf-${moduleId}`}>PDF (view-only for students)</Label>
          <Input id={`lesson-pdf-${moduleId}`} name="pdf" type="file" accept="application/pdf" />
          <p className="text-xs text-[var(--foreground-muted)]">
            Max {pdfMb}MB.
            {cloudinaryReady ?
              " Stored on Cloudinary — students read in-browser without downloading."
            : " On Vercel, PDF uploads require Cloudinary env vars. Use written content below, or add Cloudinary keys and redeploy."}
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

      <Button type="submit" className="w-full sm:w-auto">
        Add lesson
      </Button>
    </form>
  );
}
