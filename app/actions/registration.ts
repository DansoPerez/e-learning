/**
 * Brevo OTP email verification for registration.
 * Disabled when EMAIL_VERIFICATION_ENABLED is false — use registerAction in auth.ts instead.
 */
"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import {
  instructorRegisterSchema,
  type InstructorRegisterInput,
} from "@/lib/validations/instructor";
import { verifyOtpSchema } from "@/lib/validations/email-verification";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { dashboardPathForRole } from "@/lib/auth";
import { generateUserCode } from "@/lib/user-code";
import { logAudit } from "@/lib/audit-log";
import { createNotification } from "@/lib/notifications";
import { normalizeEmail } from "@/lib/normalize-email";
import {
  createRegistrationOtp,
  resendRegistrationOtp,
  verifyRegistrationOtp,
  type PendingRegistrationMetadata,
} from "@/lib/email-verification";

export type RegistrationState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  step?: "verify";
  email?: string;
  message?: string;
  values?: {
    name: string;
    email: string;
    role: string;
    bio: string;
    expertise: string;
    qualification: string;
    experienceYears: string;
  };
};

function registrationFormValues(formData: FormData) {
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

function parseRegistrationForm(formData: FormData) {
  const role = (formData.get("role") as string) ?? "STUDENT";

  if (role === "INSTRUCTOR") {
    return instructorRegisterSchema.safeParse({
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
    }) as ReturnType<typeof instructorRegisterSchema.safeParse>;
  }

  return registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    role: "STUDENT",
  });
}

export async function sendRegistrationOtpAction(
  _prev: RegistrationState,
  formData: FormData,
): Promise<RegistrationState> {
  const parsed = parseRegistrationForm(formData);

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      error: parsed.error.issues[0]?.message,
      values: registrationFormValues(formData),
    };
  }

  const email = normalizeEmail(parsed.data.email);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      error: "An account with this email already exists",
      values: registrationFormValues(formData),
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const metadata: PendingRegistrationMetadata = {
    name: parsed.data.name,
    passwordHash,
    role: parsed.data.role,
  };

  if (parsed.data.role === "INSTRUCTOR") {
    const instructorData = parsed.data as InstructorRegisterInput;
    metadata.instructor = {
      bio: instructorData.bio,
      expertise: instructorData.expertise,
      experienceYears: instructorData.experienceYears,
      qualification: instructorData.qualification,
      selfieUrl: instructorData.selfieUrl,
    };
  }

  try {
    await createRegistrationOtp(email, metadata);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not send verification email";
    if (message.includes("BREVO_API_KEY") || message.includes("BREVO_FROM_EMAIL")) {
      return {
        error: "Email service is not configured. Add BREVO_API_KEY and BREVO_FROM_EMAIL to your environment.",
        values: registrationFormValues(formData),
      };
    }
    if (message.toLowerCase().includes("sender") && message.toLowerCase().includes("valid")) {
      return {
        error:
          "The sender email is not verified in Brevo. Add and verify it under Brevo → Senders & IP → Senders, then set BREVO_FROM_EMAIL.",
        values: registrationFormValues(formData),
      };
    }
    return { error: message, values: registrationFormValues(formData) };
  }

  return {
    step: "verify",
    email,
    message: `We sent a 6-digit code to ${email}. Enter it below to finish registration.`,
  };
}

export async function resendRegistrationOtpAction(
  _prev: RegistrationState,
  formData: FormData,
): Promise<RegistrationState> {
  const email = normalizeEmail((formData.get("email") as string) ?? "");
  if (!email) {
    return { error: "Email is required" };
  }

  const result = await resendRegistrationOtp(email);
  if (!result.ok) {
    return {
      error: result.error,
      step: "verify",
      email,
    };
  }

  return {
    step: "verify",
    email,
    message: "A new code has been sent to your email.",
  };
}

export async function verifyRegistrationOtpAction(
  _prev: RegistrationState,
  formData: FormData,
): Promise<RegistrationState> {
  const parsed = verifyOtpSchema.safeParse({
    email: formData.get("email"),
    code: formData.get("code"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      error: parsed.error.issues[0]?.message,
      step: "verify",
      email: normalizeEmail((formData.get("email") as string) ?? ""),
    };
  }

  const email = normalizeEmail(parsed.data.email);
  const password = formData.get("password") as string;

  const verified = await verifyRegistrationOtp(email, parsed.data.code);
  if (!verified.ok) {
    return {
      error: verified.error,
      step: "verify",
      email,
    };
  }

  const { metadata } = verified;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists" };
  }

  const userCode = await generateUserCode(metadata.role, metadata.name);
  const verifiedAt = new Date();

  if (metadata.role === "INSTRUCTOR" && metadata.instructor) {
    const instructor = await prisma.user.create({
      data: {
        name: metadata.name,
        email,
        passwordHash: metadata.passwordHash,
        role: "INSTRUCTOR",
        userCode,
        emailVerified: verifiedAt,
        instructorProfile: {
          create: {
            ...metadata.instructor,
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
        body: `${metadata.name} (${userCode}) applied to teach`,
        link: "/dashboard/admin/instructors",
      });
    }
  } else {
    const student = await prisma.user.create({
      data: {
        name: metadata.name,
        email,
        passwordHash: metadata.passwordHash,
        role: "STUDENT",
        userCode,
        emailVerified: verifiedAt,
      },
    });

    await logAudit({
      actorId: student.id,
      action: "REGISTER_STUDENT",
      targetType: "User",
      targetId: student.id,
      description: `Student registered (${userCode})`,
    });
  }

  if (!password) {
    return {
      step: "verify",
      email,
      error: "Session expired. Go back and submit your registration details again.",
    };
  }

  return signInAfterRegister(email, password);
}
