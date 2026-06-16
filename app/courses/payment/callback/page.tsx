import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { completePayment } from "@/lib/services/payment";

export default async function PaymentCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}) {
  const user = await requireAuth();
  const { reference, trxref } = await searchParams;
  const ref = reference ?? trxref;

  if (!ref) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-xl font-bold">Payment reference missing</h1>
        <Link href="/courses" className="mt-4 inline-block text-[var(--primary)] hover:underline">
          Browse courses
        </Link>
      </div>
    );
  }

  const payment = await prisma.payment.findUnique({
    where: { reference: ref },
    include: { course: true },
  });

  if (!payment || payment.userId !== user.id) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-xl font-bold">Payment not found</h1>
        <Link href="/courses" className="mt-4 inline-block text-[var(--primary)] hover:underline">
          Browse courses
        </Link>
      </div>
    );
  }

  if (payment.status !== "SUCCESS") {
    const verified = await verifyPaystackTransaction(ref);
    if (
      !verified ||
      verified.status !== "success" ||
      verified.amount !== Math.round(payment.amount * 100)
    ) {
      return (
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <h1 className="text-xl font-bold">Payment not confirmed yet</h1>
          <p className="mt-2 text-[var(--foreground-muted)]">
            We could not verify this payment with Paystack. If you were charged, wait a moment
            and refresh, or contact support with reference <strong>{ref}</strong>.
          </p>
          <Link
            href="/dashboard/student"
            className="mt-4 inline-block text-[var(--primary)] hover:underline"
          >
            Go to My Learning
          </Link>
        </div>
      );
    }

    await completePayment(ref);
  }

  const updated = await prisma.payment.findUnique({
    where: { reference: ref },
    include: { course: true },
  });

  if (updated?.status === "SUCCESS" && updated.course) {
    redirect(`/learn/${updated.course.slug}`);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="text-xl font-bold">Processing payment</h1>
      <p className="mt-2 text-[var(--foreground-muted)]">
        Please refresh in a moment if access is not granted.
      </p>
      <Link href="/dashboard/student" className="mt-4 inline-block text-[var(--primary)] hover:underline">
        Go to My Learning
      </Link>
    </div>
  );
}
