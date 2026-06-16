import { MEDIA_LIMITS } from "@/lib/media-limits";
import { toCloudinaryStorageKey } from "@/lib/cloudinary-keys";

type UploadKind = "video" | "pdf" | "image";

type SignatureResponse = {
  error?: string;
  cloudName?: string;
  apiKey?: string;
  timestamp?: number;
  signature?: string;
  folder?: string;
  publicId?: string;
  uploadPath?: string;
};

type CloudinaryUploadResponse = {
  secure_url?: string;
  public_id?: string;
  error?: { message?: string };
};

function maxBytesForKind(kind: UploadKind): number {
  if (kind === "video") return MEDIA_LIMITS.videoBytes;
  if (kind === "pdf") return MEDIA_LIMITS.pdfBytes;
  return MEDIA_LIMITS.thumbnailBytes;
}

function validateFile(file: File, kind: UploadKind): void {
  const maxBytes = maxBytesForKind(kind);
  const maxMb = Math.round(maxBytes / (1024 * 1024));
  if (file.size > maxBytes) {
    if (kind === "video") throw new Error(`Video must be ${maxMb}MB or smaller.`);
    if (kind === "pdf") throw new Error(`PDF must be ${maxMb}MB or smaller.`);
    throw new Error(`Image must be ${maxMb}MB or smaller.`);
  }

  if (kind === "video") {
    const allowed =
      file.type.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(file.name);
    if (!allowed) throw new Error("Upload MP4, WebM, or MOV video only.");
    return;
  }

  if (kind === "pdf") {
    const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
    if (!isPdf) throw new Error("Upload a PDF file only.");
    return;
  }

  const allowedImage =
    file.type.startsWith("image/") || /\.(jpe?g|png|webp|gif)$/i.test(file.name);
  if (!allowedImage) throw new Error("Upload JPEG, PNG, WebP, or GIF only.");
}

/** Upload directly to Cloudinary from the browser (bypasses Vercel's ~4.5MB body limit). */
export async function uploadFileToCloudinary(
  file: File,
  kind: UploadKind,
): Promise<{ videoUrl?: string; pdfStorageKey?: string; imageUrl?: string }> {
  validateFile(file, kind);

  const sigRes = await fetch(`/api/instructor/cloudinary-signature?kind=${kind}`);
  const sig = (await sigRes.json().catch(() => ({}))) as SignatureResponse;
  if (!sigRes.ok) {
    throw new Error(sig.error ?? "Could not start upload");
  }

  const { cloudName, apiKey, timestamp, signature, folder, publicId, uploadPath } = sig;
  if (!cloudName || !apiKey || !timestamp || !signature || !uploadPath) {
    throw new Error("Invalid upload signature from server");
  }
  if (kind === "pdf" && !publicId) {
    throw new Error("Invalid PDF upload signature from server");
  }
  if ((kind === "video" || kind === "image") && !folder) {
    throw new Error("Invalid upload signature from server");
  }

  const body = new FormData();
  body.append("file", file);
  body.append("api_key", apiKey);
  body.append("timestamp", String(timestamp));
  body.append("signature", signature);
  if (kind === "pdf") {
    body.append("public_id", publicId!);
  } else {
    body.append("folder", folder!);
  }

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${uploadPath}`,
    { method: "POST", body },
  );
  const data = (await uploadRes.json().catch(() => ({}))) as CloudinaryUploadResponse;

  if (!uploadRes.ok || !data.public_id) {
    throw new Error(data.error?.message ?? "Cloudinary upload failed");
  }

  if (kind === "video") {
    if (!data.secure_url) throw new Error("Cloudinary did not return a video URL");
    return { videoUrl: data.secure_url };
  }

  if (kind === "image") {
    if (!data.secure_url) throw new Error("Cloudinary did not return an image URL");
    return { imageUrl: data.secure_url };
  }

  return { pdfStorageKey: toCloudinaryStorageKey(data.public_id) };
}

export async function uploadLessonFileToCloudinary(
  file: File,
  kind: "video" | "pdf",
): Promise<{ videoUrl?: string; pdfStorageKey?: string }> {
  return uploadFileToCloudinary(file, kind);
}

export async function uploadCourseThumbnailToCloudinary(
  file: File,
): Promise<{ imageUrl: string }> {
  const result = await uploadFileToCloudinary(file, "image");
  if (!result.imageUrl) throw new Error("Cloudinary did not return an image URL");
  return { imageUrl: result.imageUrl };
}

/** Uploads a selected thumbnail file before the server action runs (Cloudinary only). */
export async function prepareCourseThumbnailFormData(
  formData: FormData,
  cloudinaryReady: boolean,
): Promise<void> {
  const file = formData.get("thumbnail");
  if (!(file instanceof File) || file.size === 0) return;

  if (!cloudinaryReady) return;

  const { imageUrl } = await uploadCourseThumbnailToCloudinary(file);
  formData.set("uploadedThumbnailUrl", imageUrl);
  formData.delete("thumbnail");
}
