import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth";
import {
  getEnrolledStudentsPresence,
  getPresenceUsersForSuperAdmin,
  isUserOnline,
} from "@/lib/presence";
import { getAdminRecord } from "@/lib/admin-permissions";

const noStore = { headers: { "Cache-Control": "no-store" } };

export async function GET() {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role === "ADMIN") {
    const record = await getAdminRecord(user.id);
    if (!record?.isSuperAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const users = await getPresenceUsersForSuperAdmin();
    const mapped = users.map((u) => ({
      ...u,
      lastSeenAt: u.lastSeenAt?.toISOString() ?? null,
      isOnline: isUserOnline(u.lastSeenAt),
    }));
    return NextResponse.json(
      {
        users: mapped,
        online: mapped.filter((u) => u.isOnline),
        offline: mapped.filter((u) => !u.isOnline),
      },
      noStore,
    );
  }

  if (user.role === "INSTRUCTOR") {
    const students = await getEnrolledStudentsPresence(user.id);
    const mapped = students.map((u) => ({
      ...u,
      lastSeenAt: u.lastSeenAt?.toISOString() ?? null,
      isOnline: isUserOnline(u.lastSeenAt),
    }));
    return NextResponse.json(
      {
        users: mapped,
        online: mapped.filter((u) => u.isOnline),
        offline: mapped.filter((u) => !u.isOnline),
      },
      noStore,
    );
  }

  return NextResponse.json({ users: [], online: [], offline: [] }, noStore);
}
