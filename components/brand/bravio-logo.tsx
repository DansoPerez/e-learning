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
  xs: "h-[17px] w-[17px]",
  sm: "h-[19px] w-[19px]",
  md: "h-[21px] w-[21px]",
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
 * Bravio mark — rising skill path that still reads as a “B”.
 * Stem + three ascending bars (modules / progress) + gold achievement spark.
 * Not a stock book icon; unique to the brand.
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
      {/* Stem */}
      <rect x="6" y="5" width="4.5" height="22" rx="1" fill="currentColor" />
      {/* Ascending skill bars — form the B’s open side */}
      <rect x="12.5" y="20.5" width="7" height="4" rx="1" fill="currentColor" />
      <rect x="12.5" y="14" width="10.5" height="4" rx="1" fill="currentColor" />
      <rect x="12.5" y="7.5" width="14" height="4" rx="1" fill="currentColor" />
      {/* Achievement spark */}
      {withAccent ?
        <path
          d="M26.2 5.2 27.15 7.05 29.2 7.4 27.7 8.85 27.95 10.9 26.2 9.9 24.45 10.9 24.7 8.85 23.2 7.4 25.25 7.05 26.2 5.2Z"
          fill="var(--accent, #f2b705)"
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
        "font-extrabold tracking-[-0.045em]",
        textSizes[size],
        inverse ? "text-white" : "text-[var(--foreground)]",
        className,
      )}
    >
      Brav
      <span className={inverse ? "text-white" : "text-[var(--primary)]"}>io</span>
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
        "flex items-center justify-center rounded-[0.4rem] bg-[var(--primary-light)] text-[var(--primary)]",
      )
    : variant === "onPrimary" ?
      cn(
        markSizes[size],
        "flex items-center justify-center rounded-[0.4rem] bg-white/15 text-white ring-1 ring-inset ring-white/20",
      )
    : variant === "inverse" ?
      cn(
        markSizes[size],
        "flex items-center justify-center rounded-[0.4rem] bg-white text-[var(--primary)] shadow-sm",
      )
    : cn(
        markSizes[size],
        "flex items-center justify-center rounded-[0.4rem] bg-[var(--primary)] text-white shadow-[var(--shadow-primary)]",
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
