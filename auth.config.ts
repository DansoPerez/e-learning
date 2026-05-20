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
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as Role) ?? "STUDENT";
        session.user.status = (token.status as UserStatus) ?? "ACTIVE";
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
} satisfies NextAuthConfig;
