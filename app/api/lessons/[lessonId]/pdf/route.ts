import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasCourseAccess } from "@/lib/services/enrollment";
import { readLessonPdf } from "@/lib/lesson-pdf-storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { lessonId } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      pdfStorageKey: true,
      module: { select: { courseId: true } },
    },
  });

  if (!lesson?.pdfStorageKey) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const allowed = await hasCourseAccess(user.id, lesson.module.courseId);
  if (!allowed) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  try {
    const buffer = await readLessonPdf(lesson.pdfStorageKey);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Document unavailable" }, { status: 404 });
  }
}
