import { prisma } from "@/lib/prisma";

export async function logAudit(params: {
  actorId: string;
  action: string;
  targetType: string;
  targetId?: string;
  description: string;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: params.actorId,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      description: params.description,
    },
  });
}

/** @deprecated Use logAudit */
export async function logAdminAction(params: {
  adminId: string;
  action: string;
  targetType: string;
  targetId?: string;
  description: string;
}) {
  return logAudit({ ...params, actorId: params.adminId });
}
