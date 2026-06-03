import { prisma } from "@/lib/prisma";

/** Revoke all sessions after password change so old cookies cannot be reused. */
export async function invalidateUserSessions(userId: string) {
  await prisma.session.deleteMany({ where: { userId } });
}
