import { getServerSession } from "@/lib/session";
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

const getCachedSession = getServerSession;

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getCachedSession();
  if (!session?.user?.id) return null;
  return session.user as SessionUser;
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  if (user.status === "BANNED") {
    redirect("/login?error=banned");
  }
  if (user.status === "SUSPENDED") {
    redirect("/login?error=suspended");
  }
  if (user.status !== "ACTIVE") {
    redirect("/login?error=suspended");
  }

  return user;
}

export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    redirect(DASHBOARD_ROUTES[user.role] ?? "/");
  }
  return user;
}

/** Active-user check for API route handlers. Returns null when unauthorized. */
export async function getApiUser(): Promise<SessionUser | null> {
  const session = await getCachedSession();
  if (!session?.user?.id) return null;

  const user = session.user as SessionUser;
  if (user.status !== "ACTIVE") return null;

  return user;
}

export {
  courseAccessCtaForRole,
  dashboardCtaLabelForRole,
  dashboardNavLabelForRole,
  dashboardPathForRole,
} from "@/lib/dashboard-nav";
