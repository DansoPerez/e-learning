"use client";

import { usePathname } from "next/navigation";
import type { Session } from "next-auth";
import { Footer } from "@/components/layout/footer";

/** Site footer for marketing pages only — hidden inside dashboards */
export function ConditionalFooter({
  initialSession,
}: {
  initialSession: Session | null;
}) {
  const pathname = usePathname();
  if (pathname.startsWith("/dashboard")) return null;
  return <Footer initialSession={initialSession} />;
}
