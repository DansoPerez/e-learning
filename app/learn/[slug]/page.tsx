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
  };

  return (
    <LearnPageLayout curriculum={curriculum}>
      <div className="surface-card p-4 sm:p-6 lg:p-8">
        {activeLesson ?
          <>
            <LessonViewTracker lessonId={activeLesson.id} courseSlug={slug} />
            <h1 className="break-words text-xl font-extrabold text-[var(--foreground)] sm:text-2xl">
              {activeLesson.title}
            </h1>
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
            {!completedIds.has(activeLesson.id) ?
              <form
                action={markLessonCompleteAction.bind(null, activeLesson.id, slug)}
                className="mt-8"
              >
                <Button type="submit" size="lg" className="w-full sm:w-auto">
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
    </LearnPageLayout>
  );
}
