import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { canAccessConversation } from "@/lib/messaging";
import { InstructorDashboardWrapper } from "@/components/layout/instructor-dashboard-wrapper";
import { ChatThread } from "@/components/messages/chat-thread";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

export default async function InstructorConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("INSTRUCTOR", "ADMIN");
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

  if (
    !conversation ||
    (conversation.type !== "STUDENT_INSTRUCTOR" && conversation.type !== "INSTRUCTOR_ADMIN")
  ) {
    notFound();
  }

  const allowed = await canAccessConversation(user.id, user.role, conversation);
  if (!allowed) notFound();

  const isAdminSupport = conversation.type === "INSTRUCTOR_ADMIN";
  const peerName =
    isAdminSupport ?
      conversation.other.name ?? "Admin"
    : conversation.student.name ?? conversation.student.email;

  return (
    <InstructorDashboardWrapper title={isAdminSupport ? "Admin support" : "Conversation"}>
      <Link
        href="/dashboard/instructor/messages"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        All messages
      </Link>

      <div className="surface-card mb-4 p-4">
        <p className="font-bold">{peerName}</p>
        <Badge variant={isAdminSupport ? "info" : "default"} className="mt-1">
          {isAdminSupport ? "Admin support" : "Student"}
        </Badge>
        {conversation.course ?
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">
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
    </InstructorDashboardWrapper>
  );
}
