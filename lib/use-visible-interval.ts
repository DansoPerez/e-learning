"use client";

import { useEffect, useRef } from "react";

/** Run `fn` on an interval while the tab is visible. Set `enabled` false to skip. */
export function useVisibleInterval(
  fn: () => void | Promise<void>,
  intervalMs: number,
  enabled = true,
) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    if (!enabled) return;

    let timer: ReturnType<typeof setInterval> | null = null;

    function clearTimer() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function startTimer() {
      clearTimer();
      timer = setInterval(() => {
        void fnRef.current();
      }, intervalMs);
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        void fnRef.current();
        startTimer();
      } else {
        clearTimer();
      }
    }

    if (document.visibilityState === "visible") {
      void fnRef.current();
      startTimer();
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      clearTimer();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [intervalMs, enabled]);
}
