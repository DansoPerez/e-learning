"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { logAdminAction } from "@/lib/admin-log";
import { setPlatformCommission } from "@/lib/settings";
import { assertCanModifyUser } from "@/lib/admin-guard";
import {
  enrollUserInAllPublishedCourses,
  ensureEnrollment,
} from "@/lib/services/enrollment";
import type { Role, UserStatus } from "@/app/generated/prisma/client";

async function adminOnly() {
  return requireRole("ADMIN");
}

function revalidateUserPaths(userId: string) {
  revalidatePath("/dashboard/admin/users");
  revalidatePath(`/dashboard/admin/users/${userId}`);
  revalidatePath("/dashboard/student");
  revalidatePath("/courses");
}

export async function approveInstructorAction(userId: string): Promise<void> {
  const admin = await adminOnly();

  await prisma.instructorProfile.update({
    where: { userId },
    data: { status: "APPROVED", rejectionReason: null },
  });

  await logAdminAction({
    adminId: admin.id,
    action: "APPROVE_INSTRUCTOR",
    targetType: "InstructorProfile",
    targetId: userId,
    description: `Approved instructor application for user ${userId}`,
  });

  revalidatePath("/dashboard/admin/instructors");
}

export async function rejectInstructorAction(userId: string, reason: string): Promise<void> {
  const admin = await adminOnly();

  await prisma.instructorProfile.update({
    where: { userId },
    data: { status: "REJECTED", rejectionReason: reason },
  });

  await logAdminAction({
    adminId: admin.id,
    action: "REJECT_INSTRUCTOR",
    targetType: "InstructorProfile",
    targetId: userId,
    description: `Rejected instructor: ${reason}`,
  });

  revalidatePath("/dashboard/admin/instructors");
}

export async function revokeInstructorAction(userId: string): Promise<void> {
  const admin = await adminOnly();
  assertCanModifyUser(admin.id, userId);

  await prisma.instructorProfile.update({
    where: { userId },
    data: { status: "REVOKED" },
  });

  await logAdminAction({
    adminId: admin.id,
    action: "REVOKE_INSTRUCTOR",
    targetType: "InstructorProfile",
    targetId: userId,
    description: `Revoked instructor privileges for ${userId}`,
  });

  revalidatePath("/dashboard/admin/instructors");
  revalidateUserPaths(userId);
}

export async function reinstateInstructorAction(userId: string): Promise<void> {
  const admin = await adminOnly();

  await prisma.instructorProfile.update({
    where: { userId },
    data: { status: "APPROVED", rejectionReason: null },
  });

  await logAdminAction({
    adminId: admin.id,
    action: "REINSTATE_INSTRUCTOR",
    targetType: "InstructorProfile",
    targetId: userId,
    description: `Reinstated instructor ${userId}`,
  });

  revalidatePath("/dashboard/admin/instructors");
  revalidateUserPaths(userId);
}

export async function freezeInstructorEarningsAction(userId: string): Promise<void> {
  const admin = await adminOnly();
  assertCanModifyUser(admin.id, userId);

  await prisma.instructorProfile.update({
    where: { userId },
    data: { earningsFrozen: true },
  });

  await logAdminAction({
    adminId: admin.id,
    action: "FREEZE_EARNINGS",
    targetType: "InstructorProfile",
    targetId: userId,
    description: `Froze earnings for instructor ${userId}`,
  });

  revalidateUserPaths(userId);
}

export async function unfreezeInstructorEarningsAction(userId: string): Promise<void> {
  const admin = await adminOnly();

  await prisma.instructorProfile.update({
    where: { userId },
    data: { earningsFrozen: false },
  });

  await logAdminAction({
    adminId: admin.id,
    action: "UNFREEZE_EARNINGS",
    targetType: "InstructorProfile",
    targetId: userId,
    description: `Unfroze earnings for instructor ${userId}`,
  });

  revalidateUserPaths(userId);
}

export async function approveCourseAction(courseId: string): Promise<void> {
  const admin = await adminOnly();

  await prisma.course.update({
    where: { id: courseId },
    data: { status: "APPROVED", rejectionReason: null },
  });

  await logAdminAction({
    adminId: admin.id,
    action: "APPROVE_COURSE",
    targetType: "Course",
    targetId: courseId,
    description: `Approved course ${courseId}`,
  });

  revalidatePath("/dashboard/admin/courses");
}

export async function publishCourseAction(courseId: string): Promise<void> {
  const admin = await adminOnly();

  await prisma.course.update({
    where: { id: courseId },
    data: { status: "PUBLISHED" },
  });

  await logAdminAction({
    adminId: admin.id,
    action: "PUBLISH_COURSE",
    targetType: "Course",
    targetId: courseId,
    description: `Published course ${courseId}`,
  });

  revalidatePath("/courses");
  revalidatePath("/dashboard/admin/courses");
}

