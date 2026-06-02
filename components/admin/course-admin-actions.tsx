"use client";

import {
  deleteCoursePermanentAction,
  hideCourseAction,
  unhideCourseAction,
} from "@/app/actions/admin";
import { ActionRow } from "@/components/ui/action-row";
import { Button } from "@/components/ui/button";

export function CourseAdminActions({
  courseId,
  status,
  title,
}: {
  courseId: string;
  status: string;
  title: string;
}) {
  function confirmPermanentDelete() {
    const ok = window.confirm(
      `Permanently delete "${title}"?\n\nThis removes all modules, lessons, enrollments, and quizzes. This cannot be undone.`,
    );
    if (!ok) return;
    const form = document.getElementById(`delete-course-${courseId}`) as HTMLFormElement | null;
    form?.requestSubmit();
  }

  return (
    <div className="border-t border-[var(--border)] pt-3">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
        Visibility
      </span>
      <ActionRow>
        {(status === "PUBLISHED" || status === "APPROVED") ?
          <form action={hideCourseAction.bind(null, courseId)}>
            <Button type="submit" variant="outline" size="sm" title="Hide from catalog (reversible)">
              Hide temporarily
            </Button>
          </form>
        : null}
        {status === "HIDDEN" ?
          <form action={unhideCourseAction.bind(null, courseId)}>
            <Button type="submit" size="sm" title="Show in catalog again">
              Unhide / publish
            </Button>
          </form>
        : null}
        <form id={`delete-course-${courseId}`} action={deleteCoursePermanentAction.bind(null, courseId)}>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={confirmPermanentDelete}
            title="Remove course and all content permanently"
          >
            Delete permanently
          </Button>
        </form>
      </ActionRow>
    </div>
  );
}
