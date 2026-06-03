import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { hasCourseAccess } from "@/lib/services/enrollment";
import { markLessonCompleteAction } from "@/app/actions/learning";
import { getFirstUnpassedQuizId, getResumeLessonId } from "@/lib/resume-lesson";
import { getPassedQuizIds } from "@/lib/course-completion";
import { LessonViewTracker } from "@/components/learn/lesson-view-tracker";
import { LessonPdfViewer, LessonVideo } from "@/components/lessons/lesson-media";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function LearnPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lesson?: string }>;
}) {
  const user = await requireAuth();
  const { slug } = await params;
  const { lesson: lessonId } = await searchParams;

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      modules: {
        orderBy: { orderIndex: "asc" },
        include: {
          lessons: { orderBy: { orderIndex: "asc" } },
        },
      },
      quizzes: {
        select: {
          id: true,
          title: true,
          isEnabled: true,
          _count: { select: { questions: true } },
        },
      },
    },
  });

  if (!course) notFound();

  const allowed = await hasCourseAccess(user.id, course.id);
  if (!allowed) redirect(`/courses/${slug}`);

  const allLessons = course.modules.flatMap((m) => m.lessons);

  const resumeLessonId = lessonId ?? (await getResumeLessonId(user.id, course.id));

  if (!lessonId && !resumeLessonId) {
    const nextQuizId = await getFirstUnpassedQuizId(user.id, course.id);
    if (nextQuizId) {
      redirect(`/learn/${slug}/quiz/${nextQuizId}`);
    }
  }

  const resumeId = resumeLessonId;
  const activeLesson =
    allLessons.find((l) => l.id === resumeId) ?? allLessons[0];

  const progress = await prisma.lessonProgress.findMany({
    where: { userId: user.id, lessonId: { in: allLessons.map((l) => l.id) } },
  });
  const completedIds = new Set(progress.filter((p) => p.completed).map((p) => p.lessonId));

  const enabledQuizIds = course.quizzes
    .filter((q) => q.isEnabled && q._count.questions > 0)
    .map((q) => q.id);
  const passedQuizIds = await getPassedQuizIds(user.id, enabledQuizIds);
  const allLessonsDone =
    allLessons.length > 0 && allLessons.every((l) => completedIds.has(l.id));
  const quizzesRemaining = enabledQuizIds.filter((id) => !passedQuizIds.has(id)).length;

  return (
    <div className="page-container grid gap-6 py-8 lg:grid-cols-[280px_1fr]">
      <aside className="surface-card h-fit p-4 lg:sticky lg:top-24">
        <Link
          href={`/courses/${slug}`}
          className="text-sm font-semibold text-[var(--primary)] hover:underline"
        >
          ← Back to course
        </Link>
        <h2 className="mt-3 font-bold text-[var(--foreground)]">{course.title}</h2>
        <div className="mt-4 space-y-4">
          {course.modules.map((mod) => (
            <div key={mod.id}>
              <p className="px-2 text-xs font-bold uppercase tracking-wide text-[var(--foreground-muted)]">
                {mod.title}
              </p>
              <ul className="mt-1 space-y-0.5">
                {mod.lessons.map((l) => (
                  <li key={l.id}>
                    <Link
                      href={`/learn/${slug}?lesson=${l.id}`}
                      className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        activeLesson?.id === l.id ?
                          "bg-[var(--primary)] text-white"
                        : "text-[var(--foreground-secondary)] hover:bg-[var(--primary-light)]"
                      }`}
                    >
                      {completedIds.has(l.id) ? "✓ " : ""}
                      {l.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {course.quizzes.length > 0 ?
          <div className="mt-6 border-t border-[var(--border)] pt-4">
            <p className="px-2 text-xs font-bold uppercase text-[var(--foreground-muted)]">Quizzes</p>
            {course.quizzes.map((q) => {
              const required = q.isEnabled && q._count.questions > 0;
              const passed = passedQuizIds.has(q.id);
              return (
              <Link
                key={q.id}
                href={q.isEnabled ? `/learn/${slug}/quiz/${q.id}` : "#"}
                className={`mt-2 block px-2 text-sm font-medium ${
                  q.isEnabled ?
                    "text-[var(--primary)] hover:underline"
                  : "cursor-not-allowed text-[var(--foreground-muted)]"
                }`}
                aria-disabled={!q.isEnabled}
              >
                {passed ? "✓ " : required && !passed ? "○ " : ""}
                {q.title} ({q._count.questions} questions)
                {passed ? " — passed" : ""}
                {!q.isEnabled ? " — disabled" : ""}
              </Link>
            );
            })}
          </div>
        : null}
        {allLessonsDone && quizzesRemaining > 0 ?
          <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
            All lessons complete. Pass {quizzesRemaining} remaining quiz
            {quizzesRemaining === 1 ? "" : "zes"} to finish the course.
          </p>
        : null}
      </aside>

      <div className="surface-card p-6 sm:p-8">
        {activeLesson ?
          <>
            <LessonViewTracker lessonId={activeLesson.id} courseSlug={slug} />
            <h1 className="text-2xl font-extrabold text-[var(--foreground)]">{activeLesson.title}</h1>
            {activeLesson.videoUrl ?
              <LessonVideo url={activeLesson.videoUrl} />
            : null}
            {activeLesson.pdfStorageKey ?
              <LessonPdfViewer lessonId={activeLesson.id} title={activeLesson.title} />
            : null}
            {activeLesson.content ?
              <div className="mt-6 whitespace-pre-wrap text-base leading-relaxed text-[var(--foreground-secondary)]">
                {activeLesson.content}
              </div>
            : null}
            {!completedIds.has(activeLesson.id) ?
              <form
                action={markLessonCompleteAction.bind(null, activeLesson.id, slug)}
                className="mt-8"
              >
                <Button type="submit" size="lg">
                  Mark as complete
                </Button>
              </form>
            : <Badge variant="success" className="mt-8">
                ✓ Lesson completed
              </Badge>
            }
          </>
        : <p className="text-[var(--foreground-muted)]">No lessons in this course yet.</p>}
      </div>
    </div>
  );
}
