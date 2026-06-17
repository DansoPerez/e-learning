import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";
import {
  approveCourseAction,
  publishCourseAction,
  rejectCourseAction,
  toggleCourseFeaturedAction,
  updateCoursePriceAction,
} from "@/app/actions/admin";
import { CourseAdminActions } from "@/components/admin/course-admin-actions";
import { ActionRow } from "@/components/ui/action-row";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { isPaymentsEnabled } from "@/lib/paystack-config";

export default async function AdminCoursesPage() {
  await requireRole("ADMIN");

  const courses = await prisma.course.findMany({
    include: { instructor: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return (
    <DashboardWrapper role="ADMIN" title="Course management">
      {!isPaymentsEnabled() ?
        <p className="mb-4 rounded-lg border border-[var(--border)] bg-[var(--background-subtle)] px-4 py-3 text-sm text-[var(--foreground-muted)]">
          Paystack is not configured — all courses enroll for free. Add{" "}
          <code className="text-xs">PAYSTACK_SECRET_KEY</code> to enable paid checkout.
        </p>
      : null}
      <div className="space-y-4">
        {courses.map((c) => (
          <div
            key={c.id}
            className="surface-card flex flex-col gap-4 p-5 lg:flex-row lg:flex-wrap lg:items-start lg:justify-between"
          >
            <div className="min-w-0 flex-1">
              <p className="font-bold text-[var(--foreground)]">{c.title}</p>
              <p className="text-sm text-[var(--foreground-muted)]">
                by {c.instructor.name} · {formatCurrency(Number(c.price))}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge
                  variant={
                    c.status === "PUBLISHED" ? "success"
                    : c.status === "PENDING" ? "warning"
                    : c.status === "HIDDEN" ? "default"
                    : "danger"
                  }
                >
                  {c.status}
                </Badge>
                {c.featured ?
                  <Badge variant="info">Featured on homepage</Badge>
                : null}
              </div>
            </div>
            <div className="flex w-full flex-col gap-3">
              <form
                action={updateCoursePriceAction.bind(null, c.id)}
                className="flex flex-col gap-2 sm:flex-row sm:items-center"
              >
                <Input
                  name="price"
                  type="number"
                  min={0}
                  step="0.01"
                  defaultValue={Number(c.price)}
                  className="min-h-[44px] w-full sm:h-8 sm:w-24"
                  aria-label={`Price for ${c.title}`}
                />
                <Button type="submit" variant="outline" size="sm" className="w-full sm:w-auto">
                  Save price
                </Button>
              </form>
              <ActionRow>
                <form action={toggleCourseFeaturedAction.bind(null, c.id)}>
                  <Button type="submit" variant="secondary" size="sm">
                    {c.featured ? "Unfeature" : "Feature on homepage"}
                  </Button>
                </form>
                {c.status === "PENDING" ?
                  <>
                    <form action={approveCourseAction.bind(null, c.id)}>
                      <Button type="submit" size="sm">
                        Approve
                      </Button>
                    </form>
                    <form action={rejectCourseAction.bind(null, c.id, "Needs improvement")}>
                      <Button type="submit" variant="outline" size="sm">
                        Reject
                      </Button>
                    </form>
                  </>
                : null}
                {c.status === "APPROVED" ?
                  <form action={publishCourseAction.bind(null, c.id)}>
                    <Button type="submit" size="sm">
                      Publish
                    </Button>
                  </form>
                : null}
              </ActionRow>
              <CourseAdminActions courseId={c.id} status={c.status} title={c.title} />
            </div>
          </div>
        ))}
      </div>
    </DashboardWrapper>
  );
}