export async function rejectCourseAction(courseId: string, reason: string): Promise<void> {
  const admin = await adminOnly();

  await prisma.course.update({
    where: { id: courseId },
    data: { status: "REJECTED", rejectionReason: reason },
  });

  await logAdminAction({
    adminId: admin.id,
    action: "REJECT_COURSE",
    targetType: "Course",
    targetId: courseId,
    description: `Rejected course: ${reason}`,
  });

  revalidatePath("/dashboard/admin/courses");
}

export async function hideCourseAction(courseId: string): Promise<void> {
  const admin = await adminOnly();

  await prisma.course.update({
    where: { id: courseId },
    data: { status: "HIDDEN" },
  });

  await logAdminAction({
    adminId: admin.id,
    action: "HIDE_COURSE",
    targetType: "Course",
    targetId: courseId,
    description: `Hidden course ${courseId}`,
  });

  revalidatePath("/dashboard/admin/courses");
  revalidatePath("/courses");
}

export async function unhideCourseAction(courseId: string): Promise<void> {
  const admin = await adminOnly();

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { status: true, slug: true },
  });
  if (!course || course.status !== "HIDDEN") return;

  await prisma.course.update({
    where: { id: courseId },
    data: { status: "PUBLISHED" },
  });

  await logAdminAction({
    adminId: admin.id,
    action: "UNHIDE_COURSE",
    targetType: "Course",
    targetId: courseId,
    description: `Restored hidden course ${courseId} to published`,
  });

  revalidatePath("/dashboard/admin/courses");
  revalidatePath("/courses");
  revalidatePath(`/courses/${course.slug}`);
}

export async function suspendUserAction(userId: string): Promise<void> {
  const admin = await adminOnly();
  assertCanModifyUser(admin.id, userId);

  await prisma.user.update({
    where: { id: userId },
    data: { status: "SUSPENDED" },
  });

  await logAdminAction({
    adminId: admin.id,
    action: "SUSPEND_USER",
    targetType: "User",
    targetId: userId,
    description: `Suspended user ${userId}`,
  });

  revalidateUserPaths(userId);
}

export async function activateUserAction(userId: string): Promise<void> {
  const admin = await adminOnly();
  assertCanModifyUser(admin.id, userId);

  await prisma.user.update({
    where: { id: userId },
    data: { status: "ACTIVE" },
  });

  await logAdminAction({
    adminId: admin.id,
    action: "ACTIVATE_USER",
    targetType: "User",
    targetId: userId,
    description: `Activated (unsuspended) user ${userId}`,
  });

  revalidateUserPaths(userId);
}

export async function banUserAction(userId: string): Promise<void> {
  const admin = await adminOnly();
  assertCanModifyUser(admin.id, userId);

  await prisma.user.update({
    where: { id: userId },
    data: { status: "BANNED" },
  });

  await logAdminAction({
    adminId: admin.id,
    action: "BAN_USER",
    targetType: "User",
    targetId: userId,
    description: `Banned user ${userId}`,
  });

  revalidateUserPaths(userId);
}

export async function updateUserRoleAction(
  userId: string,
  role: Role,
): Promise<void> {
  const admin = await adminOnly();
  assertCanModifyUser(admin.id, userId);

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  await logAdminAction({
    adminId: admin.id,
    action: "CHANGE_ROLE",
    targetType: "User",
    targetId: userId,
    description: `Changed role to ${role}`,
  });

  revalidateUserPaths(userId);
}

export async function grantAllCoursesAccessAction(userId: string): Promise<void> {
  const admin = await adminOnly();
  assertCanModifyUser(admin.id, userId);

  await prisma.user.update({
    where: { id: userId },
    data: { allCoursesAccess: true },
  });

  const count = await enrollUserInAllPublishedCourses(userId);

  await logAdminAction({
    adminId: admin.id,
    action: "GRANT_ALL_COURSES",
    targetType: "User",
    targetId: userId,
    description: `Granted all-courses access and enrolled in ${count} published courses`,
  });

  revalidateUserPaths(userId);
}

export async function revokeAllCoursesAccessAction(userId: string): Promise<void> {
  const admin = await adminOnly();
  assertCanModifyUser(admin.id, userId);

  await prisma.user.update({
    where: { id: userId },
    data: { allCoursesAccess: false },
  });

  await logAdminAction({
    adminId: admin.id,
    action: "REVOKE_ALL_COURSES",
    targetType: "User",
    targetId: userId,
    description: `Revoked all-courses access for user ${userId}`,
  });

  revalidateUserPaths(userId);
}

export async function enrollUserInCourseAction(
  userId: string,
  courseId: string,
): Promise<void> {
  const admin = await adminOnly();
  assertCanModifyUser(admin.id, userId);

  await ensureEnrollment(userId, courseId);

  await logAdminAction({
    adminId: admin.id,
    action: "ADMIN_ENROLL_COURSE",
    targetType: "Enrollment",
    targetId: courseId,
    description: `Admin enrolled user ${userId} in course ${courseId}`,
  });

  revalidateUserPaths(userId);
}

