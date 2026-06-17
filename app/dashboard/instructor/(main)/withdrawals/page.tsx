import { InstructorDashboardWrapper } from "@/components/layout/instructor-dashboard-wrapper";
import { PayoutDetailsForm } from "@/components/instructor/payout-details-form";
import { WithdrawalForm } from "@/components/instructor/withdrawal-form";
import { requireRole } from "@/lib/auth";
import { getAvailablePayoutCountries } from "@/lib/payout-countries";
import { prisma } from "@/lib/prisma";
import { isPaystackPayoutsEnabled } from "@/lib/services/withdrawal-payout";
import { getAvailableWithdrawalBalance } from "@/lib/withdrawal-balance";

export default async function WithdrawalsPage() {
  const user = await requireRole("INSTRUCTOR");
  const paystackPayouts = isPaystackPayoutsEnabled();
  const countries = getAvailablePayoutCountries();

  const [profile, availableBalance] = await Promise.all([
    prisma.instructorProfile.findUnique({
      where: { userId: user.id },
      select: {
        balance: true,
        payoutCountry: true,
        payoutType: true,
        payoutAccountNumber: true,
        payoutBankCode: true,
      },
    }),
    getAvailableWithdrawalBalance(user.id),
  ]);

  return (
    <InstructorDashboardWrapper title="Withdrawals">
      <div className="space-y-8">
        {paystackPayouts && countries.length > 0 ?
          <PayoutDetailsForm
            countries={countries}
            payoutCountry={profile?.payoutCountry ?? null}
            payoutType={profile?.payoutType ?? null}
            payoutAccountNumber={profile?.payoutAccountNumber ?? null}
            payoutBankCode={profile?.payoutBankCode ?? null}
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
