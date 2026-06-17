"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { logAudit } from "@/lib/audit-log";
import { setPlatformCommission } from "@/lib/settings";
import { assertCanManageUser } from "@/lib/admin-guard";
import {
  requireAdmin,
  requireSensitiveAdmin,
  requireSuperAdmin,
} from "@/lib/admin-permissions";
import { generateUserCode } from "@/lib/user-code";
import { createNotification } from "@/lib/notifications";
import {
  initiateWithdrawalPaystackTransfer,
  isPaystackPayoutsEnabled,
} from "@/lib/services/withdrawal-payout";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import {
  adminEnrollUserInCourse,
  enrollUserInAllPublishedCourses,
  recalculateCourseEnrollments,
  revokeCourseEnrollment,
  updateCourseProgress,
} from "@/lib/services/enrollment";
import type { Role, UserStatus } from "@/app/generated/prisma/client";

async function adminOnly() {
  return requireAdmin();
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

  await createNotification({
    userId,
    type: "INSTRUCTOR_PENDING",
    title: "Instructor application approved",
    body: "You can now access the instructor dashboard.",
    link: "/dashboard/instructor",
  });

  await logAudit({
    actorId: admin.id,
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

  await logAudit({
    actorId: admin.id,
    action: "REJECT_INSTRUCTOR",
    targetType: "InstructorProfile",
    targetId: userId,
    description: `Rejected instructor: ${reason}`,
  });

  revalidatePath("/dashboard/admin/instructors");
}

export async function revokeInstructorAction(userId: string): Promise<void> {
  const admin = await adminOnly();
  await assertCanManageUser(admin.id, userId);

  await prisma.instructorProfile.update({
    where: { userId },
    data: { status: "REVOKED" },
  });

  await logAudit({
    actorId: admin.id,
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

  await logAudit({
    actorId: admin.id,
    action: "REINSTATE_INSTRUCTOR",
    targetType: "InstructorProfile",
    targetId: userId,
    description: `Reinstated instructor ${userId}`,
  });

  revalidatePath("/dashboard/admin/instructors");
  revalidateUserPaths(userId);
}

export async function freezeInstructorEarningsAction(userId: string): Promise<void> {
  const admin = await requireSensitiveAdmin();
  await assertCanManageUser(admin.id, userId);

  await prisma.instructorProfile.update({
    where: { userId },
    data: { earningsFrozen: true },
  });

  await logAudit({
    actorId: admin.id,
    action: "FREEZE_EARNINGS",
    targetType: "InstructorProfile",
    targetId: userId,
    description: `Froze earnings for instructor ${userId}`,
  });

  revalidateUserPaths(userId);
}

export async function unfreezeInstructorEarningsAction(userId: string): Promise<void> {
  const admin = await requireSensitiveAdmin();
  await assertCanManageUser(admin.id, userId);

  await prisma.instructorProfile.update({
    where: { userId },
    data: { earningsFrozen: false },
  });

  await logAudit({
    actorId: admin.id,
    action: "UNFREEZE_EARNINGS",
    targetType: "InstructorProfile",
    targetId: userId,
    description: `Unfroze earnings for instructor ${userId}`,
  });

  revalidateUserPaths(userId);
}

export async function approveCourseAction(courseId: string): Promise<void> {
  const admin = await adminOnly();

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { status: true },
  });
  if (!course || course.status !== "PENDING") {
    throw new Error("Only pending courses can be approved");
  }

  await prisma.course.update({
    where: { id: courseId },
    data: { status: "APPROVED", rejectionReason: null },
  });

  await logAudit({
    actorId: admin.id,
    action: "APPROVE_COURSE",
    targetType: "Course",
    targetId: courseId,
    description: `Approved course ${courseId}`,
  });

  revalidatePath("/dashboard/admin/courses");
}

export async function publishCourseAction(courseId: string): Promise<void> {
  const admin = await adminOnly();

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { status: true },
  });
  if (!course || course.status !== "APPROVED") {
    throw new Error("Only approved courses can be published");
  }

  await prisma.course.update({
    where: { id: courseId },
    data: { status: "PUBLISHED" },
  });

  await logAudit({
    actorId: admin.id,
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

  await logAudit({
    actorId: admin.id,
    action: "REJECT_COURSE",
    targetType: "Course",
    targetId: courseId,
    description: `Rejected course: ${reason}`,
  });

  revalidatePath("/dashboard/admin/courses");
}

export async function hideCourseAction(courseId: string): Promise<void> {
  const admin = await adminOnly();

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { status: true },
  });
  if (!course) return;
  if (course.status !== "PUBLISHED" && course.status !== "APPROVED") return;

  await prisma.course.update({
    where: { id: courseId },
    data: { status: "HIDDEN" },
  });

  await logAudit({
    actorId: admin.id,
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

  await logAudit({
    actorId: admin.id,
    action: "UNHIDE_COURSE",
    targetType: "Course",
    targetId: courseId,
    description: `Restored hidden course ${courseId} to published`,
  });

  revalidatePath("/dashboard/admin/courses");
  revalidatePath("/courses");
  revalidatePath(`/courses/${course.slug}`);
}

export async function deleteCoursePermanentAction(courseId: string): Promise<void> {
  const admin = await adminOnly();

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, slug: true },
  });
  if (!course) return;

  await prisma.course.delete({ where: { id: courseId } });

  await logAudit({
    actorId: admin.id,
    action: "DELETE_COURSE",
    targetType: "Course",
    targetId: courseId,
    description: `Permanently deleted course: ${course.title}`,
  });

  revalidatePath("/dashboard/admin/courses");
  revalidatePath("/courses");
  revalidatePath(`/courses/${course.slug}`);
}

