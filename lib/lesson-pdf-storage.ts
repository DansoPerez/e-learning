import {
  cloudinaryPdfViewUrl,
  fetchCloudinaryRaw,
  isCloudinaryEnabled,
  isCloudinaryStorageKey,
  publicIdFromStorageKey,
  toCloudinaryStorageKey,
  uploadToCloudinary,
  MEDIA_LIMITS,
} from "@/lib/cloudinary";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const PDF_DIR = path.join(process.cwd(), "storage", "lesson-pdfs");

function isServerlessFilesystem(): boolean {
  return process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;
}

export async function saveLessonPdf(buffer: Buffer): Promise<string> {
  if (buffer.length > MEDIA_LIMITS.pdfBytes) {
    throw new Error("PDF too large (max 20MB)");
  }

  if (isCloudinaryEnabled()) {
    const { publicId } = await uploadToCloudinary(buffer, {
      folder: "bravio/lesson-pdfs",
      resourceType: "raw",
    });
    return toCloudinaryStorageKey(publicId);
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

  const { url } = await uploadToCloudinary(buffer, {
    folder: "bravio/lesson-videos",
    resourceType: "video",
  });
  return url;
}

export async function readLessonPdf(storageKey: string): Promise<Buffer> {
  if (isCloudinaryStorageKey(storageKey)) {
    return fetchCloudinaryRaw(publicIdFromStorageKey(storageKey));
  }

  if (!/^[a-f0-9-]+\.pdf$/i.test(storageKey)) {
    throw new Error("Invalid storage key");
  }
  return readFile(path.join(PDF_DIR, storageKey));
}

export function lessonPdfProxyUrl(lessonId: string): string {
  return `/api/lessons/${lessonId}/pdf#toolbar=0&navpanes=0`;
}

export { cloudinaryPdfViewUrl, MEDIA_LIMITS };
