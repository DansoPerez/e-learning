import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OnlineBadge } from "@/components/presence/online-badge";
import { UserCog } from "lucide-react";
import type { Role, UserStatus } from "@/app/generated/prisma/client";

export type AdminUserRow = {
  id: string;
  name: string | null;
  email: string;
  userCode: string | null;
  role: Role;
  status: UserStatus;
  allCoursesAccess: boolean;
  isSuperAdmin: boolean;
  lastSeenAt: Date | null;
  enrollmentCount: number;
};

export function AdminUsersList({
  users,
  canManageUser,
}: {
  users: AdminUserRow[];
  canManageUser: (user: AdminUserRow) => boolean;
}) {
  if (users.length === 0) {
    return (
      <p className="surface-card p-8 text-center text-sm text-[var(--foreground-muted)]">
        No users match your filters.
      </p>
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {users.map((u) => {
          const canOpen = canManageUser(u);
          return (
            <article key={u.id} className="surface-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[var(--foreground)]">{u.name ?? "—"}</p>
                  <p className="font-mono text-xs text-[var(--primary)]">{u.userCode ?? "—"}</p>
                  <p className="truncate text-sm text-[var(--foreground-muted)]">{u.email}</p>
                </div>
                <OnlineBadge lastSeenAt={u.lastSeenAt} userId={u.id} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant={u.role === "ADMIN" ? "info" : "default"}>{u.role}</Badge>
                <Badge
                  variant={
                    u.status === "ACTIVE" ? "success"
                    : u.status === "SUSPENDED" ? "warning"
                    : "danger"
                  }
                >
                  {u.status}
                </Badge>
                {u.isSuperAdmin ?
                  <Badge variant="info">Super admin</Badge>
                : null}
                {u.allCoursesAccess ?
                  <Badge variant="info">All courses</Badge>
                : null}
              </div>
              <p className="mt-2 text-xs text-[var(--foreground-muted)]">
                {u.allCoursesAccess ?
                  "Full catalog access"
                : `${u.enrollmentCount} enrollment${u.enrollmentCount === 1 ? "" : "s"}`}
              </p>
              {canOpen ?
                <Link href={`/dashboard/admin/users/${u.id}`} className="mt-4 block">
                  <Button variant="secondary" className="w-full gap-2">
                    <UserCog className="h-4 w-4" />
                    Manage user
                  </Button>
                </Link>
              : <p className="mt-4 text-center text-xs text-[var(--foreground-muted)]">
                  Protected account
                </p>}
            </article>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-sm)] md:block">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--background-subtle)]">
            <tr>
              <th className="p-4 font-semibold text-[var(--foreground-secondary)]">User</th>
              <th className="p-4 font-semibold text-[var(--foreground-secondary)]">Role</th>
              <th className="p-4 font-semibold text-[var(--foreground-secondary)]">Presence</th>
              <th className="p-4 font-semibold text-[var(--foreground-secondary)]">Status</th>
              <th className="p-4 font-semibold text-[var(--foreground-secondary)]">Access</th>
              <th className="p-4 font-semibold text-[var(--foreground-secondary)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const canOpen = canManageUser(u);
              return (
                <tr
                  key={u.id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-indigo-50/30"
                >
                  <td className="p-4">
                    <p className="font-semibold text-[var(--foreground)]">{u.name ?? "—"}</p>
                    <p className="font-mono text-xs text-[var(--primary)]">{u.userCode ?? "—"}</p>
                    <p className="text-[var(--foreground-muted)]">{u.email}</p>
                    {u.isSuperAdmin ?
                      <Badge variant="info" className="mt-1">Super admin</Badge>
                    : null}
                  </td>
                  <td className="p-4">
                    <Badge variant={u.role === "ADMIN" ? "info" : "default"}>{u.role}</Badge>
                  </td>
                  <td className="p-4">
                    <OnlineBadge lastSeenAt={u.lastSeenAt} userId={u.id} />
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
                        {u.enrollmentCount} enrolled
                      </span>
                    }
                  </td>
                  <td className="p-4">
                    {canOpen ?
                      <Link href={`/dashboard/admin/users/${u.id}`}>
                        <Button variant="secondary" size="sm" className="gap-1.5">
                          <UserCog className="h-3.5 w-3.5" />
                          Manage
                        </Button>
                      </Link>
                    : <span className="text-xs text-[var(--foreground-muted)]">Protected</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
