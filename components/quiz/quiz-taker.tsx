"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { startQuizAttemptAction, submitQuizAttemptAction } from "@/app/actions/quiz";

type Question = {
  id: string;
  question: string;
  type: string;
  options: string[] | null;
};

type AttemptSummary = {
  id: string;
  score: number;
  passed: boolean;
  endedAt: string | null;
};

export function QuizTaker({
  quizId,
  slug,
  title,
  durationMin,
  questions,
  passingScore,
  previousAttempts = [],
}: {
  quizId: string;
  slug: string;
  title: string;
  durationMin: number | null;
  questions: Question[];
  passingScore?: number;
  previousAttempts?: AttemptSummary[];
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [attemptToken, setAttemptToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await startQuizAttemptAction(quizId);
      if (cancelled) return;
      if ("error" in res && res.error) {
        setError(res.error);
        return;
      }
      if ("attemptToken" in res && res.attemptToken) {
        setAttemptToken(res.attemptToken);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [quizId]);

  const limitSec = durationMin && durationMin > 0 ? durationMin * 60 : null;
  const [secondsLeft, setSecondsLeft] = useState(limitSec);

  const answersRef = useRef(answers);
  const submittingRef = useRef(submitting);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  useEffect(() => {
    submittingRef.current = submitting;
  }, [submitting]);

  const submit = useCallback(async () => {
    if (submittingRef.current) return;
    if (!attemptToken) {
      setError("Quiz session is still loading. Please wait a moment.");
      return;
    }
    setSubmitting(true);
    submittingRef.current = true;
    setError(null);
    const res = await submitQuizAttemptAction(quizId, answersRef.current, attemptToken);
    setSubmitting(false);
    submittingRef.current = false;
    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }
    if ("score" in res && typeof res.score === "number") {
      setResult({ score: res.score, passed: !!res.passed });
    }
  }, [quizId, attemptToken]);

  useEffect(() => {
    if (!limitSec || !attemptToken) return;
    const tick = setInterval(() => {
      setSecondsLeft((s) => {
        if (s === null) return s;
        if (s <= 1) {
          clearInterval(tick);
          void submit();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [limitSec, attemptToken, submit]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submit();
  }

  const minutes =
    secondsLeft != null ? Math.floor(secondsLeft / 60) : 0;
  const seconds = secondsLeft != null ? secondsLeft % 60 : 0;
  const timeCritical = secondsLeft != null && secondsLeft <= 60;

  if (result) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Quiz complete</h1>
        <p className="mt-4 text-4xl font-bold text-[var(--primary)]">{result.score}%</p>
        <p className="mt-2">{result.passed ? "Passed!" : "Not passed — try again"}</p>
        <button
          type="button"
          onClick={() => router.push(`/learn/${slug}`)}
          className="mt-6 rounded-[var(--radius)] bg-[var(--primary)] px-4 py-2.5 font-semibold text-white shadow-[var(--shadow-primary)] hover:bg-[var(--primary-hover)]"
        >
          Back to course
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-2xl font-bold">{title}</h1>
        {limitSec != null ?
          <p
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold tabular-nums ${
              timeCritical ?
                "bg-red-100 text-red-800"
              : "bg-[var(--primary-light)] text-[var(--primary)]"
            }`}
          >
            {minutes}:{seconds.toString().padStart(2, "0")} left
          </p>
        : null}
      </div>
      {durationMin ?
        <p className="text-sm text-zinc-500">
          {durationMin} minute limit — quiz auto-submits when time runs out
        </p>
      : null}
      {typeof passingScore === "number" ?
        <p className="text-sm text-zinc-500">Pass mark: {passingScore}%</p>
      : null}
      {previousAttempts.length > 0 ?
        <div className="mt-6 rounded-xl border bg-white p-4">
          <h2 className="text-sm font-semibold text-zinc-700">Your previous attempts</h2>
          <ul className="mt-2 space-y-1.5">
            {previousAttempts.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-2 text-sm"
              >
                <span className="min-w-0 break-words text-zinc-500">
                  {a.endedAt ? new Date(a.endedAt).toLocaleString() : "—"}
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-medium tabular-nums">{a.score}%</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      a.passed ?
                        "bg-emerald-100 text-emerald-800"
                      : "bg-red-100 text-red-800"
                    }`}
                  >
                    {a.passed ? "Passed" : "Failed"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      : null}
      {error ?
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
      : null}
      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {questions.map((q, i) => (
          <fieldset key={q.id} className="rounded-xl border bg-white p-4">
            <legend className="break-words font-medium">
              {i + 1}. {q.question}
            </legend>
            {q.type === "TRUE_FALSE" ?
              <div className="mt-3 flex flex-wrap gap-4">
                {["true", "false"].map((opt) => (
                  <label key={opt} className="flex min-h-[44px] items-center gap-2 touch-manipulation">
                    <input
                      type="radio"
                      name={q.id}
                      value={opt}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                      required
                    />
                    {opt}
                  </label>
                ))}
              </div>
            : <div className="mt-3 space-y-2">
                {(q.options ?? []).map((opt) => (
                  <label key={opt} className="flex min-h-[44px] items-start gap-2 touch-manipulation">
                    <input
                      type="radio"
                      name={q.id}
                      value={opt}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                      required
                      className="mt-1 shrink-0"
                    />
                    <span className="break-words">{opt}</span>
                  </label>
                ))}
              </div>
            }
          </fieldset>
        ))}
        <button
          type="submit"
          disabled={!attemptToken || submitting || secondsLeft === 0}
          className="w-full rounded-[var(--radius)] bg-[var(--primary)] px-6 py-3 font-semibold text-white shadow-[var(--shadow-primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 sm:w-auto sm:py-2.5"
        >
          {submitting ? "Submitting…" : "Submit quiz"}
        </button>
      </form>
    </div>
  );
}
