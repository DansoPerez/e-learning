import { v2 as cloudinary } from "cloudinary";
import { randomUUID } from "crypto";
import { readEnv } from "@/lib/env-utils";
import { MEDIA_LIMITS, VERCEL_UPLOAD_BYTES } from "@/lib/media-limits";
import {
  isCloudinaryStorageKey,
  publicIdFromStorageKey,
  toCloudinaryStorageKey,
} from "@/lib/cloudinary-keys";

export { MEDIA_LIMITS, VERCEL_UPLOAD_BYTES };
export { isCloudinaryStorageKey, publicIdFromStorageKey, toCloudinaryStorageKey };

const LESSON_PDF_FOLDER = "bravio/lesson-pdfs";
const LESSON_VIDEO_FOLDER = "bravio/lesson-videos";

export function getCloudinaryConfig() {
  return {
    cloudName: readEnv("CLOUDINARY_CLOUD_NAME") ?? readEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"),
    apiKey: readEnv("CLOUDINARY_API_KEY"),
    apiSecret: readEnv("CLOUDINARY_API_SECRET"),
  };
}

export function isCloudinaryEnabled(): boolean {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  return !!(cloudName && apiKey && apiSecret);
}

function ensureConfigured(): void {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export type CloudinaryUploadKind = "pdf" | "video";

export function cloudinaryFolderForKind(kind: CloudinaryUploadKind): string {
  return kind === "pdf" ? LESSON_PDF_FOLDER : LESSON_VIDEO_FOLDER;
}

/** Signed delivery URL for raw files (PDFs). Required when strict delivery is enabled. */
export function cloudinarySignedRawUrl(publicId: string, ttlSeconds = 3600): string {
  ensureConfigured();
  const expiresAt = Math.round(Date.now() / 1000) + ttlSeconds;
  return cloudinary.url(publicId, {
    resource_type: "raw",
    type: "upload",
    secure: true,
    sign_url: true,
    expires_at: expiresAt,
  });
}

export function createPdfUploadPublicId(): string {
  return `${LESSON_PDF_FOLDER}/${randomUUID()}.pdf`;
}

/** Signed params for browser → Cloudinary uploads (file never hits Vercel). */
export function createSignedUploadParams(kind: CloudinaryUploadKind) {
  ensureConfigured();
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary is not configured.");
  }

  const timestamp = Math.round(Date.now() / 1000);

  if (kind === "pdf") {
    const publicId = createPdfUploadPublicId();
    const signature = cloudinary.utils.api_sign_request({ timestamp, public_id: publicId }, apiSecret);
    return {
      cloudName,
      apiKey,
      timestamp,
      signature,
      publicId,
      uploadPath: "raw/upload" as const,
    };
  }

  const folder = cloudinaryFolderForKind(kind);
  const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, apiSecret);

  return {
    cloudName,
    apiKey,
    timestamp,
    signature,
    folder,
    uploadPath: "video/upload" as const,
  };
}

export async function uploadToCloudinary(
  buffer: Buffer,
  options: {
    folder: string;
    resourceType: "video" | "raw" | "image";
    mimeType?: string;
  },
): Promise<{ url: string; publicId: string }> {
  ensureConfigured();

  const mimeType =
    options.mimeType ??
    (options.resourceType === "raw" ?
      "application/pdf"
    : options.resourceType === "video" ?
      "video/mp4"
    : "image/jpeg");

  try {
    const result = await cloudinary.uploader.upload(
      `data:${mimeType};base64,${buffer.toString("base64")}`,
      {
        folder: options.resourceType === "raw" ? undefined : options.folder,
        public_id:
          options.resourceType === "raw" ?
            createPdfUploadPublicId()
          : undefined,
        resource_type: options.resourceType,
      },
    );
    return { url: result.secure_url, publicId: result.public_id };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Cloudinary upload failed";
    throw new Error(message);
  }
}

export function cloudinaryPdfViewUrl(publicId: string): string {
  return cloudinarySignedRawUrl(publicId);
}

export async function fetchCloudinaryRaw(publicId: string): Promise<Buffer> {
  ensureConfigured();

  let deliveryUrl = cloudinarySignedRawUrl(publicId);
  try {
    const resource = await cloudinary.api.resource(publicId, { resource_type: "raw" });
    if (typeof resource.secure_url === "string") {
      deliveryUrl = resource.secure_url;
    }
  } catch {
    // Use signed URL fallback below.
  }

  const res = await fetch(deliveryUrl);
  if (!res.ok) {
    const signedUrl = cloudinarySignedRawUrl(publicId);
    const signedRes = await fetch(signedUrl);
    if (!signedRes.ok) {
      throw new Error(`Failed to fetch PDF from Cloudinary (${signedRes.status})`);
    }
    return Buffer.from(await signedRes.arrayBuffer());
  }
  return Buffer.from(await res.arrayBuffer());
}
