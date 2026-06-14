"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { PresenceWhenSignedIn } from "@/components/presence/presence-when-signed-in";

export function AuthProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <SessionProvider session={session} refetchOnWindowFocus={false} refetchInterval={0}>
      <PresenceWhenSignedIn />
      {children}
    </SessionProvider>
  );
}
