import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";
import { ChatThread } from "@/components/messages/chat-thread";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

export default async function AdminConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("ADMIN");
  const { id } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      student: { select: { name: true, email: true } },
      other: { select: { name: true, role: true } },
      course: { select: { title: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { id: true, name: true, role: true } } },
      },
    },
  });

  if (!conversation) notFound();

  const canReply = conversation.type === "STUDENT_ADMIN";

  return (
    <DashboardWrapper role="ADMIN" title={canReply ? "Support conversation" : "Conversation"}>
      <Link
        href="/dashboard/admin/messages"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        All conversations
      </Link>

      <div className="surface-card mb-4 p-4">
        <p className="font-bold">
          {conversation.student.name ?? conversation.student.email}
          <span className="font-normal text-[var(--foreground-muted)]"> ↔ </span>
          {conversation.other.name ?? "User"}
        </p>
        <Badge variant={conversation.type === "STUDENT_ADMIN" ? "info" : "warning"}>
          {conversation.type === "STUDENT_ADMIN" ? "Student ↔ Admin" : "Student ↔ Instructor"}
        </Badge>
        {conversation.course ?
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">
            Course: {conversation.course.title}
          </p>
        : null}
        {!canReply && conversation.type === "STUDENT_INSTRUCTOR" ?
          <p className="mt-3 text-sm text-amber-800">
            Viewing student–instructor chat. Only the student and instructor can send messages here.
          </p>
        : null}
      </div>

      {canReply ?
        <ChatThread
          conversationId={conversation.id}
          messages={conversation.messages}
          currentUserId={user.id}
        />
      : <div className="max-h-[28rem] space-y-3 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
          {conversation.messages.map((m) => (
            <div key={m.id} className="rounded-lg border border-[var(--border)] bg-white p-3 text-sm">
              <p className="text-xs font-semibold text-[var(--foreground-muted)]">
                {m.sender.name ?? "User"} ({m.sender.role})
              </p>
              <p className="mt-1 whitespace-pre-wrap">{m.body}</p>
            </div>
          ))}
        </div>
      }
    </DashboardWrapper>
  );
}
