import { chargesForCourse } from "@/lib/course-pricing";
import { prisma } from "@/lib/prisma";
import { initializePaystackPayment } from "@/lib/paystack";
import { getPlatformCommission } from "@/lib/settings";
import { enrollInFreeCourse } from "@/lib/services/enrollment";

export async function initiateCoursePayment(userId: string, courseId: string) {
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
    throw new Error("You already purchased this course");
  }

  const commission = await getPlatformCommission();
  const platformShare = amount * commission;
  const instructorShare = amount - platformShare;
  const reference = `brv_${courseId}_${userId}_${Date.now()}`;

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
}

export async function completePayment(reference: string) {
  const payment = await prisma.payment.findUnique({
    where: { reference },
    include: { course: { select: { instructorId: true, title: true } } },
  });

  if (!payment || payment.status === "SUCCESS") return payment;

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "SUCCESS" },
  });

  await prisma.enrollment.upsert({
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
  const profile = await prisma.instructorProfile.findUnique({
    where: { userId: payment.course.instructorId },
  });
  if (profile) {
    await prisma.instructorProfile.update({
      where: { userId: payment.course.instructorId },
      data: { balance: { increment: instructorShare } },
    });
  }

  await prisma.earningsLedger.create({
    data: {
      userId: payment.course.instructorId,
      amount: instructorShare,
      type: "SALE",
      description: `Sale for course: ${payment.course.title}`,
      referenceId: payment.id,
    },
  });

  return prisma.payment.findUnique({ where: { reference } });
}
