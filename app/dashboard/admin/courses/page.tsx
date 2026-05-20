import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";
import {
  approveCourseAction,
  hideCourseAction,
  publishCourseAction,
  rejectCourseAction,
  unhideCourseAction,
} from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export default async function AdminCoursesPage() {
  await requireRole("ADMIN");

  const courses = await prisma.course.findMany({
    include: { instructor: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return (
    <DashboardWrapper role="ADMIN" title="Course management">
      <div className="space-y-4">
        {courses.map((c) => (
          <div
            key={c.id}
            className="surface-card flex flex-wrap items-center justify-between gap-4 p-5"
          >
            <div>
              <p className="font-bold text-[var(--foreground)]">{c.title}</p>
              <p className="text-sm text-[var(--foreground-muted)]">
                by {c.instructor.name} · {formatCurrency(Number(c.price))}
              </p>
            </div>
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
            <div className="flex flex-wrap gap-2">
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
              {c.status === "PUBLISHED" ?
                <form action={hideCourseAction.bind(null, c.id)}>
                  <Button type="submit" variant="outline" size="sm">
                    Hide
                  </Button>
                </form>
              : null}
              {c.status === "HIDDEN" ?
                <form action={unhideCourseAction.bind(null, c.id)}>
                  <Button type="submit" size="sm">
                    Unhide / Publish
                  </Button>
                </form>
              : null}
            </div>
          </div>
        ))}
      </div>
    </DashboardWrapper>
  );
}
