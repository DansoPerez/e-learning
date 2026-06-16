import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { startAdminInstructorChatAction } from "@/app/actions/messages";
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { MessageCircle } from "lucide-react";

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRole("ADMIN");
  const { error } = await searchParams;

  const [conversations, instructors] = await Promise.all([
    prisma.conversation.findMany({
      orderBy: { updatedAt: "desc" },
      take: 100,
      include: {
        student: { select: { name: true, email: true } },
        other: { select: { name: true, role: true } },
        course: { select: { title: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),
    prisma.user.findMany({
      where: {
        role: "INSTRUCTOR",
        instructorProfile: { isNot: null },
      },
      select: {
        id: true,
        name: true,
        email: true,
        instructorProfile: { select: { status: true } },
      },
      orderBy: { name: "asc" },
      take: 100,
    }),
  ]);

  return (
    <DashboardWrapper role="ADMIN" title="All conversations">
      <p className="mb-6 text-sm text-[var(--foreground-muted)]">
        Reply to students and instructors, or start a new thread with an approved instructor below.
      </p>

      {error === "not-instructor" ?
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          That user is not an active instructor.
        </p>
      : null}

      <section className="surface-card mb-8 p-6">
        <h2 className="mb-2 font-semibold text-[var(--foreground)]">Message an instructor</h2>
        <p className="mb-4 text-sm text-[var(--foreground-muted)]">
          Open a support conversation with an instructor (they will see it under Messages → Admin
          support).
        </p>
        {instructors.length === 0 ?
          <p className="text-sm text-[var(--foreground-muted)]">No instructors yet.</p>
        : <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {instructors.map((i) => (
              <form
                key={i.id}
                action={startAdminInstructorChatAction.bind(null, i.id)}
                className="w-full sm:w-auto"
              >
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="min-h-[44px] w-full gap-2 sm:w-auto"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="truncate">
                    {i.name ?? i.email}
                    {i.instructorProfile?.status !== "APPROVED" ?
                      ` (${i.instructorProfile?.status ?? "pending"})`
                    : ""}
                  </span>
                </Button>
              </form>
            ))}
          </div>
        }
      </section>

      <h2 className="mb-4 text-lg font-bold text-[var(--foreground)]">Recent conversations</h2>

      {conversations.length === 0 ?
        <p className="text-sm text-[var(--foreground-muted)]">No conversations yet.</p>
      : <ul className="space-y-2">
          {conversations.map((c) => {
            const last = c.messages[0];
            const peerLabel =
              c.type === "STUDENT_ADMIN" ?
                `${c.other.name ?? "Admin"} (support)`
              : c.type === "INSTRUCTOR_ADMIN" ?
                `${c.other.name ?? "Admin"}`
              : `${c.other.name ?? "Instructor"} (instructor)`;
            const titleLine =
              c.type === "INSTRUCTOR_ADMIN" ?
                `${c.student.name ?? "Instructor"} ↔ ${c.other.name ?? "Admin"}`
              : `${c.student.name ?? c.student.email} ↔ ${peerLabel}`;
            const badgeLabel =
              c.type === "STUDENT_ADMIN" ?
                "Student ↔ Admin"
              : c.type === "INSTRUCTOR_ADMIN" ?
                "Instructor ↔ Admin"
              : "Student ↔ Instructor";
            return (
              <li key={c.id}>
                <Link
                  href={`/dashboard/admin/messages/${c.id}`}
                  className="surface-card flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:border-[var(--primary-muted)]"
                >
                  <div>
                    <p className="font-semibold">{titleLine}</p>
                    <Badge
                      variant={
                        c.type === "STUDENT_ADMIN" ? "info"
                        : c.type === "INSTRUCTOR_ADMIN" ? "success"
                        : "warning"
                      }
                      className="mt-1"
                    >
                      {badgeLabel}
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
