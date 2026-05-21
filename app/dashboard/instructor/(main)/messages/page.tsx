import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { InstructorDashboardWrapper } from "@/components/layout/instructor-dashboard-wrapper";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { OnlineBadge } from "@/components/presence/online-badge";
import { InstructorOnlineStudentsPanel } from "@/components/presence/online-users-panel";

export default async function InstructorMessagesPage() {
  const user = await requireRole("INSTRUCTOR", "ADMIN");

  const conversations = await prisma.conversation.findMany({
    where: {
      type: "STUDENT_INSTRUCTOR",
      otherId: user.id,
    },
    orderBy: { updatedAt: "desc" },
    include: {
      student: {
        select: { name: true, email: true, userCode: true, lastSeenAt: true },
      },
      course: { select: { title: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return (
    <InstructorDashboardWrapper title="Messages">
      <p className="mb-6 text-sm text-[var(--foreground-muted)]">
        Private messages from students enrolled in your courses.
      </p>

      <InstructorOnlineStudentsPanel />

      {conversations.length === 0 ?
        <p className="text-sm text-[var(--foreground-muted)]">No student messages yet.</p>
      : <ul className="space-y-2">
          {conversations.map((c) => {
            const last = c.messages[0];
            return (
              <li key={c.id}>
                <Link
                  href={`/dashboard/instructor/messages/${c.id}`}
                  className="surface-card flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:border-indigo-200"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{c.student.name ?? c.student.email}</p>
                      <OnlineBadge lastSeenAt={c.student.lastSeenAt} />
                    </div>
                    <Badge variant="default" className="mt-1">
                      Student
                    </Badge>
                    {c.course ?
                      <p className="mt-1 text-xs text-[var(--foreground-muted)]">
                        Re: {c.course.title}
                      </p>
                    : null}
                    {last ?
                      <p className="mt-2 line-clamp-1 text-sm text-[var(--foreground-muted)]">
                        {last.body}
                      </p>
                    : null}
                  </div>
                  <span className="text-xs text-[var(--foreground-muted)]">
                    {formatDate(c.updatedAt)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      }
    </InstructorDashboardWrapper>
  );
}
