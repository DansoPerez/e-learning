"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { instructorRegisterSchema } from "@/lib/validations/instructor";
import { auth, signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { dashboardPathForRole } from "@/lib/auth";
import { generateUserCode, findUserByLoginIdentifier } from "@/lib/user-code";
import { logAudit } from "@/lib/audit-log";
import { createNotification } from "@/lib/notifications";
import { markOffline, touchPresence } from "@/lib/presence";
import { normalizeEmail } from "@/lib/normalize-email";

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

async function signInAfterRegister(email: string, password: string): Promise<never> {
  const user = await prisma.user.findUnique({
    where: { email: normalizeEmail(email) },
    include: { instructorProfile: true },
  });

  const redirectTo = authRedirectPath(
    user?.role ?? "STUDENT",
    user?.instructorProfile,
  );

  try {
    await signIn("credentials", {
      email: user!.email,
      identifier: user!.email,
      password,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login?registered=1");
    }
    throw error;
  }

  redirect(redirectTo);
}

/** Direct registration (used while EMAIL_VERIFICATION_ENABLED is false) */
export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const role = (formData.get("role") as string) ?? "STUDENT";

  if (role === "INSTRUCTOR") {
    const parsed = instructorRegisterSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: "INSTRUCTOR",
      bio: formData.get("bio"),
      expertise: formData.get("expertise"),
      experienceYears: formData.get("experienceYears"),
      qualification: formData.get("qualification"),
      selfieUrl: formData.get("selfieUrl"),
    });

    if (!parsed.success) {
      return {
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        error: parsed.error.issues[0]?.message,
      };
    }

    const email = parsed.data.email;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { error: "An account with this email already exists" };
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const userCode = await generateUserCode("INSTRUCTOR", parsed.data.name);

    const instructor = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email,
        passwordHash,
        role: "INSTRUCTOR",
        userCode,
        // emailVerified: set when EMAIL_VERIFICATION_ENABLED is true
        emailVerified: new Date(),
        instructorProfile: {
          create: {
            bio: parsed.data.bio,
            expertise: parsed.data.expertise,
            experienceYears: parsed.data.experienceYears,
            qualification: parsed.data.qualification,
            selfieUrl: parsed.data.selfieUrl,
            status: "PENDING",
          },
        },
      },
    });

    await logAudit({
      actorId: instructor.id,
      action: "REGISTER_INSTRUCTOR",
      targetType: "User",
      targetId: instructor.id,
      description: `Instructor registered (${userCode}), pending approval`,
    });

    const superAdmins = await prisma.user.findMany({
      where: { role: "ADMIN", isSuperAdmin: true, status: "ACTIVE" },
      select: { id: true },
    });
    for (const sa of superAdmins) {
      await createNotification({
        userId: sa.id,
        type: "INSTRUCTOR_PENDING",
        title: "New instructor application",
        body: `${parsed.data.name} (${userCode}) applied to teach`,
        link: "/dashboard/admin/instructors",
      });
    }

    return signInAfterRegister(email, parsed.data.password);
  }

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: "STUDENT",
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const email = parsed.data.email;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const userCode = await generateUserCode("STUDENT", parsed.data.name);

  const student = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash,
      role: "STUDENT",
      userCode,
      emailVerified: new Date(),
    },
  });

  await logAudit({
    actorId: student.id,
    action: "REGISTER_STUDENT",
    targetType: "User",
    targetId: student.id,
    description: `Student registered (${userCode})`,
  });

  return signInAfterRegister(email, parsed.data.password);
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

  // Email OTP verification (disabled — see EMAIL_VERIFICATION_ENABLED in lib/constants.ts)
  // if (!userWithProfile.emailVerified) {
  //   return {
  //     error:
  //       "Please verify your email before signing in. Complete registration with the code we sent you, or register again.",
  //   };
  // }

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
