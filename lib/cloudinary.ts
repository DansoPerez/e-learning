import { v2 as cloudinary } from "cloudinary";
import { readEnv } from "@/lib/env-utils";
import { MEDIA_LIMITS, VERCEL_UPLOAD_BYTES } from "@/lib/media-limits";

export { MEDIA_LIMITS, VERCEL_UPLOAD_BYTES };

const CLOUDINARY_PREFIX = "cloudinary:";

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

export function toCloudinaryStorageKey(publicId: string): string {
  return `${CLOUDINARY_PREFIX}${publicId}`;
}

export function isCloudinaryStorageKey(key: string): boolean {
  return key.startsWith(CLOUDINARY_PREFIX);
}

export function publicIdFromStorageKey(key: string): string {
  return key.slice(CLOUDINARY_PREFIX.length);
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
        folder: options.folder,
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
  ensureConfigured();
  return cloudinary.url(publicId, {
    resource_type: "raw",
    secure: true,
  });
}

export async function fetchCloudinaryRaw(publicId: string): Promise<Buffer> {
  const url = cloudinaryPdfViewUrl(publicId);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch file from Cloudinary");
  }
  return Buffer.from(await res.arrayBuffer());
}
