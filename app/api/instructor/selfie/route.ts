import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { isCloudinaryEnabled, uploadToCloudinary, MEDIA_LIMITS } from "@/lib/cloudinary";

export async function POST(request: Request) {
  try {
    const { image } = (await request.json()) as { image?: string };

    if (!image?.startsWith("data:image/")) {
      return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
    }

    const match = image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json({ error: "Invalid image format" }, { status: 400 });
    }

    const ext = match[1] === "jpeg" ? "jpg" : match[1];
    const buffer = Buffer.from(match[2], "base64");

    if (buffer.length > MEDIA_LIMITS.selfieBytes) {
      return NextResponse.json({ error: "Image too large (max 5MB)" }, { status: 400 });
    }

    if (isCloudinaryEnabled()) {
      const { url } = await uploadToCloudinary(buffer, {
        folder: "bravio/selfies",
        resourceType: "image",
      });
      return NextResponse.json({ url });
    }

    const filename = `selfies/${randomUUID()}.${ext}`;
    const contentType = `image/${match[1] === "jpg" ? "jpeg" : match[1]}`;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(filename, buffer, {
        access: "public",
        contentType,
      });
      return NextResponse.json({ url: blob.url });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "selfies");
    await mkdir(uploadDir, { recursive: true });
    const localName = `${randomUUID()}.${ext}`;
    await writeFile(path.join(uploadDir, localName), buffer);
    return NextResponse.json({ url: `/uploads/selfies/${localName}` });
  } catch {
    return NextResponse.json({ error: "Failed to save selfie" }, { status: 500 });
  }
}