export async function updateCoursePriceAction(
  courseId: string,
  formData: FormData,
): Promise<void> {
  const admin = await adminOnly();

  const raw = formData.get("price");
  const price = Number(raw);
  if (raw === null || raw === "" || Number.isNaN(price) || price < 0) return;

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return;

  await prisma.course.update({
    where: { id: courseId },
    data: { price },
  });

  await logAudit({
    actorId: admin.id,
    action: "UPDATE_COURSE_PRICE",
    targetType: "Course",
    targetId: courseId,
    description: `Set course price to ${price}`,
  });

  revalidatePath("/dashboard/admin/courses");
  revalidatePath("/courses");
  revalidatePath(`/courses/${course.slug}`);
}

export async function suspendUserAction(userId: string): Promise<void> {
  const admin = await adminOnly();
  await assertCanManageUser(admin.id, userId);

  await prisma.user.update({
    where: { id: userId },
    data: { status: "SUSPENDED" },
  });

  await logAudit({
    actorId: admin.id,
    action: "SUSPEND_USER",
    targetType: "User",
    targetId: userId,
    description: `Suspended user ${userId}`,
  });

  revalidateUserPaths(userId);
}

export async function activateUserAction(userId: string): Promise<void> {
  const admin = await adminOnly();
  await assertCanManageUser(admin.id, userId);

  await prisma.user.update({
    where: { id: userId },
    data: { status: "ACTIVE" },
  });

  await logAudit({
    actorId: admin.id,
    action: "ACTIVATE_USER",
    targetType: "User",
    targetId: userId,
    description: `Activated (unsuspended) user ${userId}`,
  });

  revalidateUserPaths(userId);
}

