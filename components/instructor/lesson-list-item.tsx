"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LessonForm, type LessonFormValues } from "@/components/instructor/lesson-form";
import { deleteLessonAction, updateLessonAction } from "@/app/actions/courses";

export function LessonListItem({
  courseId,
  moduleId,
  lesson,
  cloudinaryReady,
}: {
  courseId: string;
  moduleId: string;
  lesson: LessonFormValues & { id: string };
  cloudinaryReady: boolean;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <li className="rounded-lg border border-[var(--border)] bg-[var(--background-subtle)] p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium text-[var(--foreground)]">{lesson.title}</p>
          <p className="text-xs text-[var(--foreground-muted)]">
            Order {lesson.orderIndex}
            {lesson.durationMin ? ` · ${lesson.durationMin} min` : ""}
            {lesson.videoUrl ? " · video" : ""}
            {lesson.pdfStorageKey ? " · PDF" : ""}
            {lesson.content ? " · notes" : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => setEditing((v) => !v)}>
            {editing ? "Close" : "Edit"}
          </Button>
          <form action={deleteLessonAction.bind(null, courseId, lesson.id)}>
            <Button type="submit" size="sm" variant="danger">
              Delete
            </Button>
          </form>
        </div>
      </div>

      {editing ?
        <div className="mt-3">
          <LessonForm
            formId={`lesson-edit-${lesson.id}`}
            moduleId={moduleId}
            cloudinaryReady={cloudinaryReady}
            lesson={lesson}
            submitLabel="Save lesson"
            action={updateLessonAction.bind(null, courseId, lesson.id)}
            onCancel={() => setEditing(false)}
          />
        </div>
      : null}
    </li>
  );
}
