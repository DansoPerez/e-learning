import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role, UserStatus } from "@/app/generated/prisma/client";
import { redirect } from "next/navigation";
import { DASHBOARD_ROUTES } from "@/lib/constants";

export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: Role;
  status: UserStatus;
  userCode?: string | null;
  isSuperAdmin?: boolean;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user as SessionUser;
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      status: true,
      userCode: true,
      isSuperAdmin: true,
      adminSensitiveApproved: true,
    },
  });

  if (!dbUser) {
    await signOut({ redirectTo: "/login?error=stale_session" });
    redirect("/login?error=stale_session");
  }

  if (dbUser.status !== "ACTIVE") redirect("/login?error=suspended");

  return {
    ...user,
    ...dbUser,
    email: dbUser.email,
  };
}

export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    redirect(DASHBOARD_ROUTES[user.role] ?? "/");
  }
  return user;
}

export {
  courseAccessCtaForRole,
  dashboardCtaLabelForRole,
  dashboardNavLabelForRole,
  dashboardPathForRole,
} from "@/lib/dashboard-nav";
