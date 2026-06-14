"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/footer";

/** Site footer for marketing pages only — hidden inside dashboards */
export function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/dashboard")) return null;
  return <Footer />;
}
