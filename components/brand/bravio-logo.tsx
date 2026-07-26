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
  xs: "h-[22px] w-[22px]",
  sm: "h-6 w-6",
  md: "h-7 w-7",
  lg: "h-9 w-9",
  xl: "h-12 w-12",
} as const;

const textSizes = {
  xs: "text-[15px]",
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
  xl: "text-2xl",
} as const;

type LogoSize = keyof typeof markSizes;

const PETALS = {
  art: "#E64545",
  science: "#F4862A",
  reading: "#55B434",
  tech: "#2FB8A6",
} as const;

const WORDMARK_GREEN = "#14604B";

/**
 * Bravio mark — four learning-field petals (leaf shapes pointing outward):
 * art (red palette), science (orange microscope), reading (green books) and
 * tech (teal laptop). Drawn as a single self-colored SVG.
 */
export function BravioLogoMark({
  className,
  size = "md",
}: {
  className?: string;
  size?: LogoSize;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={cn(iconSizes[size], className)}
      aria-hidden
    >
      {/* Top-left petal — art */}
      <path
        fill={PETALS.art}
        d="M2 2h13a7 7 0 0 1 7 7v6a7 7 0 0 1-7 7H9a7 7 0 0 1-7-7V2Z"
      />
      <path
        fill="#fff"
        d="M12 6.6a5.4 5.4 0 1 0 .02 10.8c.9 0 1.32-1 .72-1.74-.58-.72-.06-1.8.86-1.8h1.5a1.94 1.94 0 0 0 1.94-1.92A5.5 5.5 0 0 0 12 6.6Z"
      />
      <circle cx="9.7" cy="9.7" r=".95" fill={PETALS.art} />
      <circle cx="12.5" cy="8.8" r=".95" fill={PETALS.art} />
      <circle cx="14.8" cy="10.8" r=".95" fill={PETALS.art} />

      {/* Top-right petal — science */}
      <path
        fill={PETALS.science}
        d="M46 2v13a7 7 0 0 1-7 7h-6a7 7 0 0 1-7-7V9a7 7 0 0 1 7-7h13Z"
      />
      <path fill="#fff" d="m35.1 5.4 2.5 2.5-1.6 1.6-2.5-2.5 1.6-1.6Z" />
      <path fill="#fff" d="m33.4 8.9 2.7 2.7-3.1 3.1-2.7-2.7 3.1-3.1Z" />
      <path
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        d="M39.6 16c.3-2.4-.6-4.3-2.2-5.6"
      />
      <path fill="#fff" d="M30.5 16.4h11V18h-11v-1.6Z" />

      {/* Bottom-left petal — reading */}
      <path
        fill={PETALS.reading}
        d="M2 46V33a7 7 0 0 1 7-7h6a7 7 0 0 1 7 7v6a7 7 0 0 1-7 7H2Z"
      />
      <rect x="7" y="29.8" width="10.2" height="3" rx=".9" fill="#fff" />
      <rect x="7.9" y="33.6" width="10.2" height="3" rx=".9" fill="#fff" />
      <rect x="6.5" y="37.4" width="11.4" height="3.1" rx=".9" fill="#fff" />

      {/* Bottom-right petal — tech */}
      <path
        fill={PETALS.tech}
        d="M46 46H33a7 7 0 0 1-7-7v-6a7 7 0 0 1 7-7h6a7 7 0 0 1 7 7v13Z"
      />
      <path
        fill="#fff"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M31.2 29.2h9.6c.66 0 1.2.54 1.2 1.2v6H30v-6c0-.66.54-1.2 1.2-1.2Zm1.4 1.6h6.8v4.1h-6.8v-4.1Z"
      />
      <path fill="#fff" d="M29.2 37.6h13.6l-1.3 2.3H30.5l-1.3-2.3Z" />
    </svg>
  );
}

export function BravioWordmark({
  className,
  size = "md",
  inverse = false,
  withTagline = false,
}: {
  className?: string;
  size?: LogoSize;
  inverse?: boolean;
  withTagline?: boolean;
}) {
  return (
    <span className={cn("inline-flex flex-col leading-none", className)}>
      <span
        className={cn("font-extrabold uppercase tracking-[0.02em]", textSizes[size])}
        style={inverse ? undefined : { color: WORDMARK_GREEN }}
      >
        {PLATFORM_NAME}
      </span>
      {withTagline ?
        <span
          className={cn(
            "mt-0.5 text-[0.55em] font-semibold uppercase tracking-[0.32em]",
            textSizes[size],
            inverse ? "opacity-80" : undefined,
          )}
          style={inverse ? undefined : { color: WORDMARK_GREEN }}
        >
          Since 2026
        </span>
      : null}
    </span>
  );
}

export function BravioLogo({
  showText = true,
  size = "md",
  variant = "default",
  withTagline = false,
  className,
}: {
  showText?: boolean;
  size?: LogoSize;
  variant?: "default" | "inverse" | "onPrimary" | "flat" | "bare";
  withTagline?: boolean;
  className?: string;
}) {
  const onDark = variant === "inverse" || variant === "onPrimary";

  // The mark is self-colored; on dark surfaces it sits in a white tile so the
  // petals keep their contrast.
  const mark =
    onDark ?
      <span
        className={cn(
          markSizes[size],
          "flex items-center justify-center rounded-[0.5rem] bg-white shadow-sm",
        )}
      >
        <BravioLogoMark size={size} />
      </span>
    : <BravioLogoMark size={size} />;

  return (
    <span
      className={cn("inline-flex items-center gap-2.5", className)}
      aria-label={PLATFORM_NAME}
    >
      {mark}
      {showText ?
        <span className={cn(onDark && "text-white")}>
          <BravioWordmark size={size} inverse={onDark} withTagline={withTagline} />
        </span>
      : null}
    </span>
  );
}
