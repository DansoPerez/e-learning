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
  xs: "h-4 w-4",
  sm: "h-[18px] w-[18px]",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-7 w-7",
} as const;

const textSizes = {
  xs: "text-[15px]",
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
  xl: "text-2xl",
} as const;

type LogoSize = keyof typeof markSizes;

export function BravioLogoMark({ className, size = "md" }: { className?: string; size?: LogoSize }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn(iconSizes[size], className)} aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 4.5H12.1C15.1 4.5 17.2 6.3 17.2 8.7C17.2 10.4 16.2 11.7 14.6 12.3C16.4 12.8 17.7 14.4 17.7 16.6C17.7 19.6 15.1 21.5 11.7 21.5H7V4.5ZM10.1 7.3V10.8H11.6C12.9 10.8 13.7 10.1 13.7 9.05C13.7 7.95 12.9 7.3 11.6 7.3H10.1ZM10.1 13.4V18.7H12C13.6 18.7 14.7 17.7 14.7 16.05C14.7 14.4 13.6 13.4 12 13.4H10.1Z"
        fill="currentColor"
      />
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
    <span className={cn("font-bold tracking-tight", textSizes[size], inverse ? "text-white" : "text-[var(--foreground)]", className)}>
      Bravio
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
  variant?: "default" | "inverse" | "onPrimary" | "flat";
  className?: string;
}) {
  const markBox =
    variant === "flat" ?
      cn(markSizes[size], "flex items-center justify-center bg-[var(--primary-light)] text-[var(--primary)]")
    : variant === "onPrimary" ?
      cn(markSizes[size], "flex items-center justify-center bg-white/15 text-white ring-1 ring-inset ring-white/25")
    : variant === "inverse" ?
      cn(markSizes[size], "flex items-center justify-center bg-white text-[var(--primary)]")
    : cn(markSizes[size], "flex items-center justify-center bg-[var(--primary)] text-white");

  return (
    <span className={cn("inline-flex items-center gap-2", className)} aria-label={PLATFORM_NAME}>
      <span className={markBox}>
        <BravioLogoMark size={size} />
      </span>
      {showText ?
        <BravioWordmark size={size} inverse={variant === "inverse" || variant === "onPrimary"} />
      : null}
    </span>
  );
}
