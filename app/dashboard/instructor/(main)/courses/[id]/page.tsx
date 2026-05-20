import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import Link from "next/link";
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

export default async function InstructorCourseEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("INSTRUCTOR", "ADMIN");
  const { id } = await params;

  const course = await prisma.course.findUnique({
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
  });

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
        <h2 className="mb-4 font-semibold">Add module</h2>
        <form action={addModuleAction.bind(null, course.id)} className="flex flex-wrap gap-3">
          <Input name="title" placeholder="Module title" required className="max-w-xs" />
          <Input name="orderIndex" type="number" defaultValue={course.modules.length} className="w-24" />
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
                {l.videoUrl ? " (video)" : ""}
              </li>
            ))}
          </ul>
          <form
            action={addLessonAction.bind(null, course.id, mod.id)}
            className="mt-4 grid gap-3 sm:grid-cols-2"
          >
            <Input name="title" placeholder="Lesson title" required />
            <Input name="orderIndex" type="number" defaultValue={mod.lessons.length} />
            <Input name="videoUrl" placeholder="Cloudinary video URL" className="sm:col-span-2" />
            <Textarea name="content" placeholder="Text content" className="sm:col-span-2" rows={3} />
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
        <form action={createQuizAction.bind(null, course.id)} className="mt-4 flex flex-wrap gap-3">
          <Input name="title" placeholder="Quiz title" required />
          <Input name="durationMin" type="number" placeholder="Minutes" className="w-28" />
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
