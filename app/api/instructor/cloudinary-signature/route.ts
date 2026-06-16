import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth";
import { isApprovedInstructor } from "@/lib/instructor";
import {
  createSignedUploadParams,
  isCloudinaryEnabled,
  type CloudinaryUploadKind,
} from "@/lib/cloudinary";

export const runtime = "nodejs";

function parseKind(value: string | null): CloudinaryUploadKind | null {
  if (value === "pdf" || value === "video" || value === "image") return value;
  return null;
}

export async function GET(request: Request) {
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
          "Cloudinary is not configured on the server. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in Vercel, then redeploy.",
      },
      { status: 503 },
    );
  }

  const kind = parseKind(new URL(request.url).searchParams.get("kind"));
  if (!kind) {
    return NextResponse.json({ error: "Invalid upload type" }, { status: 400 });
  }

  try {
    return NextResponse.json(createSignedUploadParams(kind));
  } catch (err) {
    console.error("[cloudinary-signature] failed:", err);
    const message = err instanceof Error ? err.message : "Could not create upload signature";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
