import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";
import { UserProfilePanel } from "@/components/profile/user-profile-panel";
import { getInstructorNavSections } from "@/lib/instructor-nav";
import type { Role } from "@/app/generated/prisma/client";

export async function ProfilePage({ role }: { role: Role }) {
  const session = await requireAuth();

  let navSections;
  if (role === "INSTRUCTOR") {
    const profile = await prisma.instructorProfile.findUnique({
      where: { userId: session.id },
      select: { status: true },
    });
    navSections = getInstructorNavSections(
      profile?.status,
      session.role === "ADMIN",
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      name: true,
      email: true,
      userCode: true,
      role: true,
      status: true,
      createdAt: true,
      isSuperAdmin: true,
      adminSensitiveApproved: true,
      adminSensitiveSuspended: true,
      instructorProfile: { select: { status: true } },
    },
  });

  if (!user) return null;

  return (
    <DashboardWrapper role={role} title="Profile" navSections={navSections}>
      <UserProfilePanel
        user={{
          name: user.name,
          email: user.email,
          userCode: user.userCode,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt,
          isSuperAdmin: user.isSuperAdmin,
          adminSensitiveApproved: user.adminSensitiveApproved,
          adminSensitiveSuspended: user.adminSensitiveSuspended,
          instructorStatus: user.instructorProfile?.status ?? null,
        }}
      />
    </DashboardWrapper>
  );
}
