import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";
import { ChatThread } from "@/components/messages/chat-thread";
import { MessageList } from "@/components/messages/message-list";
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
        include: {
          sender: {
            select: { id: true, name: true, role: true, userCode: true },
          },
        },
      },
    },
  });

  if (!conversation) notFound();

  const canReply =
    conversation.type === "STUDENT_ADMIN" || conversation.type === "INSTRUCTOR_ADMIN";

  const badgeLabel =
    conversation.type === "STUDENT_ADMIN" ?
      "Student ↔ Admin"
    : conversation.type === "INSTRUCTOR_ADMIN" ?
      "Instructor ↔ Admin"
    : "Student ↔ Instructor";

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
          {conversation.type === "INSTRUCTOR_ADMIN" ?
            `${conversation.student.name ?? conversation.student.email} (instructor)`
          : conversation.student.name ?? conversation.student.email}
          <span className="font-normal text-[var(--foreground-muted)]"> ↔ </span>
          {conversation.type === "INSTRUCTOR_ADMIN" ?
            conversation.other.name ?? "Admin"
          : conversation.other.name ?? "User"}
        </p>
        <Badge
          variant={
            conversation.type === "STUDENT_ADMIN" ? "info"
            : conversation.type === "INSTRUCTOR_ADMIN" ? "success"
            : "warning"
          }
        >
          {badgeLabel}
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
          viewerIsAdmin
        />
      : <MessageList
          messages={conversation.messages}
          currentUserId={user.id}
          viewerIsAdmin
        />
      }
    </DashboardWrapper>
  );
}
