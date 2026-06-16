import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasCourseAccess } from "@/lib/services/enrollment";
import {
  lessonPdfDirectUrl,
  loadLessonPdfBuffer,
  PDF_PROXY_MAX_BYTES,
} from "@/lib/lesson-pdf-delivery";

async function authorizeLessonPdf(lessonId: string) {
  const user = await getApiUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      pdfStorageKey: true,
      module: { select: { courseId: true } },
    },
  });

  if (!lesson?.pdfStorageKey) {
    return { error: NextResponse.json({ error: "Document not found" }, { status: 404 }) };
  }

  const allowed = await hasCourseAccess(user.id, lesson.module.courseId);
  if (!allowed) {
    return { error: NextResponse.json({ error: "Access denied" }, { status: 403 }) };
  }

  return { lesson };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const { lessonId } = await params;
  const auth = await authorizeLessonPdf(lessonId);
  if ("error" in auth && auth.error) return auth.error;

  const storageKey = auth.lesson!.pdfStorageKey!;

  try {
    const buffer = await loadLessonPdfBuffer(storageKey);

    if (buffer.length > PDF_PROXY_MAX_BYTES) {
      const directUrl = lessonPdfDirectUrl(storageKey);
      if (directUrl) {
        return NextResponse.json(
          {
            error: "PDF too large to embed here.",
            directUrl,
          },
          { status: 413 },
        );
      }
    }

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("[lesson-pdf] failed:", err);
    const message = err instanceof Error ? err.message : "Document unavailable";
    const directUrl = lessonPdfDirectUrl(storageKey);
    return NextResponse.json(
      directUrl ? { error: message, directUrl } : { error: message },
      { status: 404 },
    );
  }
}
