"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatLastSeen, isUserOnline, PRESENCE_POLL_MS } from "@/lib/presence-utils";
import { useVisibleInterval } from "@/lib/use-visible-interval";
import { Activity, Users } from "lucide-react";

type PresenceUser = {
  id: string;
  name: string | null;
  userCode: string | null;
  role: string;
  lastSeenAt: string | null;
  isOnline: boolean;
};

function UserRow({
  u,
  showRole,
  nowMs,
}: {
  u: PresenceUser;
  showRole?: boolean;
  nowMs: number;
}) {
  const online = isUserOnline(u.lastSeenAt, nowMs);
  return (
    <li className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--background-subtle)]/50 px-3 py-2.5 text-sm transition-colors hover:border-[var(--primary-muted)] hover:bg-white">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${
              online ?
                "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]"
              : "border border-slate-300 bg-slate-100"
            }`}
          />
          <p className="truncate font-medium text-[var(--foreground)]">{u.name ?? "User"}</p>
        </div>
        <p className="mt-0.5 font-mono text-xs text-[var(--primary)]">{u.userCode ?? "—"}</p>
        <p className="text-[10px] text-[var(--foreground-muted)]">
          {online ?
            "Online now"
          : `Last seen ${formatLastSeen(u.lastSeenAt, nowMs)}`}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        {showRole ?
          <Badge variant="default">{u.role}</Badge>
        : null}
        <Link
          href={`/dashboard/admin/users/${u.id}`}
          className="text-xs font-semibold text-[var(--primary)] hover:underline"
        >
          View
        </Link>
      </div>
    </li>
  );
}

const PRESENCE_TICK_MS = 30_000;

export function OnlineUsersPanel({
  pollMs = PRESENCE_POLL_MS,
}: {
  pollMs?: number;
}) {
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const [forbidden, setForbidden] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/presence/online", { cache: "no-store" });
      if (res.status === 403) {
        setForbidden(true);
        return;
      }
      if (!res.ok) return;
      const data = await res.json();
      const list: PresenceUser[] = data.users ?? [
        ...(data.online ?? []),
        ...(data.offline ?? []),
      ];
      setUsers(list);
      setForbidden(false);
    } catch {
      /* ignore */
    }
  }, []);

  useVisibleInterval(load, pollMs);

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), PRESENCE_TICK_MS);
    return () => clearInterval(id);
  }, []);

  if (forbidden) return null;

  const online = users.filter((u) => isUserOnline(u.lastSeenAt, nowMs));
  const offline = users.filter((u) => !isUserOnline(u.lastSeenAt, nowMs));

  return (
    <section className="surface-card p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary-light)] text-[var(--primary)]">
              <Activity className="h-4 w-4" />
            </span>
            <h2 className="font-bold text-[var(--foreground)]">Live activity</h2>
          </div>
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">
            Who&apos;s on the platform right now
          </p>
        </div>
        <div className="flex gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {online.length} online
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
            {offline.length} offline
          </span>
        </div>
      </div>

      {users.length === 0 ?
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] px-6 py-10 text-center">
          <Users className="h-8 w-8 text-[var(--foreground-muted)]" />
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">No users tracked yet</p>
        </div>
      : online.length === 0 ?
        <div className="space-y-3">
          <p className="rounded-lg border border-dashed border-emerald-200 bg-emerald-50/50 px-4 py-3 text-center text-sm text-emerald-800">
            No one is online right now — showing recent users below
          </p>
          <ul className="max-h-72 space-y-2 overflow-y-auto">
            {offline.map((u) => (
              <UserRow key={u.id} u={u} showRole nowMs={nowMs} />
            ))}
          </ul>
        </div>
      : <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
              Online now
            </h3>
            <ul className="max-h-52 space-y-2 overflow-y-auto">
              {online.map((u) => (
                <UserRow key={u.id} u={u} showRole nowMs={nowMs} />
              ))}
            </ul>
          </div>
          {offline.length > 0 ?
            <div>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                Recently offline
              </h3>
              <ul className="max-h-52 space-y-2 overflow-y-auto">
                {offline.slice(0, 8).map((u) => (
                  <UserRow key={u.id} u={u} showRole nowMs={nowMs} />
                ))}
              </ul>
            </div>
          : null}
        </div>
      }
    </section>
  );
}

export function InstructorOnlineStudentsPanel() {
  const [students, setStudents] = useState<PresenceUser[]>([]);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/presence/online", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const list: PresenceUser[] = data.users ?? [
        ...(data.online ?? []),
        ...(data.offline ?? []),
      ];
      setStudents(list);
    } catch {
      /* ignore */
    }
  }, []);

  useVisibleInterval(load, PRESENCE_POLL_MS);

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), PRESENCE_TICK_MS);
    return () => clearInterval(id);
  }, []);

  const online = students.filter((s) => isUserOnline(s.lastSeenAt, nowMs));
  const offline = students.filter((s) => !isUserOnline(s.lastSeenAt, nowMs));
  const total = students.length;

  return (
    <section className="surface-card mb-6 p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-[var(--foreground)]">
          Enrolled students — presence
        </h3>
        <span className="text-xs text-[var(--foreground-muted)]">
          {online.length} online · {offline.length} offline
          {total === 0 ? " · none enrolled" : ""}
        </span>
      </div>
      {total === 0 ?
        <p className="text-sm text-[var(--foreground-muted)]">
          No enrolled students to show yet.
        </p>
      : <div className="space-y-3">
          {online.length > 0 ?
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Online
              </p>
              <ul className="flex flex-wrap gap-2">
                {online.map((s) => (
                  <li
                    key={s.id}
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-900"
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {s.name ?? s.userCode ?? "Student"}
                  </li>
                ))}
              </ul>
            </div>
          : null}
          {offline.length > 0 ?
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Offline
              </p>
              <ul className="flex flex-wrap gap-2">
                {offline.map((s) => (
                  <li
                    key={s.id}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    <span className="h-2 w-2 rounded-full border border-slate-300 bg-slate-200" />
                    {s.name ?? s.userCode ?? "Student"}
                    <span className="text-[10px] text-slate-500">
                      ({formatLastSeen(s.lastSeenAt, nowMs)})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          : null}
        </div>
      }
    </section>
  );
}
