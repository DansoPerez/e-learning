"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import {
  canAccessConversation,
  canSendInConversation,
  getSupportAdminId,
  studentCanMessageInstructor,
} from "@/lib/messaging";
import { z } from "zod";
import {
  notifyConversationParticipants,
} from "@/lib/notifications";
import { logAudit } from "@/lib/audit-log";

const messageSchema = z.object({
  body: z.string().min(1, "Message cannot be empty").max(5000),
});

function revalidateMessagePaths() {
  revalidatePath("/dashboard/student/messages");
  revalidatePath("/dashboard/instructor/messages");
  revalidatePath("/dashboard/admin/messages");
}

export async function sendMessageAction(
  conversationId: string,
  _prev: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const user = await requireAuth();
  const parsed = messageSchema.safeParse({ body: formData.get("body") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid message" };
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });
  if (!conversation) return { error: "Conversation not found" };

  const allowed = canSendInConversation(user.id, user.role, conversation);
  if (!allowed) return { error: "Access denied" };

  const body = parsed.data.body.trim();

  await prisma.message.create({
    data: {
      conversationId,
      senderId: user.id,
      body,
    },
  });
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  await notifyConversationParticipants(conversationId, user.id, body);
  await logAudit({
    actorId: user.id,
    action: "SEND_MESSAGE",
    targetType: "Message",
    targetId: conversationId,
    description: `Sent message in conversation ${conversationId}`,
  });

  revalidateMessagePaths();
  revalidatePath(`/dashboard/student/messages/${conversationId}`);
  revalidatePath(`/dashboard/instructor/messages/${conversationId}`);
  revalidatePath(`/dashboard/admin/messages/${conversationId}`);
  return {};
}

export async function startInstructorChatAction(
  instructorId: string,
  courseId: string,
): Promise<void> {
  const user = await requireRole("STUDENT", "ADMIN");

  const canMessage = await studentCanMessageInstructor(user.id, instructorId);
  if (!canMessage && user.role !== "ADMIN") {
    redirect("/dashboard/student/messages?error=not-enrolled");
  }

  const conversation = await prisma.conversation.upsert({
    where: {
      studentId_otherId_type: {
        studentId: user.id,
        otherId: instructorId,
        type: "STUDENT_INSTRUCTOR",
      },
    },
    create: {
      type: "STUDENT_INSTRUCTOR",
      studentId: user.id,
      otherId: instructorId,
      courseId,
    },
    update: { courseId, updatedAt: new Date() },
  });

  redirect(`/dashboard/student/messages/${conversation.id}`);
}

export async function startSupportChatAction(): Promise<void> {
  const user = await requireRole("STUDENT", "ADMIN");
  const adminId = await getSupportAdminId();
  if (!adminId) {
    redirect("/dashboard/student/messages?error=no-admin");
  }

  const conversation = await prisma.conversation.upsert({
    where: {
      studentId_otherId_type: {
        studentId: user.id,
        otherId: adminId,
        type: "STUDENT_ADMIN",
      },
    },
    create: {
      type: "STUDENT_ADMIN",
      studentId: user.id,
      otherId: adminId,
    },
    update: { updatedAt: new Date() },
  });

  redirect(`/dashboard/student/messages/${conversation.id}`);
}

export async function startInstructorSupportChatAction(): Promise<void> {
  const user = await requireRole("INSTRUCTOR");
  const adminId = await getSupportAdminId();
  if (!adminId) {
    redirect("/dashboard/instructor/messages?error=no-admin");
  }

  const conversation = await prisma.conversation.upsert({
    where: {
      studentId_otherId_type: {
        studentId: user.id,
        otherId: adminId,
        type: "INSTRUCTOR_ADMIN",
      },
    },
    create: {
      type: "INSTRUCTOR_ADMIN",
      studentId: user.id,
      otherId: adminId,
    },
    update: { updatedAt: new Date() },
  });

  redirect(`/dashboard/instructor/messages/${conversation.id}`);
}

/** Admin opens (or resumes) a support thread with an instructor. */
export async function startAdminInstructorChatAction(instructorId: string): Promise<void> {
  const admin = await requireRole("ADMIN");

  const instructor = await prisma.user.findFirst({
    where: {
      id: instructorId,
      role: "INSTRUCTOR",
      instructorProfile: { isNot: null },
    },
    select: { id: true },
  });

  if (!instructor) {
    redirect("/dashboard/admin/messages?error=not-instructor");
  }

  let conversation = await prisma.conversation.findFirst({
    where: { type: "INSTRUCTOR_ADMIN", studentId: instructorId },
    orderBy: { updatedAt: "desc" },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        type: "INSTRUCTOR_ADMIN",
        studentId: instructorId,
        otherId: admin.id,
      },
    });
    await logAudit({
      actorId: admin.id,
      action: "START_CONVERSATION",
      targetType: "Conversation",
      targetId: conversation.id,
      description: `Started instructor support chat with ${instructorId}`,
    });
  } else {
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });
  }

  redirect(`/dashboard/admin/messages/${conversation.id}`);
}

export async function deleteMessageAction(messageId: string): Promise<{ error?: string }> {
  const user = await requireAuth();

  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: { conversation: true },
  });
  if (!message) return { error: "Message not found" };
  if (message.senderId !== user.id && user.role !== "ADMIN") {
    return { error: "You can only delete your own messages" };
  }
  if (message.deletedAt) return {};

  await prisma.message.update({
    where: { id: messageId },
    data: { deletedAt: new Date() },
  });

  await logAudit({
    actorId: user.id,
    action: "DELETE_MESSAGE",
    targetType: "Message",
    targetId: messageId,
    description: `Soft-deleted message in conversation ${message.conversationId}`,
  });

  revalidateMessagePaths();
  revalidatePath(`/dashboard/student/messages/${message.conversationId}`);
  revalidatePath(`/dashboard/instructor/messages/${message.conversationId}`);
  revalidatePath(`/dashboard/admin/messages/${message.conversationId}`);
  return {};
}
