import { HeaderNav } from "@/components/layout/header-nav";
import type { Session } from "next-auth";

export function Header({ initialSession }: { initialSession: Session | null }) {
  return <HeaderNav initialSession={initialSession} />;
}
