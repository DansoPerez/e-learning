import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";
import { formatDate } from "@/lib/utils";

export default async function AdminLogsPage() {
  await requireRole("ADMIN");

  const logs = await prisma.adminLog.findMany({
    include: { admin: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <DashboardWrapper role="ADMIN" title="Audit logs">
      <div className="space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="rounded-lg border bg-white p-4 text-sm">
            <p className="font-medium">
              {log.action} · {log.targetType}
              {log.targetId ? ` #${log.targetId.slice(0, 8)}` : ""}
            </p>
            <p className="text-zinc-600">{log.description}</p>
            <p className="mt-1 text-xs text-zinc-400">
              {log.admin.name} · {formatDate(log.createdAt)}
            </p>
          </div>
        ))}
      </div>
    </DashboardWrapper>
  );
}
