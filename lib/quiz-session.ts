import { createHmac, timingSafeEqual } from "crypto";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not configured");
  return secret;
}

/** Server-signed quiz start time (tamper-resistant). */
export function createQuizSessionToken(userId: string, quizId: string): string {
  const startedAt = Date.now();
  const payload = `${userId}:${quizId}:${startedAt}`;
  const sig = createHmac("sha256", getSecret()).update(payload).digest("hex");
  return Buffer.from(`${startedAt}.${sig}`).toString("base64url");
}

export function verifyQuizSessionToken(
  token: string,
  userId: string,
  quizId: string,
): Date | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const dot = decoded.lastIndexOf(".");
    if (dot < 0) return null;

    const startedAt = Number(decoded.slice(0, dot));
    const sig = decoded.slice(dot + 1);
    if (!Number.isFinite(startedAt) || startedAt <= 0 || !sig) return null;

    const payload = `${userId}:${quizId}:${startedAt}`;
    const expected = createHmac("sha256", getSecret()).update(payload).digest("hex");

    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

    const started = new Date(startedAt);
    if (Number.isNaN(started.getTime())) return null;
    if (started.getTime() > Date.now() + 5_000) return null;

    return started;
  } catch {
    return null;
  }
}
