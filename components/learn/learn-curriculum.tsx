"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, List, Lock, X } from "lucide-react";
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
  onNavigate,
}: LearnCurriculumProps & { onNavigate?: () => void }) {
  const completedSet = new Set(completedLessonIds);
  const totalLessons = modules.reduce((n, m) => n + m.lessons.length, 0);
  const completedCount = completedLessonIds.length;

  return (
    <>
      <Link
        href={`/courses/${slug}`}
        className="inline-flex items-center text-xs font-semibold text-[var(--primary)] hover:underline"
        onClick={onNavigate}
      >
        ← Back to course
      </Link>
      <h2 className="mt-2 break-words text-sm font-bold leading-snug text-[var(--foreground)]">
        {courseTitle}
      </h2>

      {totalLessons > 0 ?
        <div className="mt-3 rounded-lg bg-[var(--background-subtle)] p-3">
          <div className="flex items-center justify-between text-xs font-medium text-[var(--foreground-muted)]">
            <span>Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-violet-500 transition-all"
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
                      onClick={onNavigate}
                      className={cn(
                        "flex items-start gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors touch-manipulation",
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
                  onClick={onNavigate}
                  className={cn(
                    "flex items-start gap-2 rounded-lg px-2.5 py-2 text-sm font-medium",
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
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-900">
          All lessons complete. Pass {quizzesRemaining} remaining quiz
          {quizzesRemaining === 1 ? "" : "zes"} to finish the course.
        </p>
      : null}
    </>
  );
}

export function LearnPageLayout({
  curriculum,
  children,
}: {
  curriculum: LearnCurriculumProps;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="learn-shell">
      <div className="sticky top-[var(--header-height)] z-30 border-b border-[var(--border)] bg-white/95 backdrop-blur-sm lg:hidden">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-2.5">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] shadow-[var(--shadow-sm)] touch-manipulation"
          >
            <List className="h-5 w-5 shrink-0" />
            Course contents
          </button>
          {curriculum.progressPercent !== undefined ?
            <span className="shrink-0 text-xs font-bold text-[var(--primary)]">
              {curriculum.progressPercent}%
            </span>
          : null}
        </div>
      </div>

      {open ?
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close course contents"
            onClick={close}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(100%,320px)] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
              <p className="font-bold text-[var(--foreground)]">Course contents</p>
              <button
                type="button"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-[var(--foreground-muted)] hover:bg-[var(--background-subtle)] touch-manipulation"
                aria-label="Close"
                onClick={close}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain p-4">
              <CurriculumBody {...curriculum} onNavigate={close} />
            </div>
          </aside>
        </div>
      : null}

      <div className="mx-auto grid w-full max-w-[1400px] gap-4 px-4 py-4 lg:grid-cols-[minmax(240px,280px)_minmax(0,1fr)] lg:gap-6 lg:px-6 lg:py-5">
        <aside className="hidden lg:block">
          <div className="sticky top-[calc(var(--header-height)+1rem)] max-h-[calc(100dvh-var(--header-height)-2rem)] overflow-y-auto rounded-xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-sm)]">
            <CurriculumBody {...curriculum} />
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
