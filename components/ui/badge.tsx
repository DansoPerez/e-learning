import { cn } from "@/lib/utils";

const styles = {
  default: "bg-[var(--background-subtle)] text-[var(--foreground-secondary)] border border-[var(--border)]",
  success: "bg-[var(--success-bg)] text-[var(--success)] border border-emerald-200",
  warning: "bg-[var(--warning-bg)] text-[#7a5c00] border border-amber-200",
  danger: "bg-[var(--danger-bg)] text-[var(--danger)] border border-red-200",
  info: "bg-[var(--primary-light)] text-[var(--primary)] border border-blue-200",
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
        "inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-bold uppercase tracking-wide",
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
