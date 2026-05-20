import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";
import { UserFilters } from "@/components/admin/user-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, UserCog } from "lucide-react";
import type { Role, UserStatus } from "@/app/generated/prisma/client";

const STATUSES: UserStatus[] = ["ACTIVE", "SUSPENDED", "BANNED"];
const ROLES: Role[] = ["STUDENT", "INSTRUCTOR", "ADMIN"];

function parseStatus(value?: string): UserStatus | undefined {
  return value && STATUSES.includes(value as UserStatus) ? (value as UserStatus) : undefined;
}

function parseRole(value?: string): Role | undefined {
  return value && ROLES.includes(value as Role) ? (value as Role) : undefined;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; role?: string }>;
}) {
  await requireRole("ADMIN");
  const { q, status: statusParam, role: roleParam } = await searchParams;
  const status = parseStatus(statusParam);
  const role = parseRole(roleParam);

  const users = await prisma.user.findMany({
    where: {
      ...(q ?
        {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
      ...(status ? { status } : {}),
      ...(role ? { role } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      _count: { select: { enrollments: true } },
    },
  });

  return (
    <DashboardWrapper role="ADMIN" title="User management">
      <div className="mb-6 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50 p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-[var(--primary)] p-2.5 text-white shadow-md">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-[var(--foreground)]">Super Admin control</p>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              Suspend, activate, ban, delete users, grant all-course access, change roles, and
              manage enrollments. Open a user for full controls.
            </p>
          </div>
        </div>
      </div>

      <UserFilters q={q} status={status} role={role} />

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-sm)]">
        {users.length === 0 ?
          <p className="p-8 text-center text-sm text-[var(--foreground-muted)]">
            No users match your filters.
          </p>
        : <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--background-subtle)]">
              <tr>
                <th className="p-4 font-semibold text-[var(--foreground-secondary)]">User</th>
                <th className="p-4 font-semibold text-[var(--foreground-secondary)]">Role</th>
                <th className="p-4 font-semibold text-[var(--foreground-secondary)]">Status</th>
                <th className="p-4 font-semibold text-[var(--foreground-secondary)]">Access</th>
                <th className="p-4 font-semibold text-[var(--foreground-secondary)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-indigo-50/30"
                >
                  <td className="p-4">
                    <p className="font-semibold text-[var(--foreground)]">{u.name ?? "—"}</p>
                    <p className="text-[var(--foreground-muted)]">{u.email}</p>
                  </td>
                  <td className="p-4">
                    <Badge variant={u.role === "ADMIN" ? "info" : "default"}>{u.role}</Badge>
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={
                        u.status === "ACTIVE" ? "success"
                        : u.status === "SUSPENDED" ? "warning"
                        : "danger"
                      }
                    >
                      {u.status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    {u.allCoursesAccess ?
                      <Badge variant="info">All courses</Badge>
                    : <span className="text-[var(--foreground-muted)]">
                        {u._count.enrollments} enrolled
                      </span>
                    }
                  </td>
                  <td className="p-4">
                    <Link href={`/dashboard/admin/users/${u.id}`}>
                      <Button variant="secondary" size="sm" className="gap-1.5">
                        <UserCog className="h-3.5 w-3.5" />
                        Manage
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>
    </DashboardWrapper>
  );
}
