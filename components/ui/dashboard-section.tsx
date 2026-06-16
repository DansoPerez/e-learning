import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function DashboardSection({
  title,
  description,
  children,
  className,
  action,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[var(--foreground)]">{title}</h2>
          {description ?
            <p className="mt-0.5 text-sm text-[var(--foreground-muted)]">{description}</p>
          : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function DashboardHero({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-sm border border-[var(--border)] bg-gradient-to-br from-[#0056d2] to-[#00419e] p-5 text-white shadow-[var(--shadow-md)] sm:p-6",
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="relative">
        {eyebrow ?
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-100">{eyebrow}</p>
        : null}
        <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-blue-100 sm:text-base">
          {description}
        </p>
        {children ?
          <div className="mt-4 flex flex-wrap gap-2">{children}</div>
        : null}
      </div>
    </div>
  );
}

export function QuickActionGrid({
  items,
}: {
  items: { href: string; label: string; icon: ReactNode; description?: string }[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="group flex items-start gap-3 rounded-sm border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:border-[var(--primary-muted)] hover:shadow-[var(--shadow-md)]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[var(--primary)] transition-colors group-hover:bg-[var(--primary)] group-hover:text-white">
            {item.icon}
          </span>
          <span className="min-w-0">
            <span className="block font-semibold text-[var(--foreground)]">{item.label}</span>
            {item.description ?
              <span className="mt-0.5 block text-xs text-[var(--foreground-muted)]">
                {item.description}
              </span>
            : null}
          </span>
        </a>
      ))}
    </div>
  );
}
