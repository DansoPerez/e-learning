import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import { findUserByLoginIdentifier } from "@/lib/user-code";
import { authConfig } from "@/auth.config";
import type { Role, UserStatus } from "@/app/generated/prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        identifier: { label: "User ID or email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const cred = credentials as Record<string, string> | undefined;
        const parsed = loginSchema.safeParse({
          identifier: cred?.identifier ?? cred?.email,
          password: cred?.password,
        });
        if (!parsed.success) return null;

        const user = await findUserByLoginIdentifier(parsed.data.identifier);

        if (!user?.passwordHash || user.status !== "ACTIVE") return null;

        // Email OTP verification (disabled — see EMAIL_VERIFICATION_ENABLED in lib/constants.ts)
        // if (!user.emailVerified) return null;

        const valid = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash,
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          status: user.status,
          userCode: user.userCode,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: Role }).role ?? "STUDENT";
        token.status = (user as { status?: UserStatus }).status ?? "ACTIVE";
        token.userCode = (user as { userCode?: string | null }).userCode ?? null;
        token.isSuperAdmin = (user as { isSuperAdmin?: boolean }).isSuperAdmin ?? false;
        token.adminSensitiveApproved =
          (user as { adminSensitiveApproved?: boolean }).adminSensitiveApproved ?? false;
      }

      if (trigger === "update" && session?.user) {
        token.name = session.user.name;
        token.picture = session.user.image;
      }

      if (token.id && trigger !== "signIn") {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              role: true,
              status: true,
              name: true,
              image: true,
            userCode: true,
            isSuperAdmin: true,
            adminSensitiveApproved: true,
          },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.status = dbUser.status;
          token.name = dbUser.name;
          token.picture = dbUser.image;
          token.userCode = dbUser.userCode;
          token.isSuperAdmin = dbUser.isSuperAdmin;
          token.adminSensitiveApproved = dbUser.adminSensitiveApproved;
        }
        } catch {
          // Schema out of sync (run `npx prisma db push`) — keep existing token claims
        }
      }

      return token;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const existing = await prisma.user.findUnique({
          where: { email: user.email.toLowerCase() },
        });
        if (existing?.status !== "ACTIVE") return false;
        await prisma.user.updateMany({
          where: { email: user.email.toLowerCase() },
          data: { emailVerified: new Date() },
        });
      }
      return true;
    },
  },
});
