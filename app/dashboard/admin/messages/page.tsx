import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default async function AdminMessagesPage() {
  await requireRole("ADMIN");

  const conversations = await prisma.conversation.findMany({
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      student: { select: { name: true, email: true } },
      other: { select: { name: true, role: true } },
      course: { select: { title: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return (
    <DashboardWrapper role="ADMIN" title="All conversations">
      <p className="mb-6 text-sm text-[var(--foreground-muted)]">
        View private chats between students and instructors, and student support requests.
      </p>

      {conversations.length === 0 ?
        <p className="text-sm text-[var(--foreground-muted)]">No conversations yet.</p>
      : <ul className="space-y-2">
          {conversations.map((c) => {
            const last = c.messages[0];
            const peerLabel =
              c.type === "STUDENT_ADMIN" ?
                `${c.other.name ?? "Admin"} (support)`
              : `${c.other.name ?? "Instructor"} (instructor)`;
            return (
              <li key={c.id}>
                <Link
                  href={`/dashboard/admin/messages/${c.id}`}
                  className="surface-card flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:border-indigo-200"
                >
                  <div>
                    <p className="font-semibold">
                      {c.student.name ?? c.student.email}
                      <span className="font-normal text-[var(--foreground-muted)]"> ↔ </span>
                      {peerLabel}
                    </p>
                    <Badge
                      variant={c.type === "STUDENT_ADMIN" ? "info" : "warning"}
                      className="mt-1"
                    >
                      {c.type === "STUDENT_ADMIN" ? "Student ↔ Admin" : "Student ↔ Instructor"}
                    </Badge>
                    {c.course ?
                      <p className="mt-1 text-xs text-[var(--foreground-muted)]">
                        Course: {c.course.title}
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
    </DashboardWrapper>
  );
}
