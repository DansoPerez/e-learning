"use client";

import { markAllAnnouncementsReadAction, markAnnouncementReadAction } from "@/app/actions/announcements";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { scopeLabel } from "@/lib/announcement-labels";
import type { AnnouncementScope } from "@/app/generated/prisma/client";
import { formatDate } from "@/lib/utils";
import { Check, CheckCheck } from "lucide-react";

type AnnouncementItem = {
  id: string;
  message: string;
  scope: AnnouncementScope;
  courseTitle?: string | null;
  createdAt: Date;
  authorName: string;
  read: boolean;
};

export function AnnouncementPanel({
  announcements,
  showScope = false,
}: {
  announcements: AnnouncementItem[];
  showScope?: boolean;
}) {
  const unread = announcements.filter((a) => !a.read);

  if (announcements.length === 0) {
    return (
      <p className="text-sm text-[var(--foreground-muted)]">No announcements yet.</p>
    );
  }

  return (
    <div className="space-y-4">
      {unread.length > 0 ?
        <form action={markAllAnnouncementsReadAction}>
          <Button type="submit" variant="outline" size="sm" className="gap-1.5">
            <CheckCheck className="h-4 w-4" />
            Mark all as seen ({unread.length})
          </Button>
        </form>
      : null}

      <div className="space-y-3">
        {announcements.map((a) => (
          <div
            key={a.id}
            className={`rounded-xl border p-4 transition-colors ${
              a.read ?
                "border-[var(--border)] bg-[var(--card)]"
              : "border-indigo-200 bg-indigo-50/60"
            }`}
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {!a.read ?
                  <Badge variant="info">New</Badge>
                : <Badge variant="default">Seen</Badge>}
                {showScope ?
                  <Badge variant="default">{scopeLabel(a.scope)}</Badge>
                : null}
                <span className="text-xs text-[var(--foreground-muted)]">
                  {formatDate(a.createdAt)} · {a.authorName}
                  {a.courseTitle ? ` · ${a.courseTitle}` : ""}
                </span>
              </div>
              {!a.read ?
                <form action={markAnnouncementReadAction.bind(null, a.id)}>
                  <Button type="submit" variant="ghost" size="sm" className="gap-1 h-8">
                    <Check className="h-3.5 w-3.5" />
                    Mark seen
                  </Button>
                </form>
              : null}
            </div>
            <p className="text-sm text-[var(--foreground-secondary)] whitespace-pre-wrap">
              {a.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
