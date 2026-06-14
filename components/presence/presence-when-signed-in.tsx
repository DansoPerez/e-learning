"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { PresenceHeartbeat } from "@/components/presence/presence-heartbeat";

/** Presence pings only where they matter — not on every marketing page. */
export function PresenceWhenSignedIn() {
  const { status } = useSession();
  const pathname = usePathname();

  if (status !== "authenticated") return null;
  if (!pathname.startsWith("/dashboard") && !pathname.startsWith("/learn")) {
    return null;
  }

  return <PresenceHeartbeat />;
}
