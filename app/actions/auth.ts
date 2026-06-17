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
import { markOffline } from "@/lib/presence";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";
import { isEmailVerificationEnabled } from "@/lib/email-config";
import { normalizeEmail } from "@/lib/normalize-email";

export type ActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  values?: RegisterFormValues;
};

export type RegisterFormValues = {
  name: string;
  email: string;
  role: string;
  bio: string;
  expertise: string;
  qualification: string;
  experienceYears: string;
};

function registerFormValues(formData: FormData): RegisterFormValues {
  return {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    role: String(formData.get("role") ?? "STUDENT"),
    bio: String(formData.get("bio") ?? ""),
    expertise: String(formData.get("expertise") ?? ""),
    qualification: String(formData.get("qualification") ?? ""),
    experienceYears: String(formData.get("experienceYears") ?? ""),
  };
}

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
    const result = await signIn("credentials", {
      identifier: user!.email,
      email: user!.email,
      password,
      redirect: false,
    });

    if (result?.error) {
      redirect("/login?registered=1");
    }
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login?registered=1");
    }
    throw error;
  }

  redirect(redirectTo);
}

/** Direct registration (used when email verification is disabled) */
export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (isEmailVerificationEnabled()) {
    return {
      error: "Email verification is required. Use the registration form to receive a verification code.",
    };
  }

  const role = (formData.get("role") as string) ?? "STUDENT";

  if (role === "INSTRUCTOR") {
    const parsed = instructorRegisterSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
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
        values: registerFormValues(formData),
      };
    }

    const email = parsed.data.email;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return {
        error: "An account with this email already exists",
        values: registerFormValues(formData),
      };
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
        emailVerified: isEmailVerificationEnabled() ? undefined : new Date(),
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
    confirmPassword: formData.get("confirmPassword"),
    role: "STUDENT",
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      values: registerFormValues(formData),
    };
  }

  const email = parsed.data.email;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      error: "An account with this email already exists",
      values: registerFormValues(formData),
    };
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
      emailVerified: isEmailVerificationEnabled() ? undefined : new Date(),
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

  const limited = await checkRateLimit(
    rateLimitKey("login", identifier?.trim().toLowerCase() || "unknown"),
    10,
    15 * 60_000,
  );
  if (!limited.ok) {
    return { error: `Too many login attempts. Try again in ${limited.retryAfterSec}s.` };
  }

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

  if (isEmailVerificationEnabled() && !userWithProfile.emailVerified) {
    return {
      error:
        "Please verify your email before signing in. Complete registration with the code we sent you, or register again.",
    };
  }

  const redirectTo = authRedirectPath(
    userWithProfile.role,
    userWithProfile.instructorProfile,
  );

  const result = await signIn("credentials", {
    identifier: userWithProfile.email,
    email: userWithProfile.email,
    password,
    redirect: false,
  });

  if (result?.error) {
    return { error: "Invalid user ID or password" };
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
