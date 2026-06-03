/** Visible-tab heartbeat interval */
export const PRESENCE_HEARTBEAT_MS = 30_000;
/** User stays online through missed pings + background tab (2× interval) */
export const ONLINE_WITHIN_MS = PRESENCE_HEARTBEAT_MS * 4 + 15_000; // 135s

export function onlineSinceDate(): Date {
  return new Date(Date.now() - ONLINE_WITHIN_MS);
}

export function parseLastSeenAt(
  value: Date | string | null | undefined,
): Date | null {
  if (value == null) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function isUserOnline(
  lastSeenAt: Date | string | null | undefined,
  nowMs: number = Date.now(),
): boolean {
  const seen = parseLastSeenAt(lastSeenAt);
  if (!seen) return false;
  return nowMs - seen.getTime() < ONLINE_WITHIN_MS;
}

export function formatLastSeen(
  lastSeenAt: Date | string | null | undefined,
  nowMs: number = Date.now(),
): string {
  const seen = parseLastSeenAt(lastSeenAt);
  if (!seen) return "never";
  if (isUserOnline(seen, nowMs)) return "now";

  const diffMs = nowMs - seen.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
