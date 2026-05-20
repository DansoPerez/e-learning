import { requireRole } from "@/lib/auth";
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";
import { getPlatformCommission } from "@/lib/settings";
import { updateCommissionAction } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function AdminSettingsPage() {
  await requireRole("ADMIN");
  const commission = await getPlatformCommission();

  return (
    <DashboardWrapper role="ADMIN" title="System settings">
      <form
        action={async (formData: FormData) => {
          "use server";
          const rate = Number(formData.get("commission")) / 100;
          await updateCommissionAction(rate);
        }}
        className="max-w-md space-y-4 rounded-xl border bg-white p-6"
      >
        <div className="space-y-2">
          <Label htmlFor="commission">Platform commission (%)</Label>
          <Input
            id="commission"
            name="commission"
            type="number"
            min={0}
            max={100}
            defaultValue={Math.round(commission * 100)}
          />
          <p className="text-xs text-zinc-500">
            Instructor receives the remainder (currently {100 - Math.round(commission * 100)}%)
          </p>
        </div>
        <Button type="submit">Save</Button>
      </form>
    </DashboardWrapper>
  );
}
