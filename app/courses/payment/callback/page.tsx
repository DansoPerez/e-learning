import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
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
        <Link href="/courses" className="mt-4 inline-block text-indigo-600 hover:underline">
          Browse courses
        </Link>
      </div>
    );
  }

  await completePayment(ref);

  const payment = await prisma.payment.findUnique({
    where: { reference: ref },
    include: { course: true },
  });

  if (payment?.userId === user.id && payment.course) {
    redirect(`/learn/${payment.course.slug}`);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="text-xl font-bold">Processing payment</h1>
      <p className="mt-2 text-zinc-600">
        If access is not granted yet, wait a moment and refresh.
      </p>
      <Link href="/dashboard/student" className="mt-4 inline-block text-indigo-600 hover:underline">
        Go to dashboard
      </Link>
    </div>
  );
}
