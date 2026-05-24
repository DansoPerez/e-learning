import { prisma } from "@/lib/prisma";
import { containsFilter } from "@/lib/prisma-search";
import { requireRole, getSessionUser } from "@/lib/auth";
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";
import { AuditLogFilters } from "@/components/admin/audit-log-filters";
import { formatDate } from "@/lib/utils";
import type { Prisma, Role } from "@/app/generated/prisma/client";

const ROLES: Role[] = ["STUDENT", "INSTRUCTOR", "ADMIN"];

function parseRole(value?: string): Role | undefined {
  return value && ROLES.includes(value as Role) ? (value as Role) : undefined;
}

function buildWhere(
  isSuperAdmin: boolean,
  q?: string,
  role?: Role,
  action?: string,
): Prisma.AuditLogWhereInput {
  const and: Prisma.AuditLogWhereInput[] = [];

  if (!isSuperAdmin) {
    and.push({ actor: { isSuperAdmin: false } });
  }
  if (role) {
    and.push({ actor: { role } });
  }
  if (action && containsFilter(action)) {
    and.push({ action: containsFilter(action) });
  }
  if (q && containsFilter(q)) {
    const match = containsFilter(q)!;
    and.push({
      OR: [
        { action: match },
        { description: match },
        { targetType: match },
        { actor: { userCode: match } },
        { actor: { name: match } },
        { actor: { email: match } },
      ],
    });
  }

  return and.length > 0 ? { AND: and } : {};
}

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; action?: string }>;
}) {
  await requireRole("ADMIN");
  const session = await getSessionUser();
  const isSuperAdmin = session?.isSuperAdmin ?? false;

  const { q, role: roleParam, action: actionParam } = await searchParams;
  const role = parseRole(roleParam);
  const action = actionParam?.trim() || undefined;

  const logs = await prisma.auditLog.findMany({
    where: buildWhere(isSuperAdmin, q?.trim() || undefined, role, action),
    include: {
      actor: {
        select: {
          name: true,
          email: true,
          userCode: true,
          role: true,
          isSuperAdmin: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const byUserCode = new Map<
    string,
    {
      userCode: string;
      name: string | null;
      role: string;
      logs: typeof logs;
    }
  >();

  for (const log of logs) {
    const code = log.actor.userCode ?? log.actorId.slice(0, 8);
    const group = byUserCode.get(code) ?? {
      userCode: code,
      name: log.actor.name,
      role: log.actor.role,
      logs: [],
    };
    group.logs.push(log);
    byUserCode.set(code, group);
  }

  const groups = [...byUserCode.values()].sort((a, b) =>
    a.userCode.localeCompare(b.userCode),
  );

  const hasFilters = !!(q?.trim() || role || action);

  return (
    <DashboardWrapper role="ADMIN" title="Audit logs">
      <p className="mb-4 text-sm text-[var(--foreground-muted)]">
        {isSuperAdmin ?
          "All platform activity grouped by user ID."
        : "Activity from students, instructors, and regular admins. Super admin logs are hidden."}
      </p>

      <AuditLogFilters q={q} role={role} action={action} />

      {hasFilters ?
        <p className="mb-4 text-sm text-[var(--foreground-secondary)]">
          {logs.length} matching event{logs.length === 1 ? "" : "s"}
          {logs.length >= 500 ? " (showing latest 500)" : ""}
        </p>
      : null}

      {groups.length === 0 ?
        <div className="surface-card p-8 text-center text-sm text-[var(--foreground-muted)]">
          {hasFilters ?
            "No audit logs match your search. Try different keywords or clear filters."
          : "No audit logs yet."}
        </div>
      : <div className="space-y-8">
          {groups.map((group) => (
            <section
              key={group.userCode}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
            >
              <header className="mb-4 border-b border-[var(--border)] pb-3">
                <h2 className="text-lg font-bold text-[var(--foreground)]">
                  {group.userCode}
                </h2>
                <p className="text-sm text-[var(--foreground-muted)]">
                  {group.name ?? "—"} · {group.role}
                  {group.logs[0]?.actor.isSuperAdmin ? " · Super admin" : ""} ·{" "}
                  {group.logs.length} events
                </p>
              </header>
              <div className="space-y-2">
                {group.logs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-sm"
                  >
                    <p className="font-medium">
                      {log.action} · {log.targetType}
                      {log.targetId ? ` · ${log.targetId.slice(0, 8)}` : ""}
                    </p>
                    <p className="text-[var(--foreground-muted)]">{log.description}</p>
                    <p className="mt-1 text-xs text-zinc-400">{formatDate(log.createdAt)}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      }
    </DashboardWrapper>
  );
}
