"use client";

import { useEffect, useRef } from "react";
import { trackLessonViewAction } from "@/app/actions/learning";

export function LessonViewTracker({
  lessonId,
  courseSlug,
}: {
  lessonId: string;
  courseSlug: string;
}) {
  const tracked = useRef<string | null>(null);

  useEffect(() => {
    if (tracked.current === lessonId) return;
    tracked.current = lessonId;
    void trackLessonViewAction(lessonId, courseSlug);
  }, [lessonId, courseSlug]);

  return null;
}
