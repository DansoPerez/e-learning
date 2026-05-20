"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { instructorRegisterSchema } from "@/lib/validations/instructor";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { dashboardPathForRole } from "@/lib/auth";

export type ActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

async function redirectAfterAuth(email: string, password: string): Promise<never> {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { instructorProfile: true },
  });

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch {
    redirect("/login?registered=1");
  }

  if (user?.role === "INSTRUCTOR") {
    if (!user.instructorProfile || user.instructorProfile.status !== "APPROVED") {
      redirect("/dashboard/instructor/pending");
    }
  }

  redirect(dashboardPathForRole(user?.role ?? "STUDENT"));
}

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

    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (existing) {
      return { error: "An account with this email already exists" };
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
        role: "INSTRUCTOR",
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

    return redirectAfterAuth(parsed.data.email, parsed.data.password);
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

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return { error: "An account with this email already exists" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: "STUDENT",
    },
  });

  return redirectAfterAuth(parsed.data.email, parsed.data.password);
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { instructorProfile: true },
  });

  if (!user) {
    return { error: "Invalid email or password" };
  }

  if (user.status === "SUSPENDED") {
    return { error: "Your account is suspended. Contact support." };
  }
  if (user.status === "BANNED") {
    return { error: "Your account has been banned." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password" };
    }
    throw error;
  }

  if (user.role === "INSTRUCTOR") {
    if (!user.instructorProfile) {
      redirect("/dashboard/instructor/apply");
    }
    if (user.instructorProfile.status !== "APPROVED") {
      redirect("/dashboard/instructor/pending");
    }
  }

  redirect(dashboardPathForRole(user.role));
}
