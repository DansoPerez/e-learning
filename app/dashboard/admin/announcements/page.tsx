import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";
import { deleteAnnouncementAction } from "@/app/actions/admin";
import { AnnouncementPanel } from "@/components/announcements/announcement-panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { scopeLabel } from "@/lib/announcement-labels";
import { formatDate } from "@/lib/utils";
import { getAnnouncementsForUser } from "@/lib/announcements";
import { Trash2 } from "lucide-react";

export default async function AdminAnnouncementsPage() {
  const admin = await requireRole("ADMIN");

  const [allAnnouncements, myFeed] = await Promise.all([
    prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true, email: true } },
        _count: { select: { reads: true } },
      },
    }),
    getAnnouncementsForUser(admin.id, "ADMIN"),
  ]);

  return (
    <DashboardWrapper role="ADMIN" title="Announcements">
      <p className="mb-6 text-sm text-[var(--foreground-muted)]">
        <Link href="/dashboard/admin" className="font-semibold text-[var(--primary)] hover:underline">
          ← Back to overview
        </Link>{" "}
        to publish a new announcement.
      </p>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-bold text-[var(--foreground)]">All announcements</h2>
        {allAnnouncements.length === 0 ?
          <p className="text-sm text-[var(--foreground-muted)]">No announcements published yet.</p>
        : <div className="space-y-3">
            {allAnnouncements.map((a) => (
              <div key={a.id} className="surface-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="info">{scopeLabel(a.scope)}</Badge>
                      <span className="text-xs text-[var(--foreground-muted)]">
                        {formatDate(a.createdAt)} · {a.author.name ?? a.author.email}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[var(--foreground-secondary)] whitespace-pre-wrap">
                      {a.message}
                    </p>
                    <p className="mt-2 text-xs text-[var(--foreground-muted)]">
                      Seen by {a._count.reads} user{a._count.reads === 1 ? "" : "s"}
                    </p>
                  </div>
                  <form action={deleteAnnouncementAction.bind(null, a.id)} className="w-full sm:w-auto">
                    <Button type="submit" variant="danger" size="sm" className="min-h-[44px] w-full gap-1.5 sm:w-auto">
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        }
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold text-[var(--foreground)]">Your feed</h2>
        <p className="mb-3 text-sm text-[var(--foreground-muted)]">
          Announcements visible to you as admin (all audiences).
        </p>
        <AnnouncementPanel announcements={myFeed} showScope />
      </section>
    </DashboardWrapper>
  );
}
