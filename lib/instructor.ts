import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { InstructorStatus } from "@/app/generated/prisma/client";

export async function getInstructorProfile(userId: string) {
  return prisma.instructorProfile.findUnique({ where: { userId } });
}

export async function isApprovedInstructor(userId: string): Promise<boolean> {
  const profile = await getInstructorProfile(userId);
  return profile?.status === "APPROVED";
}

export async function requireApprovedInstructor(userId: string) {
  const profile = await getInstructorProfile(userId);
  if (!profile) {
    redirect("/dashboard/instructor/pending");
  }
  if (profile.status !== "APPROVED") {
    redirect("/dashboard/instructor/pending");
  }
  return profile;
}

export function instructorStatusMessage(status: InstructorStatus): string {
  switch (status) {
    case "PENDING":
      return "Your application is awaiting admin review. You cannot create or publish courses yet.";
    case "REJECTED":
      return "Your application was rejected. Update your details and selfie, then resubmit.";
    case "REVOKED":
      return "Your instructor access was revoked. Contact support.";
    default:
      return "";
  }
}
