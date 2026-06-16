import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { InstructorDashboardWrapper } from "@/components/layout/instructor-dashboard-wrapper";
import {
  addLessonAction,
  addModuleAction,
  submitCourseForReviewAction,
} from "@/app/actions/courses";
import { createQuizAction, deleteQuizAction } from "@/app/actions/quiz";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CourseReviews } from "@/components/courses/course-reviews";
import { EditCourseForm } from "@/components/instructor/edit-course-form";
import { CourseAnnouncementForm } from "@/components/instructor/course-announcement-form";
import { LessonAddForm } from "@/components/instructor/lesson-add-form";
import { isCloudinaryEnabled } from "@/lib/cloudinary";
import { MEDIA_LIMITS } from "@/lib/media-limits";

const pdfMaxMb = Math.round(MEDIA_LIMITS.pdfBytes / (1024 * 1024));

const LESSON_ERRORS: Record<string, string> = {
  "invalid-module": "Check the module title and order, then try again.",
  "invalid-lesson": "Check the lesson title and fields, then try again.",
  "video-too-large": "Video must be 100MB or smaller.",
  "invalid-video": "Upload MP4, WebM, or MOV video only.",
  "video-upload":
    "Video upload failed. Add Cloudinary keys on Vercel or paste a YouTube/Vimeo/video URL instead.",
  "pdf-too-large": `PDF must be ${pdfMaxMb}MB or smaller.`,
  "invalid-pdf": "Upload a PDF file only.",
  "pdf-upload": "PDF upload failed. Try again or use written lesson content.",
  "pdf-needs-cloudinary":
    "PDF uploads on Vercel need Cloudinary. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in Vercel → Settings → Environment Variables, then redeploy. Or use written content / a video URL instead.",
  "save-failed":
    "Could not save your changes. Check Vercel logs, confirm DATABASE_URL is set, then try again.",
  unauthorized: "You do not have permission to edit this course.",
  "module-not-found": "That module was not found. Refresh the page and try again.",
  "no-content": "Add at least one module and lesson before submitting this course for review.",
  "invalid-quiz": "Check the quiz title and passing score, then try again.",
};

const LESSON_SUCCESS: Record<string, string> = {
  "module-added": "Module added.",
  "lesson-added": "Lesson added.",
};

export default async function InstructorCourseEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const user = await requireRole("INSTRUCTOR", "ADMIN");
  const { id } = await params;
  const { error, success } = await searchParams;

  const [course, categories] = await Promise.all([
    prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          orderBy: { orderIndex: "asc" },
          include: { lessons: { orderBy: { orderIndex: "asc" } } },
        },
        quizzes: { include: { questions: true } },
        reviews: {
          include: {
            user: { select: { id: true, name: true } },
            replies: {
              orderBy: { createdAt: "asc" },
              include: { author: { select: { id: true, name: true, role: true } } },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!course || (course.instructorId !== user.id && user.role !== "ADMIN")) {
    notFound();
  }

  const cloudinaryReady = isCloudinaryEnabled();

  return (
    <InstructorDashboardWrapper title={course.title}>
      <Badge className="mb-4">{course.status}</Badge>

      {error && LESSON_ERRORS[error] ?
        <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {LESSON_ERRORS[error]}
        </p>
      : null}

      {success && LESSON_SUCCESS[success] ?
        <p className="mb-4 rounded-lg bg-[var(--success-bg)] px-3 py-2 text-sm text-[var(--success)]">
          {LESSON_SUCCESS[success]}
        </p>
      : null}

      {course.status === "DRAFT" || course.status === "REJECTED" ?
        <form action={submitCourseForReviewAction.bind(null, course.id)} className="mb-6">
          <Button type="submit">Submit for review</Button>
        </form>
      : null}

      <section className="mb-10 rounded-xl border bg-white p-6">
        <h2 className="mb-2 font-semibold">Course announcements</h2>
        <p className="mb-4 text-sm text-[var(--foreground-muted)]">
          Notify students enrolled in this course.
        </p>
        <CourseAnnouncementForm courseId={course.id} />
      </section>

      <EditCourseForm
        courseId={course.id}
        course={{
          title: course.title,
          description: course.description,
          price: Number(course.price),
          thumbnailUrl: course.thumbnailUrl,
          categoryId: course.categoryId,
          status: course.status,
        }}
        categories={categories}
      />

      <section className="mb-10 rounded-xl border bg-white p-6">
        <h2 className="mb-4 font-semibold">Add module</h2>
        <form action={addModuleAction.bind(null, course.id)} className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="module-title">Module title</Label>
            <Input id="module-title" name="title" placeholder="Module title" required className="max-w-xs" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="module-order">Order</Label>
            <Input
              id="module-order"
              name="orderIndex"
              type="number"
              min={0}
              step={1}
              defaultValue={course.modules.length}
              className="w-24"
            />
          </div>
          <Button type="submit">Add module</Button>
        </form>
      </section>

      {course.modules.map((mod) => (
        <section key={mod.id} className="mb-8 rounded-xl border bg-white p-6">
          <h3 className="font-semibold">{mod.title}</h3>
          <ul className="mt-2 space-y-1 text-sm text-zinc-600">
            {mod.lessons.map((l) => (
              <li key={l.id}>
                {l.title}
                {l.videoUrl ? " · video" : ""}
                {l.pdfStorageKey ? " · PDF" : ""}
              </li>
            ))}
          </ul>
          <LessonAddForm
            moduleId={mod.id}
            lessonCount={mod.lessons.length}
            cloudinaryReady={cloudinaryReady}
            action={addLessonAction.bind(null, course.id, mod.id)}
          />
        </section>
      ))}

      <section className="rounded-xl border bg-white p-6">
        <h2 className="mb-4 font-semibold">Quizzes</h2>
        {course.quizzes.map((q) => (
          <div
            key={q.id}
            className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)] pb-4"
          >
            <div>
              <p className="font-medium">{q.title}</p>
              <p className="text-sm text-zinc-500">
                {q.questions.length} question{q.questions.length === 1 ? "" : "s"}
                {q.durationMin ? ` · ${q.durationMin} min` : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/dashboard/instructor/courses/${course.id}/quizzes/${q.id}`}>
                <Button type="button" size="sm">
                  Open & edit
                </Button>
              </Link>
              <form action={deleteQuizAction.bind(null, q.id, course.id)}>
                <Button type="submit" variant="danger" size="sm">
                  Delete
                </Button>
              </form>
            </div>
          </div>
        ))}
        <form action={createQuizAction.bind(null, course.id)} className="mt-4 flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="quiz-title">Quiz title</Label>
            <Input id="quiz-title" name="title" placeholder="Quiz title" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="quiz-duration">Time limit (min)</Label>
            <Input
              id="quiz-duration"
              name="durationMin"
              type="number"
              min={0}
              step={1}
              placeholder="Optional"
              className="w-28"
            />
          </div>
          <Button type="submit">Add quiz</Button>
        </form>
        {course.quizzes.length === 0 ?
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">
            Create a quiz above, then use Open & edit to add questions.
          </p>
        : null}
      </section>

      <CourseReviews
        courseId={course.id}
        courseSlug={course.slug}
        reviews={course.reviews}
        canReview={false}
        canReplyAsInstructor={course.instructorId === user.id}
        isAdmin={user.role === "ADMIN"}
        currentUserId={user.id}
      />
    </InstructorDashboardWrapper>
  );
}
