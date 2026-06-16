import { DASHBOARD_ROUTES } from "@/lib/constants";

/** Client-safe dashboard paths and labels (no Prisma / Auth.js imports). */

export type DashboardRole = "ADMIN" | "INSTRUCTOR" | "STUDENT";

export function dashboardPathForRole(role: DashboardRole): string {
  switch (role) {
    case "ADMIN":
      return DASHBOARD_ROUTES.ADMIN;
    case "INSTRUCTOR":
      return DASHBOARD_ROUTES.INSTRUCTOR;
    default:
      return DASHBOARD_ROUTES.STUDENT;
  }
}

export function dashboardNavLabelForRole(role: DashboardRole): string {
  switch (role) {
    case "ADMIN":
      return "Admin panel";
    case "INSTRUCTOR":
      return "Teaching";
    default:
      return "My Learning";
  }
}

export function dashboardCtaLabelForRole(role: DashboardRole): string {
  switch (role) {
    case "ADMIN":
      return "Go to admin panel";
    case "INSTRUCTOR":
      return "Go to teaching dashboard";
    default:
      return "Go to My Learning";
  }
}

export function courseAccessCtaForRole(
  role: DashboardRole | undefined,
  opts: { slug: string; courseId: string; isInstructorOwner: boolean },
): { label: string; href: string } {
  if (opts.isInstructorOwner) {
    return {
      label: "Manage course",
      href: `/dashboard/instructor/courses/${opts.courseId}`,
    };
  }
  switch (role) {
    case "ADMIN":
      return { label: "Open course", href: `/learn/${opts.slug}` };
    case "INSTRUCTOR":
      return { label: "Preview course", href: `/learn/${opts.slug}` };
    default:
      return { label: "Continue learning", href: `/learn/${opts.slug}` };
  }
}
