import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/auth";
import { touchPresence } from "@/lib/presence";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";

export async function POST() {
  const user = await getApiUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await checkRateLimit(
    rateLimitKey("heartbeat", user.id),
    120,
    60_000,
  );
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  await touchPresence(user.id);
  return NextResponse.json({ ok: true });
}
