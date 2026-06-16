"use client";

import { useSession } from "next-auth/react";
import type { Session } from "next-auth";
import type { DashboardRole } from "@/lib/dashboard-nav";

/** Client session with optional server fallback — avoids guest UI flashing while auth hydrates. */
export function useAppSession(initialSession?: Session | null) {
  const { data: clientSession, status } = useSession();
  const session = clientSession ?? initialSession ?? null;
  const isAuthenticated = !!session?.user?.id;
  const isLoading = status === "loading" && !isAuthenticated;
  const role = (session?.user?.role ?? "STUDENT") as DashboardRole;

  return { session, status, isAuthenticated, isLoading, role };
}
