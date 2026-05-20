import { prisma } from "@/lib/prisma";
import type { Role } from "@/app/generated/prisma/client";

export async function getSupportAdminId(): Promise<string | null> {
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN", status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return admin?.id ?? null;
}

export async function canAccessConversation(
  userId: string,
  role: Role,
  conversation: { studentId: string; otherId: string; type: string },
): Promise<boolean> {
  if (role === "ADMIN") return true;
  if (conversation.studentId === userId || conversation.otherId === userId) return true;
  return false;
}

export function canSendInConversation(
  userId: string,
  role: Role,
  conversation: { studentId: string; otherId: string; type: string },
): boolean {
  if (role === "ADMIN" && conversation.type === "STUDENT_ADMIN") return true;
  if (conversation.studentId === userId || conversation.otherId === userId) return true;
  return false;
}

export async function studentCanMessageInstructor(
  studentId: string,
  instructorId: string,
): Promise<boolean> {
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId: studentId,
      course: { instructorId },
    },
  });
  return !!enrollment;
}
