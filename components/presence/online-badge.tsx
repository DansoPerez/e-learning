"use client";

import { useEffect, useState } from "react";
import {
  formatLastSeen,
  ONLINE_WITHIN_MS,
  parseLastSeenAt,
} from "@/lib/presence-utils";
import { cn } from "@/lib/utils";

const TICK_MS = 15_000;

export function OnlineBadge({
  lastSeenAt,
  className,
  showLastSeen = true,
}: {
  lastSeenAt: Date | string | null | undefined;
  className?: string;
  showLastSeen?: boolean;
}) {
  const seen = parseLastSeenAt(lastSeenAt);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const online = seen != null && now - seen.getTime() < ONLINE_WITHIN_MS;
  const label = online ? "Online" : "Offline";
  const detail = showLastSeen ? formatLastSeen(seen, now) : null;

  return (
    <span className={cn("inline-flex flex-col gap-0.5", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-xs font-semibold",
          online ? "text-emerald-700" : "text-slate-600",
        )}
      >
        <span
          className={cn(
            "h-2 w-2 shrink-0 rounded-full",
            online ?
              "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]"
            : "border border-slate-300 bg-slate-200",
          )}
          aria-hidden
        />
        {label}
      </span>
      {showLastSeen && detail && !online ?
        <span className="text-[10px] font-normal text-[var(--foreground-muted)]">
          {detail === "never" ? "Never signed in" : `Last seen ${detail}`}
        </span>
      : null}
      {showLastSeen && online ?
        <span className="text-[10px] font-normal text-emerald-600/80">Active now</span>
      : null}
    </span>
  );
}
