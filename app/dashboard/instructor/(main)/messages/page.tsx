import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { startInstructorSupportChatAction } from "@/app/actions/messages";
import { InstructorDashboardWrapper } from "@/components/layout/instructor-dashboard-wrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { OnlineBadge } from "@/components/presence/online-badge";
import { InstructorOnlineStudentsPanel } from "@/components/presence/online-users-panel";
import { Headphones, MessageCircle } from "lucide-react";

function conversationLabel(type: string) {
  switch (type) {
    case "INSTRUCTOR_ADMIN":
      return "Admin support";
    case "STUDENT_INSTRUCTOR":
    default:
      return "Student";
  }
}

export default async function InstructorMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireRole("INSTRUCTOR", "ADMIN");
  const { error } = await searchParams;

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { type: "STUDENT_INSTRUCTOR", otherId: user.id },
        { type: "INSTRUCTOR_ADMIN", studentId: user.id },
      ],
    },
    orderBy: { updatedAt: "desc" },
    include: {
      student: {
        select: { name: true, email: true, userCode: true, lastSeenAt: true },
      },
      other: { select: { name: true, role: true } },
      course: { select: { title: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const studentChats = conversations.filter((c) => c.type === "STUDENT_INSTRUCTOR");
  const adminChats = conversations.filter((c) => c.type === "INSTRUCTOR_ADMIN");

  return (
    <InstructorDashboardWrapper title="Messages">
      {error === "no-admin" ?
        <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          No admin account is available for support right now. Try again later or email
          support@bravio.app.
        </p>
      : null}

      <section className="surface-card mb-8 p-6">
        <h2 className="mb-2 font-semibold">Contact admin</h2>
        <p className="mb-4 text-sm text-[var(--foreground-muted)]">
          Message the platform admin for support, to report an issue, or to flag content.
        </p>
        <form action={startInstructorSupportChatAction}>
          <Button type="submit" className="gap-2">
            <Headphones className="h-4 w-4" />
            Message admin support
          </Button>
        </form>
      </section>

      {adminChats.length > 0 ?
        <section className="mb-8">
          <h2 className="mb-4 font-semibold">Support conversations</h2>
          <ul className="space-y-2">
            {adminChats.map((c) => {
              const last = c.messages[0];
              return (
                <li key={c.id}>
                  <Link
                    href={`/dashboard/instructor/messages/${c.id}`}
                    className="surface-card flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:border-indigo-200"
                  >
                    <div>
                      <p className="font-semibold">{c.other.name ?? "Admin"}</p>
                      <Badge variant="info" className="mt-1">
                        Admin support
                      </Badge>
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
        </section>
      : null}

      <section>
        <h2 className="mb-2 font-semibold">Student messages</h2>
        <p className="mb-4 text-sm text-[var(--foreground-muted)]">
          Private messages from students enrolled in your courses.
        </p>

        <InstructorOnlineStudentsPanel />

        {studentChats.length === 0 ?
          <p className="mt-4 text-sm text-[var(--foreground-muted)]">
            <MessageCircle className="mr-1 inline h-4 w-4" />
            No student messages yet.
          </p>
        : <ul className="mt-4 space-y-2">
            {studentChats.map((c) => {
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
                        {conversationLabel(c.type)}
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
      </section>
    </InstructorDashboardWrapper>
  );
}
