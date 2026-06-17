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
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="group flex min-h-[5.5rem] flex-col gap-2 rounded-sm border border-[var(--border)] bg-white p-3 shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:border-[var(--primary-muted)] hover:shadow-[var(--shadow-md)] sm:min-h-0 sm:flex-row sm:items-start sm:gap-3 sm:p-4"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-light)] text-[var(--primary)] transition-colors group-hover:bg-[var(--primary)] group-hover:text-white sm:h-10 sm:w-10 sm:rounded-xl [&_svg]:h-4 [&_svg]:w-4 sm:[&_svg]:h-5 sm:[&_svg]:w-5">
            {item.icon}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold leading-tight text-[var(--foreground)] sm:text-base">
              {item.label}
            </span>
            {item.description ?
              <span className="mt-0.5 line-clamp-2 block text-[11px] leading-snug text-[var(--foreground-muted)] sm:text-xs">
                {item.description}
              </span>
            : null}
          </span>
        </a>
      ))}
    </div>
  );
}
