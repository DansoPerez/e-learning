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
    <Card className="relative overflow-hidden border-[var(--border)] bg-white p-5 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]">
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[var(--primary)] to-violet-400" />
      <CardDescription className="pl-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
        {label}
      </CardDescription>
      <CardTitle className="mt-2 pl-3 text-3xl font-bold tracking-tight text-[var(--foreground)]">
        {value}
      </CardTitle>
      {hint ?
        <p className="mt-1.5 pl-3 text-xs text-[var(--foreground-muted)]">{hint}</p>
      : null}
    </Card>
  );
}
