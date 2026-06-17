import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";
import {
  approveWithdrawalFormAction,
  completeWithdrawalFormAction,
  payWithdrawalViaPaystackAction,
  rejectWithdrawalFormAction,
} from "@/app/actions/admin";
import { PAYSTACK_PAYOUT_ERROR_MESSAGES } from "@/lib/paystack-payout-errors";
import { isPaystackPayoutsEnabled } from "@/lib/services/withdrawal-payout";
import { ActionRow } from "@/components/ui/action-row";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export default async function AdminWithdrawalsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  await requireRole("ADMIN");
  const paystackPayouts = isPaystackPayoutsEnabled();
  const { error, success } = await searchParams;

  const errorMessage = error ? PAYSTACK_PAYOUT_ERROR_MESSAGES[error] ?? decodeURIComponent(error) : null;

  const withdrawals = await prisma.withdrawal.findMany({
    include: { instructor: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardWrapper role="ADMIN" title="Withdrawals">
      {paystackPayouts ?
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <strong>Paystack payouts</strong> require a Registered (non-Starter) Paystack business with
          transfers enabled. On Starter plans, approve the request and use{" "}
          <strong>Mark paid manually</strong> after sending mobile money or a bank transfer yourself.
        </p>
      : null}
      {errorMessage ?
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {errorMessage}
        </p>
      : null}
      {success === "paystack" ?
        <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Paystack payout sent successfully.
        </p>
      : null}
      <div className="space-y-4">
        {withdrawals.map((w) => (
          <div
            key={w.id}
            className="surface-card flex flex-col gap-4 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium">{w.instructor.name}</p>
              <p className="text-sm text-zinc-500">{w.instructor.email}</p>
              <p className="mt-1 font-semibold">{formatCurrency(Number(w.amount))}</p>
            </div>
            <Badge className="w-fit">{w.status}</Badge>
            {w.status === "PENDING" || w.status === "APPROVED" || w.status === "PROCESSING" ?
              <ActionRow className="w-full sm:w-auto sm:justify-end">
                {w.status === "PENDING" ?
                  <form action={approveWithdrawalFormAction.bind(null, w.id)}>
                    <Button type="submit" size="sm" variant="outline">
                      Approve
                    </Button>
                  </form>
                : null}
                {w.status === "APPROVED" && paystackPayouts ?
                  <form action={payWithdrawalViaPaystackAction.bind(null, w.id)}>
                    <Button type="submit" size="sm">
                      Pay via Paystack
                    </Button>
                  </form>
                : null}
                {(w.status === "APPROVED" || w.status === "PROCESSING") && !paystackPayouts ?
                  <form action={completeWithdrawalFormAction.bind(null, w.id)}>
                    <Button type="submit" size="sm">
                      Mark paid
                    </Button>
                  </form>
                : null}
                {w.status === "APPROVED" && paystackPayouts ?
                  <form action={completeWithdrawalFormAction.bind(null, w.id)}>
                    <Button type="submit" size="sm" variant="outline">
                      Mark paid manually
                    </Button>
                  </form>
                : null}
                {w.status === "PROCESSING" && paystackPayouts ?
                  <span className="text-xs text-[var(--foreground-muted)]">Paystack processing…</span>
                : null}
                <form action={rejectWithdrawalFormAction.bind(null, w.id)}>
                  <Button type="submit" size="sm" variant="danger">
                    Reject
                  </Button>
                </form>
              </ActionRow>
            : null}
          </div>
        ))}
      </div>
    </DashboardWrapper>
  );
}
