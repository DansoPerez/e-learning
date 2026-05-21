import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getUnreadNotificationCount } from "@/lib/notifications";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const role = session.user.role;

  const unreadNotifications = await getUnreadNotificationCount(userId);

  const unreadMessages = await prisma.message.count({
    where: {
      deletedAt: null,
      senderId: { not: userId },
      conversation: {
        OR: [{ studentId: userId }, { otherId: userId }],
      },
      createdAt: {
        gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    },
  });

  let pendingInstructors = 0;
  if (role === "ADMIN") {
    pendingInstructors = await prisma.instructorProfile.count({
      where: { status: "PENDING" },
    });
  }

  return NextResponse.json({
    unreadNotifications,
    unreadMessages,
    pendingInstructors,
    at: Date.now(),
  });
}
