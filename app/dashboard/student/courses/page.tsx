import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";
import { DashboardSection } from "@/components/ui/dashboard-section";
import { MyLearningTabs } from "@/components/learning/my-learning-tabs";

const enrollmentSelect = {
  id: true,
  progressPercent: true,
  lastLessonId: true,
  course: {
    select: {
      slug: true,
      title: true,
      thumbnailUrl: true,
      category: { select: { name: true } },
      instructor: { select: { name: true } },
    },
  },
} as const;

export default async function StudentCoursesPage() {
  const user = await requireRole("STUDENT", "ADMIN", "INSTRUCTOR");

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    select: enrollmentSelect,
    orderBy: { updatedAt: "desc" },
  });

  return (
    <DashboardWrapper role="STUDENT" title="My courses">
      <DashboardSection
        title="All enrollments"
        description="Browse in-progress and completed courses, then resume where you left off."
      >
        <MyLearningTabs enrollments={enrollments} />
      </DashboardSection>
    </DashboardWrapper>
  );
}
