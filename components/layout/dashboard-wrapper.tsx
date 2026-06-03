"use client";

import { usePathname } from "next/navigation";
import { DashboardShell, type NavSection } from "@/components/layout/dashboard-shell";
import type { Role } from "@/app/generated/prisma/client";

export function DashboardWrapper({
  role,
  title,
  children,
  navSections,
}: {
  role: Role;
  title: string;
  children: React.ReactNode;
  navSections?: NavSection[];
}) {
  const pathname = usePathname();
  return (
    <DashboardShell role={role} title={title} pathname={pathname} navSections={navSections}>
      {children}
    </DashboardShell>
  );
}
