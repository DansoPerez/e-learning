import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "accent"
  | "secondaryOnDark"
  | "outlineOnDark";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] border border-transparent shadow-[var(--shadow-primary)] active:scale-[0.99]",
  secondary:
    "bg-[var(--primary-light)] text-[var(--primary)] hover:bg-[var(--primary-muted)]/50 font-semibold border border-transparent",
  accent:
    "bg-[var(--accent)] text-[var(--accent-foreground)] hover:brightness-95 font-bold border border-transparent",
  outline:
    "border border-[var(--border-strong)] bg-white text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]",
  ghost:
    "text-[var(--foreground-secondary)] hover:bg-[var(--background-subtle)] hover:text-[var(--foreground)] border border-transparent",
  danger:
    "bg-[var(--danger)] text-white hover:opacity-90 border border-transparent",
  secondaryOnDark:
    "bg-white text-[var(--primary)] hover:bg-blue-50 font-bold border border-transparent",
  outlineOnDark:
    "border border-white/80 bg-transparent text-white hover:bg-white/10 font-semibold",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm min-h-[44px] sm:min-h-0",
  md: "h-10 px-5 text-sm min-h-[44px] sm:min-h-0",
  lg: "h-11 px-6 text-base min-h-[48px] sm:min-h-0",
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
        "inline-flex items-center justify-center rounded-sm font-semibold transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 touch-manipulation",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
