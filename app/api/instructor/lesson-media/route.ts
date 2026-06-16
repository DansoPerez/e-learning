import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth";
import { isApprovedInstructor } from "@/lib/instructor";
import {
  isCloudinaryEnabled,
  MEDIA_LIMITS,
  saveLessonMediaToCloudinary,
  VERCEL_UPLOAD_BYTES,
} from "@/lib/instructor-lesson-upload";

export const maxDuration = 60;
export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (user.role === "INSTRUCTOR" && !(await isApprovedInstructor(user.id))) {
    return NextResponse.json({ error: "Instructor not approved" }, { status: 403 });
  }

  if (!isCloudinaryEnabled()) {
    return NextResponse.json(
      {
        error:
          "Cloudinary is not configured on the server. In Vercel → Settings → Environment Variables, set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET (no extra quotes), then redeploy Production.",
      },
      { status: 503 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload request" }, { status: 400 });
  }

  const kind = formData.get("kind");
  const file = formData.get("file");
  if (kind !== "video" && kind !== "pdf") {
    return NextResponse.json({ error: "Invalid upload type" }, { status: 400 });
  }
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const onVercel = process.env.VERCEL === "1";
  if (onVercel && file.size > VERCEL_UPLOAD_BYTES) {
    return NextResponse.json(
      {
        error:
          kind === "video" ?
            "Video file is too large for direct upload on Vercel (max ~4.5MB). Paste a YouTube, Vimeo, or video URL instead."
          : "PDF is too large for direct upload on Vercel (max ~4.5MB). Use written lesson content or a smaller PDF.",
      },
      { status: 413 },
    );
  }

  const maxBytes = kind === "video" ? MEDIA_LIMITS.videoBytes : MEDIA_LIMITS.pdfBytes;
  if (file.size > maxBytes) {
    return NextResponse.json(
      {
        error:
          kind === "video" ?
            "Video must be 100MB or smaller."
          : "PDF must be 20MB or smaller.",
      },
      { status: 413 },
    );
  }

  if (kind === "video") {
    const allowed =
      file.type.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(file.name);
    if (!allowed) {
      return NextResponse.json(
        { error: "Upload MP4, WebM, or MOV video only." },
        { status: 400 },
      );
    }
  } else {
    const isPdf =
      file.type === "application/pdf" || /\.pdf$/i.test(file.name);
    if (!isPdf) {
      return NextResponse.json({ error: "Upload a PDF file only." }, { status: 400 });
    }
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await saveLessonMediaToCloudinary(buffer, kind, file.type || undefined);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[lesson-media] upload failed:", err);
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
