import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";
import { AdminSection } from "@/components/admin/admin-section";
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
  suspendUserAction,
  unfreezeInstructorEarningsAction,
  updateUserRoleAction,
} from "@/app/actions/admin";
import { DeleteUserButton } from "@/components/admin/delete-user-button";
import { formatDate } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

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
    include: {
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

  const publishedCourses = await prisma.course.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, title: true, price: true },
    orderBy: { title: "asc" },
  });

  const enrolledIds = new Set(user.enrollments.map((e) => e.courseId));

  return (
    <DashboardWrapper role="ADMIN" title="Manage user">
      <Link
        href="/dashboard/admin/users"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to users
      </Link>

      <div className="surface-card mb-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-[var(--foreground)]">
              {user.name ?? "Unnamed user"}
            </h2>
            <p className="text-[var(--foreground-muted)]">{user.email}</p>
            <p className="mt-2 text-xs text-[var(--foreground-muted)]">
              Joined {formatDate(user.createdAt)}
            </p>
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
          </div>
        </div>
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
            <div className="flex flex-wrap gap-2">
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
            </div>
          </AdminSection>
        : null}

        {!isSelf ?
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
            <div className="flex flex-wrap gap-2">
              {(["STUDENT", "INSTRUCTOR", "ADMIN"] as const).map((r) => (
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
            </div>
          </AdminSection>
        : null}

        {!isSelf && (user.role === "STUDENT" || user.allCoursesAccess) ?
          <AdminSection
            title="Course access"
            description="Grant access to every published course (free and paid) without payment."
            className="lg:col-span-2"
          >
            <div className="flex flex-wrap gap-2">
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
            </div>
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
            <div className="flex flex-wrap gap-2">
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
              {user.instructorProfile.earningsFrozen ?
                <form action={unfreezeInstructorEarningsAction.bind(null, id)}>
                  <Button type="submit" variant="outline" size="sm">
                    Unfreeze earnings
                  </Button>
                </form>
              : !isSelf ?
                <form action={freezeInstructorEarningsAction.bind(null, id)}>
                  <Button type="submit" variant="outline" size="sm">
                    Freeze earnings
                  </Button>
                </form>
              : null}
            </div>
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
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-[var(--foreground)]">{e.course.title}</p>
                    <p className="text-xs text-[var(--foreground-muted)]">
                      {e.progressPercent}% complete
                    </p>
                  </div>
                  {!isSelf ?
                    <form action={revokeEnrollmentAction.bind(null, id, e.courseId)}>
                      <Button type="submit" variant="ghost" size="sm">
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
              <div className="flex flex-wrap gap-2">
                {publishedCourses
                  .filter((c) => !enrolledIds.has(c.id))
                  .slice(0, 12)
                  .map((c) => (
                    <form key={c.id} action={enrollUserInCourseAction.bind(null, id, c.id)}>
                      <Button type="submit" variant="outline" size="sm">
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
