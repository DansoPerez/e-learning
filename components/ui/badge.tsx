import { cn } from "@/lib/utils";

const styles = {
  default: "bg-slate-100 text-[var(--foreground-secondary)] border border-[var(--border)]",
  success: "bg-[var(--success-bg)] text-[var(--success)] border border-emerald-200/80",
  warning: "bg-[var(--warning-bg)] text-amber-800 border border-amber-200/80",
  danger: "bg-[var(--danger-bg)] text-[var(--danger)] border border-red-200/80",
  info: "bg-[var(--primary-light)] text-[var(--primary)] border border-indigo-200/80",
} as const;

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: keyof typeof styles;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide",
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
