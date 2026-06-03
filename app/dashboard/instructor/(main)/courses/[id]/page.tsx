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
import { addQuestionAction, createQuizAction, deleteQuizAction } from "@/app/actions/quiz";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CourseReviews } from "@/components/courses/course-reviews";
import { EditCourseForm } from "@/components/instructor/edit-course-form";
import { CourseAnnouncementForm } from "@/components/instructor/course-announcement-form";

export default async function InstructorCourseEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("INSTRUCTOR", "ADMIN");
  const { id } = await params;

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

  return (
    <InstructorDashboardWrapper title={course.title}>
      <Badge className="mb-4">{course.status}</Badge>

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
          <form
            action={addLessonAction.bind(null, course.id, mod.id)}
            encType="multipart/form-data"
            className="mt-4 grid gap-3 sm:grid-cols-2"
          >
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor={`lesson-title-${mod.id}`}>Lesson title</Label>
              <Input id={`lesson-title-${mod.id}`} name="title" placeholder="Lesson title" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`lesson-order-${mod.id}`}>Order</Label>
              <Input
                id={`lesson-order-${mod.id}`}
                name="orderIndex"
                type="number"
                min={0}
                step={1}
                defaultValue={mod.lessons.length}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`lesson-duration-${mod.id}`}>Duration (min)</Label>
              <Input
                id={`lesson-duration-${mod.id}`}
                name="durationMin"
                type="number"
                min={0}
                step={1}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor={`lesson-video-${mod.id}`}>Video link</Label>
              <Input
                id={`lesson-video-${mod.id}`}
                name="videoUrl"
                placeholder="YouTube, Vimeo, Cloudinary, or direct .mp4 URL"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor={`lesson-pdf-${mod.id}`}>PDF material (view-only for students)</Label>
              <Input
                id={`lesson-pdf-${mod.id}`}
                name="pdf"
                type="file"
                accept="application/pdf"
              />
              <p className="text-xs text-[var(--foreground-muted)]">Max 20MB. Students can read in-browser but not download.</p>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor={`lesson-content-${mod.id}`}>Text content</Label>
              <Textarea
                id={`lesson-content-${mod.id}`}
                name="content"
                placeholder="Optional written content"
                rows={3}
              />
            </div>
            <Button type="submit" className="sm:col-span-2 w-fit">
              Add lesson
            </Button>
          </form>
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
