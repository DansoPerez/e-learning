import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth";
import { markOffline } from "@/lib/presence";

export async function POST() {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await markOffline(user.id);
  return NextResponse.json({ ok: true });
}
