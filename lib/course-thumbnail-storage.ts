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
    });
    return url;
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

/** File upload overrides URL. Empty URL with no file clears the thumbnail on edit. */
export async function resolveCourseThumbnailFromForm(
  formData: FormData,
  existingUrl: string | null = null,
): Promise<string | null> {
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
