import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] shadow-md shadow-indigo-500/25",
  secondary:
    "bg-[var(--primary-light)] text-[var(--primary)] hover:bg-indigo-100 font-semibold",
  outline:
    "border-2 border-[var(--border-strong)] bg-[var(--card)] text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]",
  ghost:
    "text-[var(--foreground-secondary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)]",
  danger:
    "bg-[var(--danger)] text-white hover:bg-red-700 shadow-md shadow-red-500/20",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-base",
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
        "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
