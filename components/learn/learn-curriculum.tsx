"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { List, X } from "lucide-react";

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
  onNavigate,
}: LearnCurriculumProps & { onNavigate?: () => void }) {
  const completedSet = new Set(completedLessonIds);

  return (
    <>
      <Link
        href={`/courses/${slug}`}
        className="text-sm font-semibold text-[var(--primary)] hover:underline"
        onClick={onNavigate}
      >
        ← Back to course
      </Link>
      <h2 className="mt-3 break-words font-bold text-[var(--foreground)]">{courseTitle}</h2>
      <div className="mt-4 space-y-4">
        {modules.map((mod) => (
          <div key={mod.id}>
            <p className="px-2 text-xs font-bold uppercase tracking-wide text-[var(--foreground-muted)]">
              {mod.title}
            </p>
            <ul className="mt-1 space-y-0.5">
              {mod.lessons.map((l) => (
                <li key={l.id}>
                  <Link
                    href={`/learn/${slug}?lesson=${l.id}`}
                    onClick={onNavigate}
                    className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors touch-manipulation ${
                      activeLessonId === l.id ?
                        "bg-[var(--primary)] text-white"
                      : "text-[var(--foreground-secondary)] hover:bg-[var(--primary-light)]"
                    }`}
                  >
                    {completedSet.has(l.id) ? "✓ " : ""}
                    {l.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {quizzes.length > 0 ?
        <div className="mt-6 border-t border-[var(--border)] pt-4">
          <p className="px-2 text-xs font-bold uppercase text-[var(--foreground-muted)]">Quizzes</p>
          {quizzes.map((q) => (
            <Link
              key={q.id}
              href={q.isEnabled ? `/learn/${slug}/quiz/${q.id}` : "#"}
              onClick={onNavigate}
              className={`mt-2 block break-words px-2 py-1 text-sm font-medium ${
                q.isEnabled ?
                  "text-[var(--primary)] hover:underline"
                : "cursor-not-allowed text-[var(--foreground-muted)]"
              }`}
              aria-disabled={!q.isEnabled}
            >
              {q.passed ? "✓ " : q.required && !q.passed ? "○ " : ""}
              {q.title} ({q.questionCount} questions)
              {q.passed ? " — passed" : ""}
              {!q.isEnabled ? " — disabled" : ""}
            </Link>
          ))}
        </div>
      : null}
      {allLessonsDone && quizzesRemaining > 0 ?
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
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
    <>
      <div className="sticky top-[var(--header-height)] z-30 border-b border-[var(--border)] bg-white/95 backdrop-blur-sm lg:hidden">
        <div className="page-container py-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] shadow-[var(--shadow-sm)] touch-manipulation"
          >
            <List className="h-5 w-5 shrink-0" />
            Course contents
          </button>
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
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4">
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

      <div className="page-container grid gap-6 py-6 sm:py-8 lg:grid-cols-[280px_1fr]">
        <aside className="surface-card hidden h-fit p-4 lg:sticky lg:top-24 lg:block">
          <CurriculumBody {...curriculum} />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </>
  );
}
