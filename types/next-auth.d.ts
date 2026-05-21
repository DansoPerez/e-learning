import type { Role, UserStatus } from "@/app/generated/prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      status: UserStatus;
      userCode?: string | null;
      isSuperAdmin?: boolean;
      adminSensitiveApproved?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role?: Role;
    status?: UserStatus;
    userCode?: string | null;
    isSuperAdmin?: boolean;
    adminSensitiveApproved?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    status?: UserStatus;
    userCode?: string | null;
    isSuperAdmin?: boolean;
    adminSensitiveApproved?: boolean;
  }
}
