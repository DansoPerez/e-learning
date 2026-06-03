"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatLastSeen, isUserOnline } from "@/lib/presence-utils";

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
    <li className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${
              online ?
                "bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.6)]"
              : "border border-slate-300 bg-slate-100"
            }`}
          />
          <p className="truncate font-medium">{u.name ?? "User"}</p>
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

const PRESENCE_TICK_MS = 10_000;
const PRESENCE_POLL_MS = 20_000;

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

  useEffect(() => {
    load();
    const id = setInterval(load, pollMs);
    return () => clearInterval(id);
  }, [load, pollMs]);

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), PRESENCE_TICK_MS);
    return () => clearInterval(id);
  }, []);

  if (forbidden) return null;

  const online = users.filter((u) => isUserOnline(u.lastSeenAt, nowMs));
  const offline = users.filter((u) => !isUserOnline(u.lastSeenAt, nowMs));

  return (
    <section className="surface-card p-5">
      <h2 className="mb-4 font-bold text-[var(--foreground)]">User presence</h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-emerald-800">Online</h3>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
              {online.length}
            </span>
          </div>
          {online.length === 0 ?
            <p className="rounded-lg border border-dashed border-[var(--border)] px-3 py-6 text-center text-xs text-[var(--foreground-muted)]">
              No users online
            </p>
          : <ul className="max-h-52 space-y-2 overflow-y-auto">
              {online.map((u) => (
                <UserRow key={u.id} u={u} showRole nowMs={nowMs} />
              ))}
            </ul>
          }
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-600">Offline</h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
              {offline.length}
            </span>
          </div>
          {offline.length === 0 ?
            <p className="rounded-lg border border-dashed border-[var(--border)] px-3 py-6 text-center text-xs text-[var(--foreground-muted)]">
              No offline users in list
            </p>
          : <ul className="max-h-52 space-y-2 overflow-y-auto">
              {offline.map((u) => (
                <UserRow key={u.id} u={u} showRole nowMs={nowMs} />
              ))}
            </ul>
          }
        </div>
      </div>
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

  useEffect(() => {
    load();
    const id = setInterval(load, PRESENCE_POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), PRESENCE_TICK_MS);
    return () => clearInterval(id);
  }, []);

  const online = students.filter((s) => isUserOnline(s.lastSeenAt, nowMs));
  const offline = students.filter((s) => !isUserOnline(s.lastSeenAt, nowMs));
  const total = students.length;

  return (
    <section className="surface-card mb-6 p-4">
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
