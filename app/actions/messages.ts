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

  await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId,
        senderId: user.id,
        body: parsed.data.body.trim(),
      },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);

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