export async function revokeEnrollmentAction(
  userId: string,
  courseId: string,
): Promise<void> {
  const admin = await adminOnly();
  assertCanModifyUser(admin.id, userId);

  await prisma.enrollment.deleteMany({
    where: { userId, courseId },
  });

  await logAdminAction({
    adminId: admin.id,
    action: "REVOKE_ENROLLMENT",
    targetType: "Enrollment",
    targetId: courseId,
    description: `Revoked enrollment for user ${userId} in course ${courseId}`,
  });

  revalidateUserPaths(userId);
}

export async function approveWithdrawalFormAction(withdrawalId: string): Promise<void> {
  await processWithdrawalAction(withdrawalId, "APPROVE");
}

export async function completeWithdrawalFormAction(withdrawalId: string): Promise<void> {
  await processWithdrawalAction(withdrawalId, "COMPLETE");
}

export async function rejectWithdrawalFormAction(withdrawalId: string): Promise<void> {
  await processWithdrawalAction(withdrawalId, "REJECT");
}

async function processWithdrawalAction(
  withdrawalId: string,
  action: "APPROVE" | "REJECT" | "COMPLETE",
  adminNote?: string,
) {
  const admin = await adminOnly();
  const withdrawal = await prisma.withdrawal.findUnique({
    where: { id: withdrawalId },
  });
  if (!withdrawal) return;

  if (action === "REJECT" && withdrawal.status === "PENDING") {
    await prisma.$transaction([
      prisma.withdrawal.update({
        where: { id: withdrawalId },
        data: { status: "REJECTED", adminNote },
      }),
      prisma.instructorProfile.update({
        where: { userId: withdrawal.instructorId },
        data: { balance: { increment: withdrawal.amount } },
      }),
    ]);
  } else if (action === "APPROVE") {
    await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: { status: "APPROVED", adminNote },
    });
  } else if (action === "COMPLETE") {
    await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: { status: "COMPLETED", adminNote },
    });
  }

  await logAdminAction({
    adminId: admin.id,
    action: `WITHDRAWAL_${action}`,
    targetType: "Withdrawal",
    targetId: withdrawalId,
    description: `Withdrawal ${action.toLowerCase()}`,
  });

  revalidatePath("/dashboard/admin/withdrawals");
}

export async function updateCommissionAction(rate: number): Promise<void> {
  const admin = await adminOnly();
  await setPlatformCommission(rate);

  await logAdminAction({
    adminId: admin.id,
    action: "UPDATE_COMMISSION",
    targetType: "SystemSetting",
    description: `Set platform commission to ${rate * 100}%`,
  });
}

export async function createAnnouncementAction(formData: FormData): Promise<void> {
  const admin = await adminOnly();
  const message = (formData.get("message") as string)?.trim();
  const scope = formData.get("scope") as "STUDENTS" | "INSTRUCTORS" | "COURSE";
  if (!message) return;
  if (!["STUDENTS", "INSTRUCTORS", "COURSE"].includes(scope)) return;

  await prisma.announcement.create({
    data: {
      authorId: admin.id,
      message,
      scope,
    },
  });

  await logAdminAction({
    adminId: admin.id,
    action: "CREATE_ANNOUNCEMENT",
    targetType: "Announcement",
    description: `Announcement to ${scope}: ${message.slice(0, 80)}`,
  });

  revalidatePath("/dashboard/student");
  revalidatePath("/dashboard/instructor");
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/announcements");
}

export async function deleteAnnouncementAction(announcementId: string): Promise<void> {
  const admin = await adminOnly();

  await prisma.announcement.delete({ where: { id: announcementId } });

  await logAdminAction({
    adminId: admin.id,
    action: "DELETE_ANNOUNCEMENT",
    targetType: "Announcement",
    targetId: announcementId,
    description: `Deleted announcement ${announcementId}`,
  });

  revalidatePath("/dashboard/student");
  revalidatePath("/dashboard/instructor");
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/announcements");
}

export async function deleteUserAction(userId: string): Promise<void> {
  const admin = await adminOnly();
  assertCanModifyUser(admin.id, userId);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, email: true },
  });

  if (!user) {
    redirect("/dashboard/admin/users");
  }

  if (user.role === "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      throw new Error("Cannot delete the last admin account");
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.course.deleteMany({ where: { instructorId: userId } });
    await tx.payment.deleteMany({ where: { userId } });
    await tx.withdrawal.deleteMany({ where: { instructorId: userId } });
    await tx.earningsLedger.deleteMany({ where: { userId } });
    await tx.announcement.deleteMany({ where: { authorId: userId } });
    await tx.adminLog.deleteMany({ where: { adminId: userId } });
    await tx.user.delete({ where: { id: userId } });
  });

  await logAdminAction({
    adminId: admin.id,
    action: "DELETE_USER",
    targetType: "User",
    targetId: userId,
    description: `Permanently deleted user ${user.email}`,
  });

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/users");
  redirect("/dashboard/admin/users");
}
