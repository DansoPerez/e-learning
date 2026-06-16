import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { InstructorDashboardWrapper } from "@/components/layout/instructor-dashboard-wrapper";
import { InstructorCourseCard } from "@/components/instructor/instructor-course-card";
import { DashboardSection } from "@/components/ui/dashboard-section";
import { Button } from "@/components/ui/button";
import { instructorCourseGridClass } from "@/lib/course-grid";
import { BookOpen, Plus } from "lucide-react";

export default async function InstructorCoursesPage() {
  const user = await requireRole("INSTRUCTOR", "ADMIN");

  const courses = await prisma.course.findMany({
    where: { instructorId: user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      price: true,
      thumbnailUrl: true,
      _count: { select: { enrollments: true } },
    },
  });

  const published = courses.filter((c) => c.status === "PUBLISHED").length;
  const draft = courses.length - published;

  return (
    <InstructorDashboardWrapper title="My courses">
      <div className="flex flex-col gap-3 border-b border-[var(--border)] pb-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--foreground-muted)]">
          {courses.length} course{courses.length === 1 ? "" : "s"} · {published} published
          {draft > 0 ? ` · ${draft} draft` : ""}
        </p>
        <Link href="/dashboard/instructor/courses/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Create course
          </Button>
        </Link>
      </div>

      <DashboardSection title="Course catalog">
        {courses.length === 0 ?
          <div className="surface-card flex flex-col items-center justify-center px-6 py-12 text-center">
            <BookOpen className="h-10 w-10 text-[var(--primary-muted)]" />
            <p className="mt-3 text-sm text-[var(--foreground-muted)]">
              Create a course to start teaching on Bravio.
            </p>
            <Link href="/dashboard/instructor/courses/new" className="mt-4">
              <Button className="gap-1.5">
                <Plus className="h-4 w-4" />
                Create course
              </Button>
            </Link>
          </div>
        : <div className={instructorCourseGridClass}>
            {courses.map((c) => (
              <InstructorCourseCard
                key={c.id}
                id={c.id}
                title={c.title}
                slug={c.slug}
                status={c.status}
                price={Number(c.price)}
                thumbnailUrl={c.thumbnailUrl}
                enrollmentCount={c._count.enrollments}
              />
            ))}
          </div>
        }
      </DashboardSection>
    </InstructorDashboardWrapper>
  );
}
