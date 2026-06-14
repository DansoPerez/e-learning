import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "accent";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] border border-transparent shadow-[var(--shadow-primary)] hover:shadow-lg active:scale-[0.98]",
  secondary:
    "bg-[var(--primary-light)] text-[var(--primary)] hover:bg-[var(--primary-muted)]/40 font-semibold border border-[var(--primary-muted)]/30",
  accent:
    "bg-[var(--accent)] text-[var(--accent-foreground)] hover:brightness-95 font-bold border border-transparent shadow-sm active:scale-[0.98]",
  outline:
    "border border-[var(--border-strong)] bg-white text-[var(--foreground)] hover:border-[var(--primary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)]",
  ghost:
    "text-[var(--foreground-secondary)] hover:bg-[var(--background-subtle)] hover:text-[var(--foreground)] border border-transparent",
  danger:
    "bg-[var(--danger)] text-white hover:opacity-90 border border-transparent shadow-sm active:scale-[0.98]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm min-h-[44px] sm:min-h-0",
  md: "h-11 px-5 text-sm min-h-[44px] sm:min-h-0",
  lg: "h-12 px-6 text-base min-h-[48px] sm:min-h-0",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-[var(--radius)] font-semibold transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 touch-manipulation",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
