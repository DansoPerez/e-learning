"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { enrolledCourseGridClass } from "@/lib/course-grid";
import { EnrolledCourseCard } from "@/components/learning/enrolled-course-card";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export type MyLearningEnrollment = {
  id: string;
  progressPercent: number;
  lastLessonId: string | null;
  course: {
    slug: string;
    title: string;
    thumbnailUrl: string | null;
    category: { name: string } | null;
    instructor: { name: string | null };
  };
};

type Tab = "in-progress" | "completed";

export function MyLearningTabs({
  enrollments,
  emptyCta = "Explore courses",
}: {
  enrollments: MyLearningEnrollment[];
  emptyCta?: string;
}) {
  const [tab, setTab] = useState<Tab>("in-progress");

  const inProgress = enrollments.filter((e) => e.progressPercent < 100);
  const completed = enrollments.filter((e) => e.progressPercent >= 100);
  const visible = tab === "in-progress" ? inProgress : completed;

  return (
    <div>
      <div
        className="flex gap-1 border-b border-[var(--border)]"
        role="tablist"
        aria-label="Learning progress"
      >
        {(
          [
            { id: "in-progress" as const, label: "In progress", count: inProgress.length },
            { id: "completed" as const, label: "Completed", count: completed.length },
          ] as const
        ).map(({ id, label, count }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              "-mb-px border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors sm:px-4",
              tab === id ?
                "border-[var(--primary)] text-[var(--primary)]"
              : "border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]",
            )}
          >
            {label}
            <span className="ml-1.5 text-xs font-medium text-[var(--foreground-muted)]">
              ({count})
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6" role="tabpanel">
        {visible.length === 0 ?
          <div className="surface-card flex flex-col items-center justify-center px-6 py-12 text-center">
            <BookOpen className="h-10 w-10 text-[var(--primary-muted)]" />
            <p className="mt-3 text-sm text-[var(--foreground-muted)]">
              {tab === "in-progress" ?
                "No courses in progress. Enroll in a course to start learning."
              : "You have not completed any courses yet."}
            </p>
            {tab === "in-progress" ?
              <Link href="/courses" className="mt-4">
                <Button>{emptyCta}</Button>
              </Link>
            : null}
          </div>
        : <div className={enrolledCourseGridClass}>
            {visible.map((e) => (
              <EnrolledCourseCard
                key={e.id}
                slug={e.course.slug}
                title={e.course.title}
                thumbnailUrl={e.course.thumbnailUrl}
                category={e.course.category?.name}
                instructor={e.course.instructor.name}
                progressPercent={e.progressPercent}
                lastLessonId={e.lastLessonId}
                completed={e.progressPercent >= 100}
              />
            ))}
          </div>
        }
      </div>
    </div>
  );
}
