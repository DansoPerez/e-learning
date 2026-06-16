import {
  isCloudinaryEnabled,
  uploadToCloudinary,
  MEDIA_LIMITS,
} from "@/lib/cloudinary";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const LOCAL_DIR = path.join(process.cwd(), "public", "uploads", "course-thumbnails");

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function isServerlessFilesystem(): boolean {
  return process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;
}

function extensionForMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "jpg";
  }
}

export async function saveCourseThumbnail(buffer: Buffer, mimeType: string): Promise<string> {
  if (buffer.length > MEDIA_LIMITS.thumbnailBytes) {
    throw new Error("Image too large (max 5MB)");
  }
  if (!ALLOWED_TYPES.has(mimeType)) {
    throw new Error("Use JPEG, PNG, WebP, or GIF");
  }

  if (isCloudinaryEnabled()) {
    const { url } = await uploadToCloudinary(buffer, {
      folder: "bravio/course-thumbnails",
      resourceType: "image",
      mimeType,
    });
    return url;
  }

  if (isServerlessFilesystem()) {
    throw new Error(
      "Image uploads on Vercel require Cloudinary. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET, or paste an image URL instead.",
    );
  }

  await mkdir(LOCAL_DIR, { recursive: true });
  const ext = extensionForMime(mimeType);
  const filename = `${randomUUID()}.${ext}`;
  await writeFile(path.join(LOCAL_DIR, filename), buffer);
  return `/uploads/course-thumbnails/${filename}`;
}

function isValidThumbnailUrl(value: string): boolean {
  if (value.startsWith("/")) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/** File upload overrides URL. Pre-uploaded Cloudinary URL or file clears/persists per field values. */
export async function resolveCourseThumbnailFromForm(
  formData: FormData,
  existingUrl: string | null = null,
): Promise<string | null> {
  const preUploaded = formData.get("uploadedThumbnailUrl");
  if (typeof preUploaded === "string" && preUploaded.trim()) {
    const trimmed = preUploaded.trim();
    if (!isValidThumbnailUrl(trimmed)) {
      throw new Error("Enter a valid image URL");
    }
    return trimmed;
  }

  const file = formData.get("thumbnail");
  if (file instanceof File && file.size > 0) {
    const mime =
      file.type ||
      (file.name.endsWith(".png") ? "image/png"
      : file.name.endsWith(".webp") ? "image/webp"
      : file.name.endsWith(".gif") ? "image/gif"
      : "image/jpeg");
    const buffer = Buffer.from(await file.arrayBuffer());
    return saveCourseThumbnail(buffer, mime);
  }

  const raw = formData.get("thumbnailUrl");
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    if (!isValidThumbnailUrl(trimmed)) {
      throw new Error("Enter a valid image URL");
    }
    return trimmed;
  }

  return existingUrl;
}

export { MEDIA_LIMITS };
