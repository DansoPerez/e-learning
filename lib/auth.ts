import { auth } from "@/auth";
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
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user as SessionUser;
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.status !== "ACTIVE") redirect("/login?error=suspended");
  return user;
}

export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    redirect(DASHBOARD_ROUTES[user.role] ?? "/");
  }
  return user;
}

export function dashboardPathForRole(role: Role): string {
  switch (role) {
    case "ADMIN":
      return DASHBOARD_ROUTES.ADMIN;
    case "INSTRUCTOR":
      return DASHBOARD_ROUTES.INSTRUCTOR;
    default:
      return DASHBOARD_ROUTES.STUDENT;
  }
}
