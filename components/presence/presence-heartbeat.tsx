"use client";

import { useEffect } from "react";
import { PRESENCE_HEARTBEAT_MS } from "@/lib/presence-utils";

/** Ping server while logged in. Offline is determined by heartbeat timeout, not tab visibility. */
export function PresenceHeartbeat() {
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let hiddenIntervalId: ReturnType<typeof setInterval> | null = null;

    async function ping() {
      try {
        await fetch("/api/presence/heartbeat", {
          method: "POST",
          cache: "no-store",
        });
      } catch {
        /* ignore transient network errors */
      }
    }

    function clearTimers() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      if (hiddenIntervalId) {
        clearInterval(hiddenIntervalId);
        hiddenIntervalId = null;
      }
    }

    function startTimers() {
      clearTimers();
      void ping();

      if (document.visibilityState === "visible") {
        intervalId = setInterval(ping, PRESENCE_HEARTBEAT_MS);
      } else {
        // Slower pings in background so mobile tab switches do not show users offline
        hiddenIntervalId = setInterval(ping, PRESENCE_HEARTBEAT_MS * 2);
      }
    }

    function onVisibilityChange() {
      startTimers();
    }

    startTimers();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearTimers();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return null;
}
