import { redirect } from "next/navigation";
import { saveLessonPdf, saveLessonVideo, MEDIA_LIMITS } from "@/lib/lesson-pdf-storage";
import { rethrowNavigationError } from "@/lib/navigation-errors";

type ExistingLessonMedia = {
  videoUrl: string | null;
  pdfStorageKey: string | null;
};

export async function resolveLessonMediaFromForm(
  formData: FormData,
  courseId: string,
  parsedVideoUrl: string | undefined,
  existing?: ExistingLessonMedia,
): Promise<{ videoUrl: string | null; pdfStorageKey: string | null }> {
  let videoUrl = parsedVideoUrl?.trim() || null;
  const preUploadedPdf = formData.get("uploadedPdfStorageKey");
  let pdfStorageKey =
    typeof preUploadedPdf === "string" && preUploadedPdf.trim() ?
      preUploadedPdf.trim()
    : existing?.pdfStorageKey ?? null;

  const videoFile = formData.get("video");
  if (videoFile instanceof File && videoFile.size > 0) {
    if (videoFile.size > MEDIA_LIMITS.videoBytes) {
      redirect(`/dashboard/instructor/courses/${courseId}?error=video-too-large`);
    }
    const allowedVideo =
      videoFile.type.startsWith("video/") ||
      /\.(mp4|webm|mov|m4v)$/i.test(videoFile.name);
    if (!allowedVideo) {
      redirect(`/dashboard/instructor/courses/${courseId}?error=invalid-video`);
    }
    try {
      const buffer = Buffer.from(await videoFile.arrayBuffer());
      videoUrl = await saveLessonVideo(buffer);
    } catch (err) {
      rethrowNavigationError(err);
      console.error("[courses] video upload failed:", err);
      redirect(`/dashboard/instructor/courses/${courseId}?error=video-upload`);
    }
  }

  const pdfFile = formData.get("pdf");
  if (!preUploadedPdf && pdfFile instanceof File && pdfFile.size > 0) {
    if (pdfFile.size > MEDIA_LIMITS.pdfBytes) {
      redirect(`/dashboard/instructor/courses/${courseId}?error=pdf-too-large`);
    }
    const isPdf =
      pdfFile.type === "application/pdf" || /\.pdf$/i.test(pdfFile.name);
    if (isPdf) {
      try {
        const buffer = Buffer.from(await pdfFile.arrayBuffer());
        pdfStorageKey = await saveLessonPdf(buffer);
      } catch (err) {
        rethrowNavigationError(err);
        console.error("[courses] pdf upload failed:", err);
        const needsCloudinary =
          err instanceof Error && err.message.includes("Cloudinary");
        redirect(
          `/dashboard/instructor/courses/${courseId}?error=${needsCloudinary ? "pdf-needs-cloudinary" : "pdf-upload"}`,
        );
      }
    } else {
      redirect(`/dashboard/instructor/courses/${courseId}?error=invalid-pdf`);
    }
  }

  if (
    existing &&
    formData.get("removePdf") === "on" &&
    !(typeof preUploadedPdf === "string" && preUploadedPdf.trim()) &&
    !(pdfFile instanceof File && pdfFile.size > 0)
  ) {
    pdfStorageKey = null;
  }

  return { videoUrl, pdfStorageKey };
}
