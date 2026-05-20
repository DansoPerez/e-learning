import { cn } from "@/lib/utils";

const styles = {
  default: "bg-slate-100 text-slate-800 border border-slate-200",
  success: "bg-emerald-50 text-emerald-800 border border-emerald-200",
  warning: "bg-amber-50 text-amber-900 border border-amber-200",
  danger: "bg-red-50 text-red-800 border border-red-200",
  info: "bg-indigo-50 text-indigo-800 border border-indigo-200",
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
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
