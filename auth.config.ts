import type { NextAuthConfig } from "next-auth";
import type { Role, UserStatus } from "@/app/generated/prisma/client";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: Role }).role ?? "STUDENT";
        token.status = (user as { status?: UserStatus }).status ?? "ACTIVE";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = (token.role as Role) ?? "STUDENT";
        session.user.status = (token.status as UserStatus) ?? "ACTIVE";
        session.user.userCode = (token.userCode as string | null) ?? null;
        session.user.isSuperAdmin = (token.isSuperAdmin as boolean) ?? false;
        session.user.adminSensitiveApproved =
          (token.adminSensitiveApproved as boolean) ?? false;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
} satisfies NextAuthConfig;
