import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { markOffline } from "@/lib/presence";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await markOffline(session.user.id);
  return NextResponse.json({ ok: true });
}
