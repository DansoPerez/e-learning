"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitQuizAttemptAction } from "@/app/actions/quiz";

type Question = {
  id: string;
  question: string;
  type: string;
  options: string[] | null;
};

export function QuizTaker({
  quizId,
  slug,
  title,
  durationMin,
  questions,
}: {
  quizId: string;
  slug: string;
  title: string;
  durationMin: number | null;
  questions: Question[];
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [startedAt] = useState(() => new Date().toISOString());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await submitQuizAttemptAction(quizId, answers, startedAt);
    if ("error" in res && res.error) return;
    if ("score" in res && typeof res.score === "number") {
      setResult({ score: res.score, passed: !!res.passed });
    }
  }

  if (result) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Quiz complete</h1>
        <p className="mt-4 text-4xl font-bold text-indigo-600">{result.score}%</p>
        <p className="mt-2">{result.passed ? "Passed!" : "Not passed — try again"}</p>
        <button
          type="button"
          onClick={() => router.push(`/learn/${slug}`)}
          className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-white"
        >
          Back to course
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold">{title}</h1>
      {durationMin ?
        <p className="text-sm text-zinc-500">{durationMin} minute limit</p>
      : null}
      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {questions.map((q, i) => (
          <fieldset key={q.id} className="rounded-xl border bg-white p-4">
            <legend className="font-medium">
              {i + 1}. {q.question}
            </legend>
            {q.type === "TRUE_FALSE" ?
              <div className="mt-3 flex gap-4">
                {["true", "false"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2">
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
                  <label key={opt} className="flex items-center gap-2">
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
            }
          </fieldset>
        ))}
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-6 py-2 font-medium text-white hover:bg-indigo-700"
        >
          Submit quiz
        </button>
      </form>
    </div>
  );
}
