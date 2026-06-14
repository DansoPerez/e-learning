"use client";

import { SessionProvider, useSession } from "next-auth/react";
import type { Session } from "next-auth";
import { PresenceHeartbeat } from "@/components/presence/presence-heartbeat";

function PresenceWhenSignedIn() {
  const { status } = useSession();
  if (status !== "authenticated") return null;
  return <PresenceHeartbeat />;
}

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