export async function banUserAction(userId: string): Promise<void> {
  const admin = await adminOnly();
  await assertCanManageUser(admin.id, userId);

  await prisma.user.update({
    where: { id: userId },
    data: { status: "BANNED" },
  });

  await logAudit({
    actorId: admin.id,
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
  await assertCanManageUser(admin.id, userId);

  if (role === "ADMIN") {
    await requireSuperAdmin();
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!target) throw new Error("User not found");

  if (target.role === "ADMIN" && role !== "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      throw new Error("Cannot demote the last admin account");
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  await logAudit({
    actorId: admin.id,
    action: "CHANGE_ROLE",
    targetType: "User",
    targetId: userId,
    description: `Changed role to ${role}`,
  });

  revalidateUserPaths(userId);
}

export async function grantAllCoursesAccessAction(userId: string): Promise<void> {
  const admin = await requireSensitiveAdmin();
  await assertCanManageUser(admin.id, userId);

  await prisma.user.update({
    where: { id: userId },
    data: { allCoursesAccess: true },
  });

  const count = await enrollUserInAllPublishedCourses(userId);

  await logAudit({
    actorId: admin.id,
    action: "GRANT_ALL_COURSES",
    targetType: "User",
    targetId: userId,
    description: `Granted all-courses access and enrolled in ${count} published courses`,
  });

  revalidateUserPaths(userId);
}

export async function revokeAllCoursesAccessAction(userId: string): Promise<void> {
  const admin = await requireSensitiveAdmin();
  await assertCanManageUser(admin.id, userId);

  await prisma.user.update({
    where: { id: userId },
    data: { allCoursesAccess: false },
  });

  await logAudit({
    actorId: admin.id,
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
  await assertCanManageUser(admin.id, userId);

  await adminEnrollUserInCourse(userId, courseId);

  await logAudit({
    actorId: admin.id,
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
  await assertCanManageUser(admin.id, userId);

  await revokeCourseEnrollment(userId, courseId);

  await logAudit({
    actorId: admin.id,
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

export async function payWithdrawalViaPaystackAction(withdrawalId: string): Promise<void> {
  const admin = await requireSensitiveAdmin();
  const result = await initiateWithdrawalPaystackTransfer(withdrawalId);

  await logAudit({
    actorId: admin.id,
    action: "WITHDRAWAL_PAYSTACK",
    targetType: "Withdrawal",
    targetId: withdrawalId,
    description:
      result.status === "completed" ?
        "Paid instructor via Paystack"
      : "Paystack transfer initiated (pending confirmation)",
  });

  revalidatePath("/dashboard/admin/withdrawals");
  revalidatePath("/dashboard/instructor/withdrawals");
  revalidatePath("/dashboard/instructor");
}

export async function rejectWithdrawalFormAction(withdrawalId: string): Promise<void> {
  await processWithdrawalAction(withdrawalId, "REJECT");
}

async function processWithdrawalAction(
  withdrawalId: string,
  action: "APPROVE" | "REJECT" | "COMPLETE",
  adminNote?: string,
) {
  const admin = await requireSensitiveAdmin();
  const withdrawal = await prisma.withdrawal.findUnique({
    where: { id: withdrawalId },
  });
  if (!withdrawal) return;

  if (action === "REJECT") {
    if (
      withdrawal.status !== "PENDING" &&
      withdrawal.status !== "APPROVED" &&
      withdrawal.status !== "PROCESSING"
    ) {
      throw new Error("This withdrawal cannot be rejected");
    }
    await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: { status: "REJECTED", adminNote },
    });
  } else if (action === "APPROVE") {
    if (withdrawal.status !== "PENDING") {
      throw new Error("Only pending withdrawals can be approved");
    }

    const profile = await prisma.instructorProfile.findUnique({
      where: { userId: withdrawal.instructorId },
      select: { balance: true },
    });
    if (!profile || Number(profile.balance) < withdrawal.amount) {
      throw new Error("Instructor no longer has sufficient balance for this withdrawal");
    }

    await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: { status: "APPROVED", adminNote },
    });
  } else if (action === "COMPLETE") {
    if (withdrawal.status !== "APPROVED" && withdrawal.status !== "PROCESSING") {
      throw new Error("Only approved withdrawals can be marked complete");
    }

    await prisma.$transaction(async (tx) => {
      const deducted = await tx.instructorProfile.updateMany({
        where: {
          userId: withdrawal.instructorId,
          balance: { gte: withdrawal.amount },
        },
        data: { balance: { decrement: withdrawal.amount } },
      });
      if (deducted.count === 0) {
        throw new Error("Instructor no longer has sufficient balance to complete this payout");
      }

      await tx.withdrawal.update({
        where: { id: withdrawalId },
        data: { status: "COMPLETED", adminNote },
      });
    });
  }

  await logAudit({
    actorId: admin.id,
    action: `WITHDRAWAL_${action}`,
    targetType: "Withdrawal",
    targetId: withdrawalId,
    description: `Withdrawal ${action.toLowerCase()}`,
  });

  revalidatePath("/dashboard/admin/withdrawals");
  revalidatePath("/dashboard/instructor/withdrawals");
  revalidatePath("/dashboard/instructor");
}

export async function updateCommissionAction(rate: number): Promise<void> {
  const admin = await requireSensitiveAdmin();
  if (Number.isNaN(rate) || rate < 0 || rate > 1) {
    throw new Error("Commission must be between 0 and 1");
  }
  await setPlatformCommission(rate);

  await logAudit({
    actorId: admin.id,
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

  await logAudit({
    actorId: admin.id,
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

  await logAudit({
    actorId: admin.id,
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
  const admin = await requireSensitiveAdmin();
  await assertCanManageUser(admin.id, userId);

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

  await prisma.course.deleteMany({ where: { instructorId: userId } });
  await prisma.payment.deleteMany({ where: { userId } });
  await prisma.withdrawal.deleteMany({ where: { instructorId: userId } });
  await prisma.earningsLedger.deleteMany({ where: { userId } });
  await prisma.announcement.deleteMany({ where: { authorId: userId } });
  await prisma.auditLog.deleteMany({ where: { actorId: userId } });
  await prisma.user.delete({ where: { id: userId } });

  await logAudit({
    actorId: admin.id,
    action: "DELETE_USER",
    targetType: "User",
    targetId: userId,
    description: `Permanently deleted user ${user.email}`,
  });

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/users");
  redirect("/dashboard/admin/users");
}

export type CreateAdminResult = {
  userCode: string;
  email: string;
  password: string;
  error?: string;
};

export async function createAdminAccountAction(
  _prev: CreateAdminResult | null,
  formData: FormData,
): Promise<CreateAdminResult> {
  const superAdmin = await requireSuperAdmin();

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (!name || !email) {
    return { userCode: "", email: "", password: "", error: "Name and email are required" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { userCode: "", email: "", password: "", error: "Email already in use" };
  }

  const password = randomBytes(9).toString("base64url");
  const passwordHash = await bcrypt.hash(password, 12);
  const userCode = await generateUserCode("ADMIN", name);

  const created = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "ADMIN",
      userCode,
      emailVerified: new Date(),
      isSuperAdmin: false,
      adminSensitiveApproved: false,
      adminSensitiveSuspended: false,
    },
  });

  await logAudit({
    actorId: superAdmin.id,
    action: "CREATE_ADMIN",
    targetType: "User",
    targetId: created.id,
    description: `Created admin account ${userCode} for ${email}`,
  });

  revalidatePath("/dashboard/admin/users");
  return { userCode, email, password };
}

export async function suspendAdminSensitivePermissionsAction(
  targetAdminId: string,
): Promise<void> {
  const superAdmin = await requireSuperAdmin();
  await assertCanManageUser(superAdmin.id, targetAdminId);

  const target = await prisma.user.findUnique({
    where: { id: targetAdminId },
    select: { role: true, isSuperAdmin: true, userCode: true },
  });
  if (!target || target.role !== "ADMIN") {
    throw new Error("Target is not an admin");
  }
  if (target.isSuperAdmin) {
    throw new Error("Cannot suspend super admin permissions");
  }

  await prisma.user.update({
    where: { id: targetAdminId },
    data: {
      adminSensitiveApproved: false,
      adminSensitiveSuspended: true,
    },
  });

  await logAudit({
    actorId: superAdmin.id,
    action: "REVOKE_ADMIN_SENSITIVE",
    targetType: "User",
    targetId: targetAdminId,
    description: `Revoked sensitive access for admin ${target.userCode}`,
  });

  revalidateUserPaths(targetAdminId);
}

export async function restoreAdminSensitivePermissionsAction(
  targetAdminId: string,
): Promise<void> {
  const superAdmin = await requireSuperAdmin();
  await assertCanManageUser(superAdmin.id, targetAdminId);

  await prisma.user.update({
    where: { id: targetAdminId },
    data: {
      adminSensitiveApproved: true,
      adminSensitiveSuspended: false,
    },
  });

  await logAudit({
    actorId: superAdmin.id,
    action: "APPROVE_ADMIN_SENSITIVE",
    targetType: "User",
    targetId: targetAdminId,
    description: `Approved sensitive access for admin ${targetAdminId}`,
  });

  revalidateUserPaths(targetAdminId);
}

export async function toggleCourseFeaturedAction(courseId: string): Promise<void> {
  const admin = await adminOnly();

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { featured: true, title: true },
  });
  if (!course) return;

  await prisma.course.update({
    where: { id: courseId },
    data: { featured: !course.featured },
  });

  await logAudit({
    actorId: admin.id,
    action: course.featured ? "UNFEATURE_COURSE" : "FEATURE_COURSE",
    targetType: "Course",
    targetId: courseId,
    description: `${course.featured ? "Removed" : "Set"} featured: ${course.title}`,
  });

  revalidatePath("/dashboard/admin/courses");
  revalidatePath("/");
  revalidatePath("/courses");
}

export async function updateInstructorProfileAction(
  userId: string,
  formData: FormData,
): Promise<{ error?: string }> {
  const admin = await adminOnly();

  const bio = String(formData.get("bio") ?? "").trim();
  const expertise = String(formData.get("expertise") ?? "").trim();
  const qualification = String(formData.get("qualification") ?? "").trim();
  const experienceYears = Number(formData.get("experienceYears") ?? 0);

  if (!bio || !expertise || !qualification || experienceYears < 0) {
    return { error: "All profile fields are required." };
  }

  await prisma.instructorProfile.update({
    where: { userId },
    data: { bio, expertise, qualification, experienceYears },
  });

  await logAudit({
    actorId: admin.id,
    action: "UPDATE_INSTRUCTOR_PROFILE",
    targetType: "InstructorProfile",
    targetId: userId,
    description: `Updated instructor profile for ${userId}`,
  });

  revalidatePath("/dashboard/admin/instructors");
  revalidateUserPaths(userId);
  return {};
}

export async function toggleQuizEnabledAction(
  quizId: string,
  enabled: boolean,
): Promise<void> {
  const admin = await adminOnly();

  const quiz = await prisma.quiz.update({
    where: { id: quizId },
    data: { isEnabled: enabled },
    select: { courseId: true, course: { select: { slug: true } } },
  });

  await recalculateCourseEnrollments(quiz.courseId);

  await logAudit({
    actorId: admin.id,
    action: enabled ? "ENABLE_QUIZ" : "DISABLE_QUIZ",
    targetType: "Quiz",
    targetId: quizId,
    description: `${enabled ? "Enabled" : "Disabled"} quiz ${quizId}`,
  });

  revalidatePath("/dashboard/admin/quizzes");
  revalidatePath(`/learn/${quiz.course.slug}`);
}

export async function overrideQuizAttemptAction(
  attemptId: string,
  formData: FormData,
): Promise<void> {
  const admin = await requireSensitiveAdmin();

  const score = Number(formData.get("score"));
  const passed = formData.get("passed") === "true";

  if (Number.isNaN(score) || score < 0 || score > 100) {
    throw new Error("Score must be between 0 and 100.");
  }

  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: { quiz: { select: { title: true, courseId: true } } },
  });
  if (!attempt) throw new Error("Attempt not found");

  await prisma.quizAttempt.update({
    where: { id: attemptId },
    data: { score, passed },
  });

  await logAudit({
    actorId: admin.id,
    action: "OVERRIDE_QUIZ_ATTEMPT",
    targetType: "QuizAttempt",
    targetId: attemptId,
    description: `Override quiz "${attempt.quiz.title}" attempt to ${score}% (${passed ? "pass" : "fail"})`,
  });

  await updateCourseProgress(attempt.userId, attempt.quiz.courseId);

  revalidatePath("/dashboard/admin/quizzes");
}
