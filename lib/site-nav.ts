import type { InstructorStatus, Role } from "@/app/generated/prisma/client";
import { DASHBOARD_ROUTES } from "@/lib/constants";
import {
  dashboardNavLabelForRole,
  dashboardPathForRole,
  type DashboardRole,
} from "@/lib/dashboard-nav";

export type NavLink = { href: string; label: string };

export type NavSection = { label: string; items: NavLink[] };

export const EXPLORE_COURSES_LINK: NavLink = {
  href: "/courses",
  label: "Explore",
};

export const MY_LEARNING_LINK: NavLink = {
  href: "/dashboard/student",
  label: "My Learning",
};

export function myLearningLink(role: DashboardRole): NavLink {
  return {
    href: dashboardPathForRole(role),
    label: role === "STUDENT" ? "My Learning" : dashboardNavLabelForRole(role),
  };
}

export const TEACH_LINK: NavLink = {
  href: "/register?role=instructor",
  label: "Teach on Bravio",
};

export function profilePathForRole(role: DashboardRole): string {
  switch (role) {
    case "ADMIN":
      return "/dashboard/admin/profile";
    case "INSTRUCTOR":
      return "/dashboard/instructor/profile";
    default:
      return "/dashboard/student/profile";
  }
}

export function messagesPathForRole(role: DashboardRole): string {
  switch (role) {
    case "ADMIN":
      return "/dashboard/admin/messages";
    case "INSTRUCTOR":
      return "/dashboard/instructor/messages";
    default:
      return "/dashboard/student/messages";
  }
}

/** Primary links shown in the site header (public pages). */
export function publicHeaderLinks(
  isAuthenticated: boolean,
  role: DashboardRole = "STUDENT",
): NavLink[] {
  const links: NavLink[] = [EXPLORE_COURSES_LINK];
  if (isAuthenticated) {
    links.push(myLearningLink(role));
  } else {
    links.push(TEACH_LINK);
  }
  return links;
}

/** Avatar menu — account shortcuts only; dashboard sidebar holds the rest. */
export function userMenuLinks(
  role: DashboardRole,
  opts: { onDashboard: boolean },
): NavLink[] {
  const links: NavLink[] = [];

  if (!opts.onDashboard) {
    links.push({
      href: dashboardPathForRole(role),
      label: dashboardNavLabelForRole(role),
    });
  }

  links.push({ href: profilePathForRole(role), label: "Profile & settings" });

  return links;
}

export function flattenNavSections(sections: NavSection[]): NavLink[] {
  return sections.flatMap((section) => section.items);
}

const STUDENT_SECTIONS: NavSection[] = [
  {
    label: "Learner",
    items: [
      { href: "/dashboard/student", label: "My Learning" },
      { href: "/dashboard/student/courses", label: "My courses" },
      { href: "/courses", label: "Explore" },
      { href: "/dashboard/student/messages", label: "Messages" },
    ],
  },
  {
    label: "Teaching",
    items: [{ href: "/dashboard/instructor/apply", label: "Become an instructor" }],
  },
];

const INSTRUCTOR_APPROVED_SECTIONS: NavSection[] = [
  {
    label: "Teaching",
    items: [
      { href: "/dashboard/instructor", label: "Teaching home" },
      { href: "/dashboard/instructor/courses", label: "My courses" },
      { href: "/dashboard/instructor/courses/new", label: "Create course" },
      { href: "/dashboard/instructor/analytics", label: "Analytics" },
      { href: "/dashboard/instructor/messages", label: "Messages" },
      { href: "/dashboard/instructor/withdrawals", label: "Earnings" },
    ],
  },
];

const INSTRUCTOR_PENDING_SECTIONS: NavSection[] = [
  {
    label: "Application",
    items: [
      { href: "/dashboard/instructor/pending", label: "Application status" },
      { href: "/dashboard/instructor/apply", label: "Submit application" },
    ],
  },
  {
    label: "Support",
    items: [{ href: "/dashboard/instructor/messages", label: "Contact admin" }],
  },
];

const ADMIN_SECTIONS: NavSection[] = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard/admin", label: "Dashboard" },
      { href: "/dashboard/admin/analytics", label: "Analytics" },
    ],
  },
  {
    label: "People & content",
    items: [
      { href: "/dashboard/admin/users", label: "Users" },
      { href: "/dashboard/admin/instructors", label: "Instructors" },
      { href: "/dashboard/admin/courses", label: "Courses" },
      { href: "/dashboard/admin/reviews", label: "Reviews" },
      { href: "/dashboard/admin/quizzes", label: "Quizzes" },
    ],
  },
  {
    label: "Communication",
    items: [
      { href: "/dashboard/admin/announcements", label: "Announcements" },
      { href: "/dashboard/admin/messages", label: "Messages" },
    ],
  },
  {
    label: "Finance",
    items: [{ href: "/dashboard/admin/withdrawals", label: "Withdrawals" }],
  },
  {
    label: "System",
    items: [
      { href: "/dashboard/admin/settings", label: "Settings" },
      { href: "/dashboard/admin/logs", label: "Audit logs" },
    ],
  },
];

export function getDashboardNavSections(role: Role): NavSection[] {
  switch (role) {
    case "ADMIN":
      return ADMIN_SECTIONS;
    case "INSTRUCTOR":
      return INSTRUCTOR_APPROVED_SECTIONS;
    default:
      return STUDENT_SECTIONS;
  }
}

export function getInstructorNavSections(
  status: InstructorStatus | null | undefined,
  isAdmin: boolean,
): NavSection[] {
  if (isAdmin || status === "APPROVED") {
    return INSTRUCTOR_APPROVED_SECTIONS;
  }
  return INSTRUCTOR_PENDING_SECTIONS;
}

/** @deprecated Use getInstructorNavSections — kept for callers expecting flat items. */
export function getInstructorNavItems(
  status: InstructorStatus | null | undefined,
  isAdmin: boolean,
): NavLink[] {
  return flattenNavSections(getInstructorNavSections(status, isAdmin));
}

export { DASHBOARD_ROUTES, dashboardNavLabelForRole, dashboardPathForRole };
