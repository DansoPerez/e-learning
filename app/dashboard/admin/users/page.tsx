import { prisma } from "@/lib/prisma";
import { containsFilter } from "@/lib/prisma-search";
import { requireRole, getSessionUser } from "@/lib/auth";
import { CreateAdminForm } from "@/components/admin/create-admin-form";
import { AdminUsersList } from "@/components/admin/admin-users-list";
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";
import { UserFilters } from "@/components/admin/user-filters";
import { Shield } from "lucide-react";
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
  const session = await getSessionUser();
  const { q, status: statusParam, role: roleParam } = await searchParams;
  const status = parseStatus(statusParam);
  const role = parseRole(roleParam);

  const users = await prisma.user.findMany({
    where: {
      ...(containsFilter(q ?? "") ?
        {
          OR: [
            { name: containsFilter(q ?? "") },
            { email: containsFilter(q ?? "") },
            { userCode: containsFilter(q ?? "") },
          ],
        }
      : {}),
      ...(status ? { status } : {}),
      ...(role ? { role } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      name: true,
      email: true,
      userCode: true,
      role: true,
      status: true,
      allCoursesAccess: true,
      isSuperAdmin: true,
      lastSeenAt: true,
      _count: { select: { enrollments: true } },
    },
  });

  const rows = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    userCode: u.userCode,
    role: u.role,
    status: u.status,
    allCoursesAccess: u.allCoursesAccess,
    isSuperAdmin: u.isSuperAdmin,
    lastSeenAt: u.lastSeenAt,
    enrollmentCount: u._count.enrollments,
  }));

  return (
    <DashboardWrapper role="ADMIN" title="User management">
      <div className="mb-6 rounded-sm border border-[var(--primary-muted)] bg-[var(--primary-light)] p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-[var(--primary)] p-2.5 text-white shadow-md">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-[var(--foreground)]">User management</p>
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              {session?.isSuperAdmin ?
                "Full control including super admins, sensitive access, and online users."
              : "Standard admin actions only. Sensitive tools require super admin approval."}
            </p>
          </div>
        </div>
      </div>

      {session?.isSuperAdmin ?
        <div className="mb-6">
          <CreateAdminForm />
        </div>
      : null}

      <UserFilters q={q} status={status} role={role} />

      <AdminUsersList
        users={rows}
        canManageUser={(u) => session?.isSuperAdmin || (!u.isSuperAdmin && u.role !== "ADMIN")}
      />
    </DashboardWrapper>
  );
}
