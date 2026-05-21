"use client";

import { usePathname } from "next/navigation";
import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";
import { PresenceHeartbeat } from "@/components/presence/presence-heartbeat";
import type { Role } from "@/app/generated/prisma/client";

export function DashboardWrapper({
  role,
  title,
  children,
  navItems,
}: {
  role: Role;
  title: string;
  children: React.ReactNode;
  navItems?: NavItem[];
}) {
  const pathname = usePathname();
  return (
    <>
      <PresenceHeartbeat />
      <DashboardShell role={role} title={title} pathname={pathname} navItems={navItems}>
        {children}
      </DashboardShell>
    </>
  );
}
