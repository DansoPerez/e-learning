import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { canAccessConversation } from "@/lib/messaging";
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";
import { ChatThread } from "@/components/messages/chat-thread";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

export default async function StudentConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("STUDENT", "ADMIN");
  const { id } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
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
  const allowed = await canAccessConversation(user.id, user.role, conversation);
  if (!allowed) notFound();

  return (
    <DashboardWrapper role="STUDENT" title="Conversation">
      <Link
        href="/dashboard/student/messages"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        All messages
      </Link>

      <div className="surface-card mb-4 p-4">
        <p className="font-bold">{conversation.other.name ?? "User"}</p>
        <Badge variant={conversation.type === "STUDENT_ADMIN" ? "info" : "default"}>
          {conversation.type === "STUDENT_ADMIN" ? "Admin support" : "Instructor"}
        </Badge>
        {conversation.course ?
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">
            Course: {conversation.course.title}
          </p>
        : null}
      </div>

      <ChatThread
        conversationId={conversation.id}
        messages={conversation.messages}
        currentUserId={user.id}
        viewerIsAdmin={user.role === "ADMIN"}
      />
    </DashboardWrapper>
  );
}
