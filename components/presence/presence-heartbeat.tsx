"use client";

import { PRESENCE_HEARTBEAT_MS } from "@/lib/presence-utils";
import { useVisibleInterval } from "@/lib/use-visible-interval";

/** Ping server while logged in. Pauses when the tab is hidden. */
export function PresenceHeartbeat() {
  useVisibleInterval(async () => {
    try {
      await fetch("/api/presence/heartbeat", {
        method: "POST",
        cache: "no-store",
      });
    } catch {
      /* ignore transient network errors */
    }
  }, PRESENCE_HEARTBEAT_MS);

  return null;
}
