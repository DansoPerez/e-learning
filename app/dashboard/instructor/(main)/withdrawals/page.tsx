import { InstructorDashboardWrapper } from "@/components/layout/instructor-dashboard-wrapper";
import { WithdrawalForm } from "@/components/instructor/withdrawal-form";

export default function WithdrawalsPage() {
  return (
    <InstructorDashboardWrapper title="Withdrawals">
      <WithdrawalForm />
    </InstructorDashboardWrapper>
  );
}
