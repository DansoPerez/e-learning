import { prisma } from "@/lib/prisma";
import { getAdminRecord } from "@/lib/admin-permissions";

export function assertCanModifySelf(adminId: string, targetUserId: string) {
  if (adminId === targetUserId) {
    throw new Error("You cannot modify your own admin account from this panel");
  }
}

/** Blocks non–super-admins from managing super admins or other admins */
export async function assertCanManageUser(actorId: string, targetUserId: string) {
  assertCanModifySelf(actorId, targetUserId);

  const [actor, target] = await Promise.all([
    getAdminRecord(actorId),
    prisma.user.findUnique({
      where: { id: targetUserId },
      select: { role: true, isSuperAdmin: true, userCode: true },
    }),
  ]);

  if (!target) throw new Error("User not found");
  if (!actor) throw new Error("Admin account not found");

  if (target.isSuperAdmin && !actor.isSuperAdmin) {
    throw new Error("Only a super admin can manage this account");
  }

  if (target.role === "ADMIN" && !actor.isSuperAdmin) {
    throw new Error("Only a super admin can manage other admin accounts");
  }
}
