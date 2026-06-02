import { cn } from "@/lib/utils";

/** Stacks admin action buttons full-width on mobile for reliable taps. */
export function ActionRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center",
        "[&_form]:w-full sm:[&_form]:w-auto",
        "[&_a]:block [&_a]:w-full sm:[&_a]:w-auto sm:[&_a]:inline-block",
        "[&_button]:min-h-[44px] [&_button]:w-full sm:[&_button]:w-auto",
        className,
      )}
    >
      {children}
    </div>
  );
}
