import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { touchPresence } from "@/lib/presence";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await touchPresence(session.user.id);
  return NextResponse.json({ ok: true });
}
