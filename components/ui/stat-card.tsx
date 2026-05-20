import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card className="border-l-4 border-l-[var(--primary)] bg-gradient-to-br from-white to-indigo-50/30">
      <CardDescription className="font-medium uppercase tracking-wide text-[var(--foreground-muted)]">
        {label}
      </CardDescription>
      <CardTitle className="mt-2 text-3xl font-extrabold text-[var(--primary)]">{value}</CardTitle>
      {hint ?
        <p className="mt-1 text-xs font-medium text-[var(--foreground-muted)]">{hint}</p>
      : null}
    </Card>
  );
}
