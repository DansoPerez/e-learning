"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth, signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { dashboardPathForRole } from "@/lib/auth";
import { findUserByLoginIdentifier } from "@/lib/user-code";
import { logAudit } from "@/lib/audit-log";
import { markOffline, touchPresence } from "@/lib/presence";

export type ActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function authRedirectPath(
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN",
  instructorProfile: { status: string } | null | undefined,
): string {
  if (role === "INSTRUCTOR") {
    if (!instructorProfile) return "/dashboard/instructor/apply";
    if (instructorProfile.status !== "APPROVED") return "/dashboard/instructor/pending";
  }
  return dashboardPathForRole(role);
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const identifier = (formData.get("identifier") ?? formData.get("email")) as string;
  const password = formData.get("password") as string;

  const user = await findUserByLoginIdentifier(identifier);
  const userWithProfile =
    user ?
      await prisma.user.findUnique({
        where: { id: user.id },
        include: { instructorProfile: true },
      })
    : null;

  if (!userWithProfile) {
    return { error: "Invalid user ID or password" };
  }

  if (userWithProfile.status === "SUSPENDED") {
    return { error: "Your account is suspended. Contact support." };
  }
  if (userWithProfile.status === "BANNED") {
    return { error: "Your account has been banned." };
  }

  if (!userWithProfile.emailVerified) {
    return {
      error:
        "Please verify your email before signing in. Complete registration with the code we sent you, or register again.",
    };
  }

  const redirectTo = authRedirectPath(
    userWithProfile.role,
    userWithProfile.instructorProfile,
  );

  await touchPresence(userWithProfile.id);

  await logAudit({
    actorId: userWithProfile.id,
    action: "LOGIN",
    targetType: "User",
    targetId: userWithProfile.id,
    description: `User signed in (${userWithProfile.userCode ?? userWithProfile.email})`,
  });

  try {
    await signIn("credentials", {
      identifier: userWithProfile.email,
      email: userWithProfile.email,
      password,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid user ID or password" };
    }
    throw error;
  }

  redirect(redirectTo);
}

export async function signOutAction() {
  const session = await auth();
  if (session?.user?.id) {
    await markOffline(session.user.id);
  }
  await signOut({ redirectTo: "/" });
}
