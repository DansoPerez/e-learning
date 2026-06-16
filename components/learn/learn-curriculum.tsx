"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export type LearnCurriculumModule = {
  id: string;
  title: string;
  lessons: { id: string; title: string }[];
};

export type LearnCurriculumQuiz = {
  id: string;
  title: string;
  isEnabled: boolean;
  questionCount: number;
  passed: boolean;
  required: boolean;
};

export type LearnCurriculumProps = {
  slug: string;
  courseTitle: string;
  modules: LearnCurriculumModule[];
  quizzes: LearnCurriculumQuiz[];
  activeLessonId: string | undefined;
  completedLessonIds: string[];
  allLessonsDone: boolean;
  quizzesRemaining: number;
  progressPercent?: number;
};

function CurriculumBody({
  slug,
  courseTitle,
  modules,
  quizzes,
  activeLessonId,
  completedLessonIds,
  allLessonsDone,
  quizzesRemaining,
  progressPercent = 0,
}: LearnCurriculumProps) {
  const completedSet = new Set(completedLessonIds);
  const totalLessons = modules.reduce((n, m) => n + m.lessons.length, 0);
  const completedCount = completedLessonIds.length;

  return (
    <>
      <Link
        href={`/courses/${slug}`}
        className="inline-flex items-center text-xs font-semibold text-[var(--primary)] hover:underline"
      >
        ← Back to course
      </Link>
      <h2 className="mt-2 break-words text-sm font-bold leading-snug text-[var(--foreground)]">
        {courseTitle}
      </h2>

      {totalLessons > 0 ?
        <div className="mt-3 rounded-sm bg-[var(--background-subtle)] p-3">
          <div className="flex items-center justify-between text-xs font-medium text-[var(--foreground-muted)]">
            <span>Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-[var(--primary)] transition-all"
              style={{ width: `${Math.max(progressPercent, 2)}%` }}
            />
          </div>
          <p className="mt-1.5 text-[10px] text-[var(--foreground-muted)]">
            {completedCount} of {totalLessons} lessons
          </p>
        </div>
      : null}

      <div className="mt-4 space-y-4">
        {modules.map((mod) => (
          <div key={mod.id}>
            <p className="px-1 text-[10px] font-bold uppercase tracking-widest text-[var(--foreground-muted)]">
              {mod.title}
            </p>
            <ul className="mt-1 space-y-0.5">
              {mod.lessons.map((l) => {
                const done = completedSet.has(l.id);
                const active = activeLessonId === l.id;
                return (
                  <li key={l.id}>
                    <Link
                      href={`/learn/${slug}?lesson=${l.id}`}
                      className={cn(
                        "flex items-start gap-2 rounded-sm px-2.5 py-2 text-sm font-medium transition-colors touch-manipulation",
                        active ?
                          "bg-[var(--primary)] text-white shadow-[var(--shadow-primary)]"
                        : "text-[var(--foreground-secondary)] hover:bg-[var(--primary-light)]",
                      )}
                    >
                      {done ?
                        <CheckCircle2
                          className={cn(
                            "mt-0.5 h-4 w-4 shrink-0",
                            active ? "text-white" : "text-emerald-500",
                          )}
                        />
                      : <Circle
                          className={cn(
                            "mt-0.5 h-4 w-4 shrink-0",
                            active ? "text-white/70" : "text-[var(--foreground-muted)]",
                          )}
                        />
                      }
                      <span className="min-w-0 break-words leading-snug">{l.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {quizzes.length > 0 ?
        <div className="mt-5 border-t border-[var(--border)] pt-4">
          <p className="px-1 text-[10px] font-bold uppercase tracking-widest text-[var(--foreground-muted)]">
            Quizzes
          </p>
          <ul className="mt-1 space-y-0.5">
            {quizzes.map((q) => (
              <li key={q.id}>
                <Link
                  href={q.isEnabled ? `/learn/${slug}/quiz/${q.id}` : "#"}
                  className={cn(
                    "flex items-start gap-2 rounded-sm px-2.5 py-2 text-sm font-medium",
                    q.isEnabled ?
                      "text-[var(--primary)] hover:bg-[var(--primary-light)]"
                    : "cursor-not-allowed text-[var(--foreground-muted)]",
                  )}
                  aria-disabled={!q.isEnabled}
                >
                  {!q.isEnabled ?
                    <Lock className="mt-0.5 h-4 w-4 shrink-0" />
                  : q.passed ?
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--foreground-muted)]" />
                  }
                  <span className="min-w-0 break-words leading-snug">
                    {q.title}
                    <span className="block text-[11px] font-normal text-[var(--foreground-muted)]">
                      {q.questionCount} questions
                      {q.passed ? " · Passed" : ""}
                      {!q.isEnabled ? " · Locked" : ""}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      : null}

      {allLessonsDone && quizzesRemaining > 0 ?
        <p className="mt-4 rounded-sm border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-900">
          All lessons complete. Pass {quizzesRemaining} remaining quiz
          {quizzesRemaining === 1 ? "" : "zes"} to finish the course.
        </p>
      : null}
    </>
  );
}

function LearnMobileLessonBar({ slug, modules, activeLessonId, completedLessonIds }: LearnCurriculumProps) {
  const completedSet = new Set(completedLessonIds);
  const lessons = modules.flatMap((m) => m.lessons);

  return (
    <nav
      className="fixed inset-x-0 top-[var(--mobile-header-offset)] z-40 border-b border-[var(--border)] bg-white/95 shadow-[var(--shadow-sm)] backdrop-blur-md lg:hidden"
      aria-label="Lessons"
    >
      <div className="flex gap-1 overflow-x-auto overscroll-x-contain px-4 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {lessons.map((l) => {
          const active = activeLessonId === l.id;
          const done = completedSet.has(l.id);
          return (
            <Link
              key={l.id}
              href={`/learn/${slug}?lesson=${l.id}`}
              className={cn(
                "inline-flex max-w-[10rem] shrink-0 items-center gap-1.5 rounded-sm px-2.5 py-2 text-xs font-semibold touch-manipulation",
                active ?
                  "bg-[var(--primary)] text-white"
                : "bg-[var(--background-subtle)] text-[var(--foreground-secondary)]",
              )}
            >
              {done ?
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
              : null}
              <span className="truncate">{l.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function LearnPageLayout({
  curriculum,
  children,
}: {
  curriculum: LearnCurriculumProps;
  children: ReactNode;
}) {
  return (
    <div className="learn-shell">
      <LearnMobileLessonBar {...curriculum} />
      <div className="h-11 lg:hidden" aria-hidden />

      <div className="mx-auto grid w-full max-w-[1400px] gap-4 px-4 py-4 lg:grid-cols-[minmax(240px,280px)_minmax(0,1fr)] lg:gap-6 lg:px-6 lg:py-5">
        <div className="min-w-0 lg:order-2">{children}</div>
        <aside className="hidden min-w-0 lg:order-1 lg:block">
          <div className="sticky top-[calc(var(--header-height)+1rem)] max-h-[calc(100dvh-var(--header-height)-2rem)] overflow-y-auto rounded-sm border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-sm)]">
            <CurriculumBody {...curriculum} />
          </div>
        </aside>
      </div>
    </div>
  );
}
