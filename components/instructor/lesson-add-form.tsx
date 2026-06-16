"use client";

import { LessonForm } from "@/components/instructor/lesson-form";

export function LessonAddForm({
  moduleId,
  lessonCount,
  cloudinaryReady,
  action,
}: {
  moduleId: string;
  lessonCount: number;
  cloudinaryReady: boolean;
  action: (formData: FormData) => void;
}) {
  return (
    <div className="mt-4">
      <p className="mb-3 text-sm font-semibold text-[var(--foreground)]">Add lesson</p>
      <LessonForm
        formId={`lesson-add-${moduleId}`}
        moduleId={moduleId}
        cloudinaryReady={cloudinaryReady}
        action={action}
        submitLabel="Add lesson"
        defaultOrderIndex={lessonCount}
      />
    </div>
  );
}
