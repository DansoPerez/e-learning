import { MEDIA_LIMITS } from "@/lib/media-limits";
import { toCloudinaryStorageKey } from "@/lib/cloudinary-keys";

type UploadKind = "video" | "pdf";

type SignatureResponse = {
  error?: string;
  cloudName?: string;
  apiKey?: string;
  timestamp?: number;
  signature?: string;
  folder?: string;
  uploadPath?: string;
};

type CloudinaryUploadResponse = {
  secure_url?: string;
  public_id?: string;
  error?: { message?: string };
};

function maxBytesForKind(kind: UploadKind): number {
  return kind === "video" ? MEDIA_LIMITS.videoBytes : MEDIA_LIMITS.pdfBytes;
}

function validateFile(file: File, kind: UploadKind): void {
  const maxBytes = maxBytesForKind(kind);
  const maxMb = Math.round(maxBytes / (1024 * 1024));
  if (file.size > maxBytes) {
    throw new Error(
      kind === "video" ?
        `Video must be ${maxMb}MB or smaller.`
      : `PDF must be ${maxMb}MB or smaller.`,
    );
  }

  if (kind === "video") {
    const allowed =
      file.type.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(file.name);
    if (!allowed) throw new Error("Upload MP4, WebM, or MOV video only.");
    return;
  }

  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
  if (!isPdf) throw new Error("Upload a PDF file only.");
}

/** Upload directly to Cloudinary from the browser (bypasses Vercel's ~4.5MB body limit). */
export async function uploadLessonFileToCloudinary(
  file: File,
  kind: UploadKind,
): Promise<{ videoUrl?: string; pdfStorageKey?: string }> {
  validateFile(file, kind);

  const sigRes = await fetch(`/api/instructor/cloudinary-signature?kind=${kind}`);
  const sig = (await sigRes.json().catch(() => ({}))) as SignatureResponse;
  if (!sigRes.ok) {
    throw new Error(sig.error ?? "Could not start upload");
  }

  const { cloudName, apiKey, timestamp, signature, folder, uploadPath } = sig;
  if (!cloudName || !apiKey || !timestamp || !signature || !folder || !uploadPath) {
    throw new Error("Invalid upload signature from server");
  }

  const body = new FormData();
  body.append("file", file);
  body.append("api_key", apiKey);
  body.append("timestamp", String(timestamp));
  body.append("signature", signature);
  body.append("folder", folder);

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

  return { pdfStorageKey: toCloudinaryStorageKey(data.public_id) };
}
