import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUnreadNotificationCount } from "@/lib/notifications";

export async function GET() {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;
  const role = user.role;

  const [unreadNotifications, unreadMessages, pendingInstructors] = await Promise.all([
    getUnreadNotificationCount(userId),
    prisma.message.count({
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
    }),
    role === "ADMIN" ?
      prisma.instructorProfile.count({ where: { status: "PENDING" } })
    : Promise.resolve(0),
  ]);

  return NextResponse.json({
    unreadNotifications,
    unreadMessages,
    pendingInstructors,
    at: Date.now(),
  });
}
