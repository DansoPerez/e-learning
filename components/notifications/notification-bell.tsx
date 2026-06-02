"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/app/actions/notifications";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

export function NotificationBell({ pollIntervalMs = 20_000 }: { pollIntervalMs?: number }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    try {
      const [pollRes, listRes] = await Promise.all([
        fetch("/api/dashboard/poll", { cache: "no-store" }),
        fetch("/api/notifications", { cache: "no-store" }),
      ]);
      if (pollRes.ok) {
        const poll = await pollRes.json();
        setUnread(poll.unreadNotifications ?? 0);
      }
      if (listRes.ok) {
        const data = await listRes.json();
        setItems(data.notifications ?? []);
      }
    } catch {
      /* ignore network errors during poll */
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, pollIntervalMs);
    return () => clearInterval(id);
  }, [load, pollIntervalMs]);

  async function onMarkRead(id: string, link: string | null) {
    await markNotificationReadAction(id);
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)),
    );
    setUnread((c) => Math.max(0, c - 1));
    if (link) window.location.href = link;
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative z-[80] flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 text-[var(--foreground-secondary)] hover:bg-[var(--primary-light)] touch-manipulation"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 ?
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        : null}
      </button>

      {open ?
        <div className="absolute right-0 z-[80] mt-2 w-[min(100vw-2rem,20rem)] rounded-xl border border-[var(--border)] bg-white shadow-xl sm:w-80">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <span className="text-sm font-semibold">Notifications</span>
            <button
              type="button"
              className="text-xs text-[var(--primary)] hover:underline"
              onClick={async () => {
                await markAllNotificationsReadAction();
                setUnread(0);
                setItems((prev) =>
                  prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })),
                );
              }}
            >
              Mark all read
            </button>
          </div>
          <ul className="max-h-72 overflow-y-auto">
            {items.length === 0 ?
              <li className="px-3 py-6 text-center text-sm text-[var(--foreground-muted)]">
                No notifications yet
              </li>
            : items.map((n) => (
                <li key={n.id} className="border-b last:border-0">
                  <button
                    type="button"
                    className={`w-full px-3 py-2.5 text-left text-sm hover:bg-[var(--background)] ${
                      !n.readAt ? "bg-indigo-50/50" : ""
                    }`}
                    onClick={() => onMarkRead(n.id, n.link)}
                  >
                    <p className="font-medium">{n.title}</p>
                    {n.body ?
                      <p className="mt-0.5 line-clamp-2 text-xs text-[var(--foreground-muted)]">
                        {n.body}
                      </p>
                    : null}
                  </button>
                </li>
              ))
            }
          </ul>
        </div>
      : null}
    </div>
  );
}

export function LivePollBadge({
  href,
  label,
  pollKey,
  pollIntervalMs = 20_000,
}: {
  href: string;
  label: string;
  pollKey: "pendingInstructors" | "unreadMessages";
  pollIntervalMs?: number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch("/api/dashboard/poll", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setCount(data[pollKey] ?? 0);
        }
      } catch {
        /* ignore */
      }
    }
    poll();
    const id = setInterval(poll, pollIntervalMs);
    return () => clearInterval(id);
  }, [pollKey, pollIntervalMs]);

  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--foreground-secondary)] hover:bg-[var(--primary-light)]"
    >
      <span>{label}</span>
      {count > 0 ?
        <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
          {count}
        </span>
      : null}
    </Link>
  );
}
