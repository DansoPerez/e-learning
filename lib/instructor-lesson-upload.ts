import {
  isCloudinaryEnabled,
  MEDIA_LIMITS,
  toCloudinaryStorageKey,
  uploadToCloudinary,
  VERCEL_UPLOAD_BYTES,
} from "@/lib/cloudinary";

export { isCloudinaryEnabled, MEDIA_LIMITS, VERCEL_UPLOAD_BYTES };

export async function saveLessonMediaToCloudinary(
  buffer: Buffer,
  kind: "video" | "pdf",
  mimeType?: string,
): Promise<{ videoUrl?: string; pdfStorageKey?: string }> {
  if (!isCloudinaryEnabled()) {
    throw new Error("Cloudinary is not configured on the server.");
  }

  if (kind === "video") {
    if (buffer.length > MEDIA_LIMITS.videoBytes) {
      throw new Error("Video too large (max 100MB)");
    }
    const { url } = await uploadToCloudinary(buffer, {
      folder: "bravio/lesson-videos",
      resourceType: "video",
      mimeType: mimeType || "video/mp4",
    });
    return { videoUrl: url };
  }

  if (buffer.length > MEDIA_LIMITS.pdfBytes) {
    throw new Error(`PDF too large (max ${Math.round(MEDIA_LIMITS.pdfBytes / (1024 * 1024))}MB)`);
  }
  const { publicId } = await uploadToCloudinary(buffer, {
    folder: "bravio/lesson-pdfs",
    resourceType: "raw",
    mimeType: mimeType || "application/pdf",
  });
  return { pdfStorageKey: toCloudinaryStorageKey(publicId) };
}
