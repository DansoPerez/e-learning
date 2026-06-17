import { randomUUID } from "crypto";
import { chargesForCourse } from "@/lib/course-pricing";
import { isPaymentsEnabled } from "@/lib/paystack-config";
import { prisma } from "@/lib/prisma";
import { initializePaystackPayment } from "@/lib/paystack";
import { getPlatformCommission } from "@/lib/settings";
import { enrollInFreeCourse, ensureEnrollment } from "@/lib/services/enrollment";

export async function initiateCoursePayment(userId: string, courseId: string) {
  if (!isPaymentsEnabled()) {
    throw new Error("Payments are not enabled — set PAYSTACK_SECRET_KEY in your environment");
  }

  const [user, course, existingPayment] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.course.findUnique({ where: { id: courseId } }),
    prisma.payment.findFirst({
      where: { userId, courseId, status: "SUCCESS" },
    }),
  ]);

  if (!user?.email) throw new Error("User not found");
  if (!course || course.status !== "PUBLISHED") {
    throw new Error("Course is not available for purchase");
  }

  const amount = Number(course.price);
  if (!chargesForCourse(amount)) {
    await enrollInFreeCourse(userId, courseId);
    return { type: "free" as const };
  }

  if (existingPayment) {
    await ensureEnrollment(userId, courseId);
    return { type: "already_owned" as const };
  }

  const pendingPayment = await prisma.payment.findFirst({
    where: { userId, courseId, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });

  if (pendingPayment) {
    try {
      const paystack = await initializePaystackPayment({
        email: user.email,
        amount,
        reference: pendingPayment.reference,
        metadata: { courseId, userId, paymentId: pendingPayment.id },
      });
      return {
        type: "paid" as const,
        authorizationUrl: paystack.authorization_url,
        reference: pendingPayment.reference,
      };
    } catch {
      await prisma.payment.update({
        where: { id: pendingPayment.id },
        data: { status: "FAILED" },
      });
    }
  }

  const commission = await getPlatformCommission();
  const platformShare = amount * commission;
  const instructorShare = amount - platformShare;
  const reference = `brv_${randomUUID()}`;

  const payment = await prisma.payment.create({
    data: {
      userId,
      courseId,
      amount,
      instructorShare,
      platformShare,
      reference,
      status: "PENDING",
    },
  });

  try {
    const paystack = await initializePaystackPayment({
      email: user.email,
      amount,
      reference: payment.reference,
      metadata: { courseId, userId, paymentId: payment.id },
    });

    return {
      type: "paid" as const,
      authorizationUrl: paystack.authorization_url,
      reference: payment.reference,
    };
  } catch (error) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });
    throw error;
  }
}

/** Creates a complimentary SUCCESS payment so admin-enrolled users can access paid courses. */
export async function ensureCompPayment(userId: string, courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { price: true },
  });
  if (!course || !chargesForCourse(Number(course.price))) return;

  const existing = await prisma.payment.findFirst({
    where: { userId, courseId, status: "SUCCESS" },
  });
  if (existing) return;

  await prisma.payment.create({
    data: {
      userId,
      courseId,
      amount: Number(course.price),
      instructorShare: 0,
      platformShare: Number(course.price),
      reference: `comp_${randomUUID()}`,
      status: "SUCCESS",
    },
  });
}

export async function completePayment(reference: string) {
  const payment = await prisma.payment.findUnique({
    where: { reference },
    include: {
      course: {
        select: { instructorId: true, title: true },
      },
    },
  });

  if (!payment || payment.status === "SUCCESS") return payment;

  return prisma.$transaction(async (tx) => {
    const updated = await tx.payment.updateMany({
      where: { id: payment.id, status: "PENDING" },
      data: { status: "SUCCESS" },
    });

    if (updated.count === 0) {
      return tx.payment.findUnique({ where: { reference } });
    }

    await tx.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: payment.userId,
          courseId: payment.courseId,
        },
      },
      create: {
        userId: payment.userId,
        courseId: payment.courseId,
      },
      update: {},
    });

    const instructorShare = Number(payment.instructorShare);
    const profile = await tx.instructorProfile.findUnique({
      where: { userId: payment.course.instructorId },
    });

    if (profile && !profile.earningsFrozen && profile.status === "APPROVED") {
      await tx.instructorProfile.update({
        where: { userId: payment.course.instructorId },
        data: { balance: { increment: instructorShare } },
      });

      await tx.earningsLedger.create({
        data: {
          userId: payment.course.instructorId,
          amount: instructorShare,
          type: "SALE",
          description: `Sale for course: ${payment.course.title}`,
          referenceId: payment.id,
        },
      });
    }

    return tx.payment.findUnique({ where: { reference } });
  });
}
