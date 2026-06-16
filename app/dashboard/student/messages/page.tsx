import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";
import { startInstructorChatAction, startSupportChatAction } from "@/app/actions/messages";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { MessageCircle, Headphones } from "lucide-react";

export default async function StudentMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireRole("STUDENT", "ADMIN");
  const { error } = await searchParams;

  const [conversations, enrollments] = await Promise.all([
    prisma.conversation.findMany({
      where: { studentId: user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        other: { select: { id: true, name: true, role: true } },
        course: { select: { title: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),
    prisma.enrollment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            instructor: { select: { id: true, name: true } },
          },
        },
      },
    }),
  ]);

  const instructorOptions = new Map<string, { instructorId: string; name: string; courseId: string; courseTitle: string }>();
  for (const e of enrollments) {
    instructorOptions.set(e.course.instructor.id, {
      instructorId: e.course.instructor.id,
      name: e.course.instructor.name ?? "Instructor",
      courseId: e.course.id,
      courseTitle: e.course.title,
    });
  }

  return (
    <DashboardWrapper role="STUDENT" title="Messages">
      {error === "not-enrolled" ?
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          You can only message instructors for courses you are enrolled in.
        </p>
      : null}

      <section className="surface-card mb-8 p-6">
        <h2 className="mb-4 font-semibold">Start a conversation</h2>
        <div className="flex flex-wrap gap-3">
          <form action={startSupportChatAction}>
            <Button type="submit" variant="primary" className="gap-2">
              <Headphones className="h-4 w-4" />
              Contact admin support
            </Button>
          </form>
        </div>
        {instructorOptions.size > 0 ?
          <div className="mt-6">
            <p className="mb-3 text-sm font-medium text-[var(--foreground-secondary)]">
              Message an instructor
            </p>
            <div className="flex flex-wrap gap-2">
              {[...instructorOptions.values()].map((opt) => (
                <form
                  key={opt.instructorId}
                  action={startInstructorChatAction.bind(
                    null,
                    opt.instructorId,
                    opt.courseId,
                  )}
                >
                  <Button type="submit" variant="outline" size="sm" className="gap-1.5">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {opt.name}
                  </Button>
                </form>
              ))}
            </div>
          </div>
        : <p className="mt-4 text-sm text-[var(--foreground-muted)]">
            Enroll in a course to message its instructor.
          </p>
        }
      </section>

      <section>
        <h2 className="mb-4 font-semibold">Your conversations</h2>
        {conversations.length === 0 ?
          <p className="text-sm text-[var(--foreground-muted)]">No conversations yet.</p>
        : <ul className="space-y-2">
            {conversations.map((c) => {
              const last = c.messages[0];
              return (
                <li key={c.id}>
                  <Link
                    href={`/dashboard/student/messages/${c.id}`}
                    className="surface-card flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:border-[var(--primary-muted)]"
                  >
                    <div>
                      <p className="font-semibold">{c.other.name ?? "User"}</p>
                      <Badge variant={c.type === "STUDENT_ADMIN" ? "info" : "default"} className="mt-1">
                        {c.type === "STUDENT_ADMIN" ? "Admin support" : "Instructor"}
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
    </DashboardWrapper>
  );
}
