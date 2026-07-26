import { PLATFORM_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const markSizes = {
  xs: "h-7 w-7",
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-11 w-11",
  xl: "h-14 w-14",
} as const;

const iconSizes = {
  xs: "h-[18px] w-[18px]",
  sm: "h-5 w-5",
  md: "h-[22px] w-[22px]",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
} as const;

const textSizes = {
  xs: "text-[15px]",
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
  xl: "text-2xl",
} as const;

type LogoSize = keyof typeof markSizes;

/**
 * Bravio mark — custom open “B” monogram (doorway into learning) with a gold
 * forward chevron in the gap. Path-drawn, not a font glyph or stock icon.
 */
export function BravioLogoMark({
  className,
  size = "md",
  withAccent = true,
}: {
  className?: string;
  size?: LogoSize;
  withAccent?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={cn(iconSizes[size], className)}
      aria-hidden
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 4h9.2c3.85 0 6.55 2.15 6.55 5.35 0 2.05-1.1 3.55-2.85 4.4 2.25.85 3.7 2.7 3.7 5.2 0 3.85-3.2 6.05-7.55 6.05H7V4Zm4.35 3.55v5.05h4.55c1.7 0 2.7-.9 2.7-2.45s-1-2.6-2.7-2.6h-4.55Zm0 8.35V21.1h5.2c2.15 0 3.4-1.15 3.4-2.95s-1.25-2.25-3.4-2.25h-5.2Z"
      />
      {withAccent ?
        <path
          fill="var(--accent, #f2b705)"
          d="M24.2 14.1 28.4 16.35 24.2 18.6v-2.05l2.15-.9-2.15-.9v-1.65Z"
        />
      : null}
    </svg>
  );
}

export function BravioWordmark({
  className,
  size = "md",
  inverse = false,
}: {
  className?: string;
  size?: LogoSize;
  inverse?: boolean;
}) {
  return (
    <span
      className={cn(
        "font-extrabold tracking-[-0.04em]",
        textSizes[size],
        inverse ? "text-white" : "text-[var(--foreground)]",
        className,
      )}
    >
      {PLATFORM_NAME}
    </span>
  );
}

export function BravioLogo({
  showText = true,
  size = "md",
  variant = "default",
  className,
}: {
  showText?: boolean;
  size?: LogoSize;
  variant?: "default" | "inverse" | "onPrimary" | "flat" | "bare";
  className?: string;
}) {
  if (variant === "bare") {
    return (
      <span className={cn("inline-flex items-center gap-2.5", className)} aria-label={PLATFORM_NAME}>
        <span className={cn("flex items-center justify-center text-[var(--primary)]", markSizes[size])}>
          <BravioLogoMark size={size} />
        </span>
        {showText ? <BravioWordmark size={size} /> : null}
      </span>
    );
  }

  const markBox =
    variant === "flat" ?
      cn(
        markSizes[size],
        "flex items-center justify-center rounded-[0.45rem] bg-[var(--primary-light)] text-[var(--primary)]",
      )
    : variant === "onPrimary" ?
      cn(
        markSizes[size],
        "flex items-center justify-center rounded-[0.45rem] bg-white/15 text-white ring-1 ring-inset ring-white/20",
      )
    : variant === "inverse" ?
      cn(
        markSizes[size],
        "flex items-center justify-center rounded-[0.45rem] bg-white text-[var(--primary)] shadow-sm",
      )
    : cn(
        markSizes[size],
        "flex items-center justify-center rounded-[0.45rem] bg-[var(--primary)] text-white shadow-[var(--shadow-primary)]",
      );

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)} aria-label={PLATFORM_NAME}>
      <span className={markBox}>
        <BravioLogoMark size={size} withAccent={variant !== "inverse"} />
      </span>
      {showText ?
        <BravioWordmark size={size} inverse={variant === "inverse" || variant === "onPrimary"} />
      : null}
    </span>
  );
}
