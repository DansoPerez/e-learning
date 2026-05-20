import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { InstructorDashboardWrapper } from "@/components/layout/instructor-dashboard-wrapper";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export default async function InstructorCoursesPage() {
  const user = await requireRole("INSTRUCTOR", "ADMIN");

  const courses = await prisma.course.findMany({
    where: { instructorId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { enrollments: true } } },
  });

  return (
    <InstructorDashboardWrapper title="My courses">
      <Link
        href="/dashboard/instructor/courses/new"
        className="mb-6 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        + New course
      </Link>
      <div className="space-y-3">
        {courses.map((c) => (
          <Link
            key={c.id}
            href={`/dashboard/instructor/courses/${c.id}`}
            className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm hover:border-indigo-200"
          >
            <div>
              <p className="font-medium">{c.title}</p>
              <p className="text-sm text-zinc-500">
                {c._count.enrollments} students · {formatCurrency(Number(c.price))}
              </p>
            </div>
            <Badge
              variant={
                c.status === "PUBLISHED" ? "success"
                : c.status === "PENDING" ? "warning"
                : "default"
              }
            >
              {c.status}
            </Badge>
          </Link>
        ))}
      </div>
    </InstructorDashboardWrapper>
  );
}
