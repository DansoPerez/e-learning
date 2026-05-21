import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getEnrolledStudentsPresence,
  getPresenceUsersForSuperAdmin,
  isUserOnline,
} from "@/lib/presence";
import { getAdminRecord } from "@/lib/admin-permissions";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "ADMIN") {
    const record = await getAdminRecord(session.user.id);
    if (!record?.isSuperAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const users = await getPresenceUsersForSuperAdmin();
    const mapped = users.map((u) => ({
      ...u,
      isOnline: isUserOnline(u.lastSeenAt),
    }));
    return NextResponse.json({
      users: mapped,
      online: mapped.filter((u) => u.isOnline),
      offline: mapped.filter((u) => !u.isOnline),
    });
  }

  if (session.user.role === "INSTRUCTOR") {
    const students = await getEnrolledStudentsPresence(session.user.id);
    const mapped = students.map((u) => ({
      ...u,
      isOnline: isUserOnline(u.lastSeenAt),
    }));
    return NextResponse.json({
      users: mapped,
      online: mapped.filter((u) => u.isOnline),
      offline: mapped.filter((u) => !u.isOnline),
    });
  }

  return NextResponse.json({ users: [], online: [], offline: [] });
}
