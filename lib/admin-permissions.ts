import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function getAdminRecord(adminId: string) {
  return prisma.user.findUnique({
    where: { id: adminId },
    select: {
      id: true,
      role: true,
      isSuperAdmin: true,
      adminSensitiveApproved: true,
      adminSensitiveSuspended: true,
      userCode: true,
    },
  });
}

export function canUseSensitiveAdminFeatures(admin: {
  isSuperAdmin: boolean;
  adminSensitiveApproved: boolean;
  adminSensitiveSuspended: boolean;
}): boolean {
  if (admin.isSuperAdmin) return true;
  return admin.adminSensitiveApproved && !admin.adminSensitiveSuspended;
}

export async function requireAdmin() {
  return requireRole("ADMIN");
}

export async function requireSuperAdmin() {
  const admin = await requireRole("ADMIN");
  const record = await getAdminRecord(admin.id);
  if (!record?.isSuperAdmin) {
    throw new Error("Super admin permission required");
  }
  return { ...admin, ...record };
}

export async function requireSensitiveAdmin() {
  const admin = await requireRole("ADMIN");
  const record = await getAdminRecord(admin.id);
  if (!record) throw new Error("Admin account not found");
  if (!canUseSensitiveAdminFeatures(record)) {
    throw new Error(
      record.adminSensitiveSuspended ?
        "Your sensitive admin access is suspended"
      : "Sensitive admin access requires super admin approval",
    );
  }
  return { ...admin, ...record };
}

export async function canCurrentAdminManageUser(
  actorId: string,
  target: { isSuperAdmin: boolean; role: string },
): Promise<boolean> {
  const actor = await getAdminRecord(actorId);
  if (!actor) return false;
  if (target.isSuperAdmin) return actor.isSuperAdmin;
  if (target.role === "ADMIN") return actor.isSuperAdmin;
  return true;
}
