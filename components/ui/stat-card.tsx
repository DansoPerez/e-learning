import type { LucideIcon } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: "primary" | "success" | "accent" | "neutral";
}) {
  const tones = {
    primary: "from-[#0056d2] to-[#2a73cc]",
    success: "from-emerald-500 to-teal-600",
    accent: "from-amber-500 to-orange-500",
    neutral: "from-slate-500 to-slate-600",
  };

  return (
    <Card className="group relative overflow-hidden border-[var(--border)] bg-white p-0 shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]">
      <div className={cn("h-1 w-full bg-gradient-to-r", tones[tone])} />
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <CardDescription className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
            {label}
          </CardDescription>
          {Icon ?
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[var(--primary)] transition-colors group-hover:bg-[var(--primary)] group-hover:text-white">
              <Icon className="h-4 w-4" />
            </span>
          : null}
        </div>
        <CardTitle className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          {value}
        </CardTitle>
        {hint ?
          <p className="mt-1.5 text-xs text-[var(--foreground-muted)]">{hint}</p>
        : null}
      </div>
    </Card>
  );
}
