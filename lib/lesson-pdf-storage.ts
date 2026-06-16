import {
  isCloudinaryEnabled,
  toCloudinaryStorageKey,
} from "@/lib/cloudinary";
import { loadLessonPdfBuffer } from "@/lib/lesson-pdf-delivery";
import { MEDIA_LIMITS } from "@/lib/media-limits";
import { saveLessonMediaToCloudinary } from "@/lib/instructor-lesson-upload";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const PDF_DIR = path.join(process.cwd(), "storage", "lesson-pdfs");

function isServerlessFilesystem(): boolean {
  return process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;
}

export async function saveLessonPdf(buffer: Buffer): Promise<string> {
  if (buffer.length > MEDIA_LIMITS.pdfBytes) {
    throw new Error(`PDF too large (max ${Math.round(MEDIA_LIMITS.pdfBytes / (1024 * 1024))}MB)`);
  }

  if (isCloudinaryEnabled()) {
    const { pdfStorageKey } = await saveLessonMediaToCloudinary(buffer, "pdf");
    if (!pdfStorageKey) throw new Error("PDF upload failed");
    return pdfStorageKey;
  }

  if (isServerlessFilesystem()) {
    throw new Error(
      "PDF uploads on Vercel require Cloudinary. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your deployment environment, or use written lesson content instead.",
    );
  }

  await mkdir(PDF_DIR, { recursive: true });
  const storageKey = `${randomUUID()}.pdf`;
  await writeFile(path.join(PDF_DIR, storageKey), buffer);
  return storageKey;
}

export async function saveLessonVideo(buffer: Buffer): Promise<string> {
  if (buffer.length > MEDIA_LIMITS.videoBytes) {
    throw new Error("Video too large (max 100MB)");
  }

  if (!isCloudinaryEnabled()) {
    throw new Error("Video upload requires Cloudinary. Add your Cloudinary keys to .env or paste a video URL instead.");
  }

  const { videoUrl } = await saveLessonMediaToCloudinary(buffer, "video");
  if (!videoUrl) throw new Error("Video upload failed");
  return videoUrl;
}

export async function readLessonPdf(storageKey: string): Promise<Buffer> {
  return loadLessonPdfBuffer(storageKey);
}

export { MEDIA_LIMITS, toCloudinaryStorageKey };
