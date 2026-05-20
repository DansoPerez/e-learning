import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default async function StudentCoursesPage() {
  const user = await requireRole("STUDENT", "ADMIN", "INSTRUCTOR");

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: { course: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <DashboardWrapper role="STUDENT" title="My courses">
      {enrollments.length === 0 ?
        <p className="text-zinc-500">No enrolled courses yet.</p>
      : <div className="space-y-4">
          {enrollments.map((e) => (
            <Card key={e.id} className="flex justify-between gap-4">
              <div>
                <CardTitle className="text-base">{e.course.title}</CardTitle>
                <CardDescription>{e.progressPercent}% complete</CardDescription>
              </div>
              <Link
                href={`/learn/${e.course.slug}`}
                className="text-sm text-indigo-600 hover:underline"
              >
                Open
              </Link>
            </Card>
          ))}
        </div>
      }
    </DashboardWrapper>
  );
}
