import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import {
  canUseSensitiveAdminFeatures,
  getAdminRecord,
  canCurrentAdminManageUser,
} from "@/lib/admin-permissions";
import { OnlineBadge } from "@/components/presence/online-badge";
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";
import { AdminSection } from "@/components/admin/admin-section";
import { ActionRow } from "@/components/ui/action-row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  activateUserAction,
  banUserAction,
  enrollUserInCourseAction,
  freezeInstructorEarningsAction,
  grantAllCoursesAccessAction,
  reinstateInstructorAction,
  revokeAllCoursesAccessAction,
  revokeEnrollmentAction,
  revokeInstructorAction,
  restoreAdminSensitivePermissionsAction,
  suspendAdminSensitivePermissionsAction,
  suspendUserAction,
  unfreezeInstructorEarningsAction,
  updateUserRoleAction,
} from "@/app/actions/admin";
import { DeleteUserButton } from "@/components/admin/delete-user-button";
import { formatDate } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import type { Role } from "@/app/generated/prisma/client";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireRole("ADMIN");
  const { id } = await params;
  const isSelf = admin.id === id;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      userCode: true,
      role: true,
      status: true,
      allCoursesAccess: true,
      isSuperAdmin: true,
      adminSensitiveApproved: true,
      adminSensitiveSuspended: true,
      lastSeenAt: true,
      createdAt: true,
      instructorProfile: true,
      enrollments: {
        include: { course: { select: { id: true, title: true, slug: true, price: true } } },
        orderBy: { updatedAt: "desc" },
      },
      payments: {
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { course: { select: { title: true } } },
      },
    },
  });

  if (!user) notFound();

  const actorRecord = await getAdminRecord(admin.id);
  const canManage = await canCurrentAdminManageUser(admin.id, {
    isSuperAdmin: user.isSuperAdmin,
    role: user.role,
  });
  const canSensitive = actorRecord ? canUseSensitiveAdminFeatures(actorRecord) : false;

  const publishedCourses = await prisma.course.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, title: true, price: true },
    orderBy: { title: "asc" },
  });

  const enrolledIds = new Set(user.enrollments.map((e) => e.courseId));

  if (!canManage) {
    return (
      <DashboardWrapper role="ADMIN" title="Account protected">
        <Link
          href="/dashboard/admin/users"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to users
        </Link>
        <div className="surface-card p-8 text-center">
          <h2 className="text-xl font-bold text-[var(--foreground)]">Protected account</h2>
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">
            Only a super admin can manage{" "}
            {user.isSuperAdmin ? "super admin" : "admin"} accounts.
          </p>
          <p className="mt-4 font-mono text-sm text-[var(--primary)]">{user.userCode}</p>
        </div>
      </DashboardWrapper>
    );
  }

  return (
    <DashboardWrapper role="ADMIN" title="Manage user">
      <Link
        href="/dashboard/admin/users"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to users
      </Link>

      {!canSensitive ?
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          You do not have sensitive admin access. A super admin must approve you before you can
          change finances, delete users, or grant all-course access.
        </p>
      : null}

      <div className="surface-card mb-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-[var(--foreground)]">
              {user.name ?? "Unnamed user"}
            </h2>
            <p className="font-mono text-sm font-semibold text-[var(--primary)]">
              {user.userCode ?? "No user ID"}
            </p>
            <p className="text-[var(--foreground-muted)]">{user.email}</p>
            <p className="mt-2 text-xs text-[var(--foreground-muted)]">
              Joined {formatDate(user.createdAt)}
            </p>
            <div className="mt-2">
              <OnlineBadge lastSeenAt={user.lastSeenAt} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={user.role === "ADMIN" ? "info" : "default"}>{user.role}</Badge>
            <Badge
              variant={
                user.status === "ACTIVE" ? "success"
                : user.status === "SUSPENDED" ? "warning"
                : "danger"
              }
            >
              {user.status}
            </Badge>
            {user.allCoursesAccess ?
              <Badge variant="info">All courses access</Badge>
            : null}
            {user.role === "ADMIN" && user.isSuperAdmin ?
              <Badge variant="info">Super admin</Badge>
            : null}
            {user.role === "ADMIN" && !user.isSuperAdmin && user.adminSensitiveApproved ?
              <Badge variant="success">Sensitive access approved</Badge>
            : null}
            {user.role === "ADMIN" && !user.isSuperAdmin && !user.adminSensitiveApproved ?
              <Badge variant="warning">No sensitive access</Badge>
            : null}
            {user.role === "ADMIN" && user.adminSensitiveSuspended ?
              <Badge variant="danger">Sensitive access revoked</Badge>
            : null}
          </div>
        </div>
        {!isSelf && user.role === "ADMIN" && !user.isSuperAdmin && admin.isSuperAdmin ?
          <ActionRow className="mt-4">
            {user.adminSensitiveApproved && !user.adminSensitiveSuspended ?
              <form action={suspendAdminSensitivePermissionsAction.bind(null, user.id)}>
                <Button type="submit" size="sm" variant="outline">
                  Revoke sensitive access
                </Button>
              </form>
            : <form action={restoreAdminSensitivePermissionsAction.bind(null, user.id)}>
                <Button type="submit" size="sm" variant="primary">
                  Approve sensitive access
                </Button>
              </form>
            }
          </ActionRow>
        : null}
        {isSelf ?
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            This is your admin account. Status and role changes are disabled here for safety.
          </p>
        : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {!isSelf ?
          <AdminSection
            title="Account status"
            description="Suspend, activate, or ban this user. Suspended users cannot sign in."
          >
            <ActionRow>
              {user.status !== "ACTIVE" ?
                <form action={activateUserAction.bind(null, id)}>
                  <Button type="submit" variant="primary" size="sm">
                    Activate / Unsuspend
                  </Button>
                </form>
              : null}
              {user.status !== "SUSPENDED" ?
                <form action={suspendUserAction.bind(null, id)}>
                  <Button type="submit" variant="outline" size="sm">
                    Suspend
                  </Button>
                </form>
              : null}
              {user.status !== "BANNED" ?
                <form action={banUserAction.bind(null, id)}>
                  <Button type="submit" variant="danger" size="sm">
                    Ban user
                  </Button>
                </form>
              : null}
            </ActionRow>
          </AdminSection>
        : null}

        {!isSelf && canSensitive ?
          <AdminSection
            title="Delete account"
            description="Permanently remove this user and their courses, enrollments, and related records."
            className="lg:col-span-2"
          >
            <DeleteUserButton
              userId={id}
              userLabel={user.name ?? user.email}
            />
          </AdminSection>
        : null}

        {!isSelf ?
          <AdminSection title="Role" description="Change platform role for this user.">
            <ActionRow>
              {(
                [
                  "STUDENT",
                  "INSTRUCTOR",
                  ...(admin.isSuperAdmin ? ["ADMIN"] : []),
                ] as Role[]
              ).map((r) => (
                <form key={r} action={updateUserRoleAction.bind(null, id, r)}>
                  <Button
                    type="submit"
                    size="sm"
                    variant={user.role === r ? "primary" : "outline"}
                    disabled={user.role === r}
                  >
                    {r}
                  </Button>
                </form>
              ))}
            </ActionRow>
          </AdminSection>
        : null}

        {!isSelf && canSensitive && (user.role === "STUDENT" || user.allCoursesAccess) ?
          <AdminSection
            title="Course access"
            description="Grant access to every published course (free and paid) without payment."
            className="lg:col-span-2"
          >
            <ActionRow>
              {!user.allCoursesAccess ?
                <form action={grantAllCoursesAccessAction.bind(null, id)}>
                  <Button type="submit" variant="primary" size="sm">
                    Grant all courses access
                  </Button>
                </form>
              : <form action={revokeAllCoursesAccessAction.bind(null, id)}>
                  <Button type="submit" variant="danger" size="sm">
                    Revoke all courses access
                  </Button>
                </form>
              }
            </ActionRow>
            {user.allCoursesAccess ?
              <p className="mt-3 text-sm font-medium text-emerald-700">
                ✓ User can access and learn from all published courses without paying.
              </p>
            : null}
          </AdminSection>
        : null}

        {user.instructorProfile ?
          <AdminSection
            title="Instructor profile"
            description={`Status: ${user.instructorProfile.status}${user.instructorProfile.earningsFrozen ? " · Earnings frozen" : ""}`}
            className="lg:col-span-2"
          >
            <div className="mb-4 flex flex-wrap gap-4">
              {user.instructorProfile.selfieUrl ?
                <img
                  src={user.instructorProfile.selfieUrl}
                  alt="Verification selfie"
                  className="h-32 w-32 rounded-xl border object-cover"
                />
              : null}
              <div className="text-sm text-[var(--foreground-secondary)]">
                <p>
                  <span className="font-medium">Expertise:</span> {user.instructorProfile.expertise}
                </p>
                <p>
                  <span className="font-medium">Qualification:</span>{" "}
                  {user.instructorProfile.qualification}
                </p>
                <p>
                  <span className="font-medium">Experience:</span>{" "}
                  {user.instructorProfile.experienceYears} years
                </p>
                <p className="mt-2 line-clamp-4">{user.instructorProfile.bio}</p>
              </div>
            </div>
            <ActionRow>
              {user.instructorProfile.status === "PENDING" || user.instructorProfile.status === "REJECTED" || user.instructorProfile.status === "REVOKED" ?
                <form action={reinstateInstructorAction.bind(null, id)}>
                  <Button type="submit" size="sm">
                    Approve / Reinstate
                  </Button>
                </form>
              : null}
              {user.instructorProfile.status === "APPROVED" && !isSelf ?
                <form action={revokeInstructorAction.bind(null, id)}>
                  <Button type="submit" variant="danger" size="sm">
                    Revoke instructor
                  </Button>
                </form>
              : null}
              {canSensitive && user.instructorProfile.earningsFrozen ?
                <form action={unfreezeInstructorEarningsAction.bind(null, id)}>
                  <Button type="submit" variant="outline" size="sm">
                    Unfreeze earnings
                  </Button>
                </form>
              : canSensitive && !isSelf ?
                <form action={freezeInstructorEarningsAction.bind(null, id)}>
                  <Button type="submit" variant="outline" size="sm">
                    Freeze earnings
                  </Button>
                </form>
              : null}
            </ActionRow>
          </AdminSection>
        : null}

        <AdminSection
          title="Enrollments"
          description="Manually enroll or revoke individual courses."
          className="lg:col-span-2"
        >
          {user.enrollments.length > 0 ?
            <ul className="mb-6 space-y-2">
              {user.enrollments.map((e) => (
                <li
                  key={e.id}
                  className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-[var(--foreground)]">{e.course.title}</p>
                    <p className="text-xs text-[var(--foreground-muted)]">
                      {e.progressPercent}% complete
                    </p>
                  </div>
                  {!isSelf ?
                    <form action={revokeEnrollmentAction.bind(null, id, e.courseId)} className="w-full sm:w-auto">
                      <Button type="submit" variant="ghost" size="sm" className="w-full sm:w-auto">
                        Revoke
                      </Button>
                    </form>
                  : null}
                </li>
              ))}
            </ul>
          : <p className="mb-4 text-sm text-[var(--foreground-muted)]">No enrollments yet.</p>}

          {!isSelf ?
            <div>
              <p className="mb-2 text-sm font-semibold text-[var(--foreground-secondary)]">
                Enroll in a course
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {publishedCourses
                  .filter((c) => !enrolledIds.has(c.id))
                  .slice(0, 12)
                  .map((c) => (
                    <form key={c.id} action={enrollUserInCourseAction.bind(null, id, c.id)} className="w-full sm:w-auto">
                      <Button type="submit" variant="outline" size="sm" className="min-h-[44px] w-full sm:w-auto">
                        + {c.title}
                      </Button>
                    </form>
                  ))}
              </div>
            </div>
          : null}
        </AdminSection>

        {user.payments.length > 0 ?
          <AdminSection title="Recent payments" className="lg:col-span-2">
            <ul className="space-y-2 text-sm">
              {user.payments.map((p) => (
                <li
                  key={p.id}
                  className="flex justify-between rounded-lg border border-[var(--border)] px-4 py-2"
                >
                  <span className="text-[var(--foreground-secondary)]">{p.course.title}</span>
                  <Badge variant={p.status === "SUCCESS" ? "success" : "default"}>{p.status}</Badge>
                </li>
              ))}
            </ul>
          </AdminSection>
        : null}
      </div>
    </DashboardWrapper>
  );
}
