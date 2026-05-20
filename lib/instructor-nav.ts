import type { InstructorStatus } from "@/app/generated/prisma/client";

export type NavItem = { href: string; label: string };

const BASE_APPROVED: NavItem[] = [
  { href: "/dashboard/instructor", label: "Overview" },
  { href: "/dashboard/instructor/courses", label: "My courses" },
  { href: "/dashboard/instructor/messages", label: "Messages" },
  { href: "/dashboard/instructor/withdrawals", label: "Withdrawals" },
];

const BASE_PENDING: NavItem[] = [
  { href: "/dashboard/instructor/pending", label: "Application status" },
  { href: "/dashboard/instructor/apply", label: "Application" },
];

export function getInstructorNavItems(
  status: InstructorStatus | null | undefined,
  isAdmin: boolean,
): NavItem[] {
  if (isAdmin) {
    return [
      { href: "/dashboard/instructor", label: "Overview" },
      { href: "/dashboard/instructor/courses", label: "My courses" },
      { href: "/dashboard/instructor/messages", label: "Messages" },
      { href: "/dashboard/instructor/withdrawals", label: "Withdrawals" },
    ];
  }

  if (status === "APPROVED") {
    return BASE_APPROVED;
  }

  return BASE_PENDING;
}
