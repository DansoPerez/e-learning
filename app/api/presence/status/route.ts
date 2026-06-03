import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isUserOnline } from "@/lib/presence-utils";
import { filterAllowedPresenceIds } from "@/lib/rate-limit";

/** Fresh presence for one or more users (comma-separated ids, max 50). */
export async function GET(req: Request) {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const ids = [...new Set(url.searchParams.get("ids")?.split(",").filter(Boolean) ?? [])].slice(
    0,
    50,
  );

  if (ids.length === 0) {
    return NextResponse.json({ users: {} });
  }

  const allowedIds = await filterAllowedPresenceIds(user.id, user.role, ids);

  const rows = await prisma.user.findMany({
    where: { id: { in: allowedIds } },
    select: { id: true, lastSeenAt: true },
  });

  const users: Record<
    string,
    { lastSeenAt: string | null; isOnline: boolean }
  > = {};

  for (const row of rows) {
    users[row.id] = {
      lastSeenAt: row.lastSeenAt?.toISOString() ?? null,
      isOnline: isUserOnline(row.lastSeenAt),
    };
  }

  return NextResponse.json(
    { users },
    { headers: { "Cache-Control": "no-store" } },
  );
}
