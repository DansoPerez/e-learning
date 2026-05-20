import { requireRole } from "@/lib/auth";
import { getInstructorProfile } from "@/lib/instructor";
import { getInstructorNavItems } from "@/lib/instructor-nav";
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";

export async function InstructorDashboardWrapper({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const user = await requireRole("INSTRUCTOR", "ADMIN");
  const profile =
    user.role === "INSTRUCTOR" ?
      await getInstructorProfile(user.id)
    : null;
  const navItems = getInstructorNavItems(profile?.status, user.role === "ADMIN");

  return (
    <DashboardWrapper role="INSTRUCTOR" title={title} navItems={navItems}>
      {children}
    </DashboardWrapper>
  );
}
