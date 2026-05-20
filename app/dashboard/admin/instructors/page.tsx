import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";
import {
  approveInstructorAction,
  freezeInstructorEarningsAction,
  reinstateInstructorAction,
  rejectInstructorAction,
  revokeInstructorAction,
  unfreezeInstructorEarningsAction,
  activateUserAction,
} from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function AdminInstructorsPage() {
  await requireRole("ADMIN");

  const profiles = await prisma.instructorProfile.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardWrapper role="ADMIN" title="Instructor management">
      <p className="mb-6 text-sm text-[var(--foreground-muted)]">
        Approve applications, revoke or reinstate instructors, and freeze earnings.{" "}
        <Link href="/dashboard/admin/users" className="font-semibold text-[var(--primary)] hover:underline">
          Open user management
        </Link>{" "}
        to suspend or activate accounts.
      </p>

      <div className="space-y-4">
        {profiles.map((p) => (
          <div key={p.id} className="surface-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex gap-4">
                {p.selfieUrl ?
                  <img
                    src={p.selfieUrl}
                    alt={`${p.user.name} verification selfie`}
                    className="h-24 w-24 shrink-0 rounded-xl border object-cover"
                  />
                : null}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-[var(--foreground)]">{p.user.name}</p>
                    <Badge
                      variant={
                        p.user.status === "ACTIVE" ? "success"
                        : p.user.status === "SUSPENDED" ? "warning"
                        : "danger"
                      }
                    >
                      {p.user.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-[var(--foreground-muted)]">{p.user.email}</p>
                  <p className="mt-2 text-sm text-[var(--foreground-secondary)]">
                    {p.expertise} · {p.experienceYears} years
                  </p>
                  {p.qualification ?
                    <p className="mt-1 text-xs text-[var(--foreground-muted)]">
                      Qualification: {p.qualification}
                    </p>
                  : null}
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--foreground-muted)]">{p.bio}</p>
                  {p.earningsFrozen ?
                    <Badge variant="warning" className="mt-2">
                      Earnings frozen
                    </Badge>
                  : null}
                </div>
              </div>
              <Badge
                variant={
                  p.status === "APPROVED" ? "success"
                  : p.status === "PENDING" ? "warning"
                  : "danger"
                }
              >
                {p.status}
              </Badge>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
              {p.status === "PENDING" ?
                <>
                  <form action={approveInstructorAction.bind(null, p.userId)}>
                    <Button type="submit" size="sm">
                      Approve
                    </Button>
                  </form>
                  <form
                    action={rejectInstructorAction.bind(
                      null,
                      p.userId,
                      "Does not meet criteria",
                    )}
                  >
                    <Button type="submit" variant="outline" size="sm">
                      Reject
                    </Button>
                  </form>
                </>
              : null}
              {(p.status === "REJECTED" || p.status === "REVOKED") ?
                <form action={reinstateInstructorAction.bind(null, p.userId)}>
                  <Button type="submit" size="sm">
                    Reinstate
                  </Button>
                </form>
              : null}
              {p.status === "APPROVED" ?
                <form action={revokeInstructorAction.bind(null, p.userId)}>
                  <Button type="submit" variant="danger" size="sm">
                    Revoke
                  </Button>
                </form>
              : null}
              {p.earningsFrozen ?
                <form action={unfreezeInstructorEarningsAction.bind(null, p.userId)}>
                  <Button type="submit" variant="outline" size="sm">
                    Unfreeze earnings
                  </Button>
                </form>
              : <form action={freezeInstructorEarningsAction.bind(null, p.userId)}>
                  <Button type="submit" variant="outline" size="sm">
                    Freeze earnings
                  </Button>
                </form>
              }
              {p.user.status !== "ACTIVE" ?
                <form action={activateUserAction.bind(null, p.userId)}>
                  <Button type="submit" variant="primary" size="sm">
                    Activate user
                  </Button>
                </form>
              : null}
              <Link href={`/dashboard/admin/users/${p.userId}`}>
                <Button variant="secondary" size="sm">
                  Full control
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </DashboardWrapper>
  );
}
