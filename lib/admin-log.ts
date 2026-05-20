import { prisma } from "@/lib/prisma";

export async function logAdminAction(params: {
  adminId: string;
  action: string;
  targetType: string;
  targetId?: string;
  description: string;
}) {
  await prisma.adminLog.create({
    data: {
      adminId: params.adminId,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      description: params.description,
    },
  });
}
