import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";
import {
  approveWithdrawalFormAction,
  completeWithdrawalFormAction,
  rejectWithdrawalFormAction,
} from "@/app/actions/admin";
import { ActionRow } from "@/components/ui/action-row";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export default async function AdminWithdrawalsPage() {
  await requireRole("ADMIN");

  const withdrawals = await prisma.withdrawal.findMany({
    include: { instructor: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardWrapper role="ADMIN" title="Withdrawals">
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
            {w.status === "PENDING" || w.status === "APPROVED" ?
              <ActionRow className="w-full sm:w-auto sm:justify-end">
                <form action={approveWithdrawalFormAction.bind(null, w.id)}>
                  <Button type="submit" size="sm" variant="outline">
                    Approve
                  </Button>
                </form>
                <form action={completeWithdrawalFormAction.bind(null, w.id)}>
                  <Button type="submit" size="sm">
                    Mark paid
                  </Button>
                </form>
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
