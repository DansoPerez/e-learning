import {
  cloudinarySignedRawUrl,
  fetchCloudinaryRaw,
  isCloudinaryEnabled,
  isCloudinaryStorageKey,
  publicIdFromStorageKey,
} from "@/lib/cloudinary";
import { readFile } from "fs/promises";
import path from "path";

/** Vercel serverless responses above ~4.5MB cannot be streamed reliably. */
export const PDF_PROXY_MAX_BYTES = 4 * 1024 * 1024;

const PDF_DIR = path.join(process.cwd(), "storage", "lesson-pdfs");

function isServerlessFilesystem(): boolean {
  return process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;
}

export function resolveCloudinaryPublicId(storageKey: string): string | null {
  if (isCloudinaryStorageKey(storageKey)) {
    return publicIdFromStorageKey(storageKey);
  }
  if (storageKey.startsWith("http://") || storageKey.startsWith("https://")) {
    const match = storageKey.match(/\/raw\/upload\/(?:s--[^/]+--\/)?(?:v\d+\/)?(.+?)(?:\?.*)?$/);
    if (match?.[1]) return decodeURIComponent(match[1]);
    return null;
  }
  if (storageKey.includes("/") && !/^[a-f0-9-]+\.pdf$/i.test(storageKey)) {
    return storageKey;
  }
  return null;
}

export function isRemotePdfReference(storageKey: string): boolean {
  return (
    storageKey.startsWith("http://") ||
    storageKey.startsWith("https://") ||
    resolveCloudinaryPublicId(storageKey) !== null
  );
}

export function lessonPdfDirectUrl(storageKey: string): string | null {
  const publicId = resolveCloudinaryPublicId(storageKey);
  if (!publicId || !isCloudinaryEnabled()) return null;
  return cloudinarySignedRawUrl(publicId);
}

export async function loadLessonPdfBuffer(storageKey: string): Promise<Buffer> {
  const publicId = resolveCloudinaryPublicId(storageKey);
  if (publicId) {
    return fetchCloudinaryRaw(publicId);
  }

  if (storageKey.startsWith("http://") || storageKey.startsWith("https://")) {
    const res = await fetch(storageKey);
    if (!res.ok) throw new Error(`Failed to fetch PDF (${res.status})`);
    return Buffer.from(await res.arrayBuffer());
  }

  if (isServerlessFilesystem()) {
    throw new Error(
      "This PDF was saved locally and is not available in production. Re-upload it from the instructor course page.",
    );
  }

  if (!/^[a-f0-9-]+\.pdf$/i.test(storageKey)) {
    throw new Error("Invalid storage key");
  }

  return readFile(path.join(PDF_DIR, storageKey));
}
