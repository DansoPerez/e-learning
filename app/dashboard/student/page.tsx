import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { getAnnouncementsForUser } from "@/lib/announcements";
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";
import { AnnouncementPanel } from "@/components/announcements/announcement-panel";
import { DashboardSection } from "@/components/ui/dashboard-section";
import { MyLearningTabs } from "@/components/learning/my-learning-tabs";
import { EnrolledCourseRow } from "@/components/learning/enrolled-course-card";
import { Button } from "@/components/ui/button";

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

export default async function StudentDashboardPage() {
  const user = await requireRole("STUDENT", "ADMIN", "INSTRUCTOR");

  const [enrollments, announcements] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId: user.id },
      select: enrollmentSelect,
      orderBy: { updatedAt: "desc" },
    }),
    getAnnouncementsForUser(
      user.id,
      user.role === "ADMIN" ? "STUDENT" : user.role,
    ),
  ]);

  const continueEnrollments = enrollments
    .filter((e) => e.progressPercent < 100)
    .slice(0, 3);
  const unreadAnnouncements = announcements.filter((a) => !a.read).length;

  return (
    <DashboardWrapper role="STUDENT" title="My Learning">
      {continueEnrollments.length > 0 ?
        <DashboardSection
          title="Pick up where you left off"
          action={
            <Link href="/dashboard/student/courses">
              <Button variant="outline" size="sm">
                View all
              </Button>
            </Link>
          }
        >
          <div className="space-y-3">
            {continueEnrollments.map((e) => (
              <EnrolledCourseRow
                key={e.id}
                slug={e.course.slug}
                title={e.course.title}
                thumbnailUrl={e.course.thumbnailUrl}
                category={e.course.category?.name}
                instructor={e.course.instructor.name}
                progressPercent={e.progressPercent}
                lastLessonId={e.lastLessonId}
              />
            ))}
          </div>
        </DashboardSection>
      : null}

      <DashboardSection title="Your courses">
        <MyLearningTabs enrollments={enrollments} />
      </DashboardSection>

      {announcements.length > 0 ?
        <DashboardSection
          title="Updates"
          description={unreadAnnouncements > 0 ? `${unreadAnnouncements} unread` : undefined}
        >
          <AnnouncementPanel announcements={announcements} />
        </DashboardSection>
      : null}
    </DashboardWrapper>
  );
}
