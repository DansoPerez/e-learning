import { InstructorDashboardWrapper } from "@/components/layout/instructor-dashboard-wrapper";
import { PayoutDetailsForm } from "@/components/instructor/payout-details-form";
import { WithdrawalForm } from "@/components/instructor/withdrawal-form";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listPaystackBanks, listPaystackMobileMoneyProviders } from "@/lib/paystack-transfers";
import { isPaystackPayoutsEnabled } from "@/lib/services/withdrawal-payout";
import { getAvailableWithdrawalBalance } from "@/lib/withdrawal-balance";

export default async function WithdrawalsPage() {
  const user = await requireRole("INSTRUCTOR");
  const paystackPayouts = isPaystackPayoutsEnabled();

  const [profile, availableBalance, mobileProviders, banks] = await Promise.all([
    prisma.instructorProfile.findUnique({
      where: { userId: user.id },
      select: {
        balance: true,
        payoutType: true,
        payoutAccountNumber: true,
        payoutBankCode: true,
      },
    }),
    getAvailableWithdrawalBalance(user.id),
    paystackPayouts ? listPaystackMobileMoneyProviders().catch(() => []) : Promise.resolve([]),
    paystackPayouts ? listPaystackBanks().catch(() => []) : Promise.resolve([]),
  ]);

  return (
    <InstructorDashboardWrapper title="Withdrawals">
      <div className="space-y-8">
        {paystackPayouts ?
          <PayoutDetailsForm
            payoutType={profile?.payoutType ?? null}
            payoutAccountNumber={profile?.payoutAccountNumber ?? null}
            payoutBankCode={profile?.payoutBankCode ?? null}
            mobileProviders={mobileProviders}
            banks={banks}
          />
        : null}
        <WithdrawalForm
          balance={Number(profile?.balance ?? 0)}
          availableBalance={availableBalance}
          paystackPayouts={paystackPayouts}
        />
      </div>
    </InstructorDashboardWrapper>
  );
}
