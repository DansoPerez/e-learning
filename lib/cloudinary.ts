import { v2 as cloudinary } from "cloudinary";

const CLOUDINARY_PREFIX = "cloudinary:";

export function isCloudinaryEnabled(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

function ensureConfigured(): void {
  if (!isCloudinaryEnabled()) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
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
  },
): Promise<{ url: string; publicId: string }> {
  ensureConfigured();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        resource_type: options.resourceType,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });
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

export const MEDIA_LIMITS = {
  videoBytes: 100 * 1024 * 1024,
  pdfBytes: 20 * 1024 * 1024,
  selfieBytes: 5 * 1024 * 1024,
} as const;
