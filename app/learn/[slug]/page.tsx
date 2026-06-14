import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { hasCourseAccess } from "@/lib/services/enrollment";
import { markLessonCompleteAction } from "@/app/actions/learning";
import { getFirstUnpassedQuizId } from "@/lib/resume-lesson";
import { getPassedQuizIds } from "@/lib/course-completion";
import { LessonViewTracker } from "@/components/learn/lesson-view-tracker";
import { LearnPageLayout } from "@/components/learn/learn-curriculum";
import { LessonPdfViewer, LessonVideo } from "@/components/lessons/lesson-media";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function resolveResumeLessonId(
  lessonIds: string[],
  completedSet: Set<string>,
  lastLessonId: string | null | undefined,
  explicitLessonId?: string,
): string | null {
  if (explicitLessonId && lessonIds.includes(explicitLessonId)) {
    return explicitLessonId;
  }

  const firstIncomplete = lessonIds.find((id) => !completedSet.has(id));
  if (firstIncomplete) {
    if (lastLessonId && !completedSet.has(lastLessonId) && lessonIds.includes(lastLessonId)) {
      return lastLessonId;
    }
    return firstIncomplete;
  }

  return lessonIds[0] ?? null;
}

export default async function LearnPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lesson?: string }>;
}) {
  const [{ slug }, { lesson: lessonIdParam }] = await Promise.all([params, searchParams]);
  const user = await requireAuth();

  const course = await prisma.course.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      modules: {
        orderBy: { orderIndex: "asc" },
        select: {
          id: true,
          title: true,
          lessons: {
            orderBy: { orderIndex: "asc" },
            select: {
              id: true,
              title: true,
              videoUrl: true,
              pdfStorageKey: true,
              content: true,
            },
          },
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

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const lessonIds = allLessons.map((l) => l.id);
  const enabledQuizIds = course.quizzes
    .filter((q) => q.isEnabled && q._count.questions > 0)
    .map((q) => q.id);

  const [allowed, enrollment, progress, passedQuizIds] = await Promise.all([
    hasCourseAccess(user.id, course.id),
    prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: course.id } },
      select: { lastLessonId: true },
    }),
    lessonIds.length > 0 ?
      prisma.lessonProgress.findMany({
        where: { userId: user.id, lessonId: { in: lessonIds } },
        select: { lessonId: true, completed: true },
      })
    : Promise.resolve([]),
    getPassedQuizIds(user.id, enabledQuizIds),
  ]);

  if (!allowed) redirect(`/courses/${slug}`);

  const completedIds = new Set(
    progress.filter((p) => p.completed).map((p) => p.lessonId),
  );

  let resumeLessonId = resolveResumeLessonId(
    lessonIds,
    completedIds,
    enrollment?.lastLessonId,
    lessonIdParam,
  );

  if (!lessonIdParam && !resumeLessonId) {
    const nextQuizId = await getFirstUnpassedQuizId(user.id, course.id);
    if (nextQuizId) {
      redirect(`/learn/${slug}/quiz/${nextQuizId}`);
    }
  }

  const activeLesson =
    allLessons.find((l) => l.id === resumeLessonId) ?? allLessons[0];

  const allLessonsDone =
    allLessons.length > 0 && allLessons.every((l) => completedIds.has(l.id));
  const quizzesRemaining = enabledQuizIds.filter((id) => !passedQuizIds.has(id)).length;
  const progressPercent =
    allLessons.length > 0 ?
      Math.round((completedIds.size / allLessons.length) * 100)
    : 0;

  const activeIndex = activeLesson ? allLessons.findIndex((l) => l.id === activeLesson.id) : -1;
  const prevLesson = activeIndex > 0 ? allLessons[activeIndex - 1] : null;
  const nextLesson =
    activeIndex >= 0 && activeIndex < allLessons.length - 1 ?
      allLessons[activeIndex + 1]
    : null;

  const curriculum = {
    slug,
    courseTitle: course.title,
    modules: course.modules.map((mod) => ({
      id: mod.id,
      title: mod.title,
      lessons: mod.lessons.map((l) => ({ id: l.id, title: l.title })),
    })),
    quizzes: course.quizzes.map((q) => {
      const required = q.isEnabled && q._count.questions > 0;
      return {
        id: q.id,
        title: q.title,
        isEnabled: q.isEnabled,
        questionCount: q._count.questions,
        passed: passedQuizIds.has(q.id),
        required,
      };
    }),
    activeLessonId: activeLesson?.id,
    completedLessonIds: [...completedIds],
    allLessonsDone,
    quizzesRemaining,
    progressPercent,
  };

  return (
    <LearnPageLayout curriculum={curriculum}>
      <article className="surface-card overflow-hidden">
        {activeLesson ?
          <>
            <div className="border-b border-[var(--border)] bg-gradient-to-r from-[var(--primary-light)] to-white px-5 py-4 sm:px-8 sm:py-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                Lesson {activeIndex + 1} of {allLessons.length}
              </p>
              <LessonViewTracker lessonId={activeLesson.id} courseSlug={slug} />
              <h1 className="mt-1 break-words text-xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-2xl">
                {activeLesson.title}
              </h1>
            </div>
            <div className="p-5 sm:p-8">
              {activeLesson.videoUrl ?
                <LessonVideo url={activeLesson.videoUrl} />
              : null}
              {activeLesson.pdfStorageKey ?
                <LessonPdfViewer lessonId={activeLesson.id} title={activeLesson.title} />
              : null}
              {activeLesson.content ?
                <div className="prose-safe mt-6 whitespace-pre-wrap text-base leading-relaxed text-[var(--foreground-secondary)]">
                  {activeLesson.content}
                </div>
              : null}
              <div className="mt-8 flex flex-col gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  {prevLesson ?
                    <a
                      href={`/learn/${slug}?lesson=${prevLesson.id}`}
                      className="inline-flex min-h-[44px] items-center rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--foreground-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                    >
                      ← Previous
                    </a>
                  : null}
                  {nextLesson ?
                    <a
                      href={`/learn/${slug}?lesson=${nextLesson.id}`}
                      className="inline-flex min-h-[44px] items-center rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--foreground-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                    >
                      Next →
                    </a>
                  : null}
                </div>
                {!completedIds.has(activeLesson.id) ?
                  <form action={markLessonCompleteAction.bind(null, activeLesson.id, slug)}>
                    <Button type="submit" size="lg" className="w-full sm:w-auto">
                      Mark as complete
                    </Button>
                  </form>
                : <Badge variant="success" className="w-fit">
                    ✓ Lesson completed
                  </Badge>
                }
              </div>
            </div>
          </>
        : <p className="p-8 text-[var(--foreground-muted)]">No lessons in this course yet.</p>}
      </article>
    </LearnPageLayout>
  );
}
