"use client";

import { useEffect } from "react";
import { PRESENCE_HEARTBEAT_MS } from "@/lib/presence-utils";

function sendOfflineBeacon() {
  const body = new Blob([], { type: "application/json" });
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/presence/offline", body);
  } else {
    void fetch("/api/presence/offline", { method: "POST", keepalive: true });
  }
}

export function PresenceHeartbeat() {
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    async function ping() {
      if (document.visibilityState !== "visible") return;
      try {
        await fetch("/api/presence/heartbeat", { method: "POST" });
      } catch {
        /* ignore */
      }
    }

    function startInterval() {
      if (intervalId) return;
      void ping();
      intervalId = setInterval(ping, PRESENCE_HEARTBEAT_MS);
    }

    function stopInterval() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        startInterval();
      } else {
        stopInterval();
        sendOfflineBeacon();
      }
    }

    if (document.visibilityState === "visible") {
      startInterval();
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", sendOfflineBeacon);

    return () => {
      stopInterval();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", sendOfflineBeacon);
      sendOfflineBeacon();
    };
  }, []);

  return null;
}
