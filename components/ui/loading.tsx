import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse rounded-[var(--radius)] bg-[var(--background-subtle)]",
        className,
      )}
    />
  );
}

export function LoadingSpinner({ className, size = "md" }: { className?: string; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "h-4 w-4 border" : "h-5 w-5 border-2";

  return (
    <div role="status" aria-label="Loading" className={cn("inline-flex", className)}>
      <span className="sr-only">Loading</span>
      <span
        className={cn(
          "inline-block animate-spin rounded-full border-[var(--border)] border-t-[var(--primary)]",
          dim,
        )}
      />
    </div>
  );
}

export function PageLoading({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex min-h-[40vh] flex-col items-center justify-center gap-3 py-16",
        className,
      )}
    >
      <LoadingSpinner />
      <p className="text-sm text-[var(--foreground-muted)]">Loading…</p>
    </div>
  );
}

export function DashboardLoadingSkeleton() {
  return (
    <div className="page-container py-6 sm:py-8">
      <div className="grid gap-6 lg:grid-cols-[240px_1fr] lg:gap-8">
        <aside className="hidden lg:block">
          <Skeleton className="h-[420px] w-full" />
        </aside>
        <div className="min-w-0 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 sm:grid-cols-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}

export function CoursesLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="border-b border-[var(--border)] bg-white py-8 sm:py-10">
        <div className="page-container space-y-3">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-5 w-full max-w-xl" />
        </div>
      </div>
      <div className="page-container py-8 sm:py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
          <Skeleton className="h-48 w-full lg:h-72 lg:w-64 lg:shrink-0" />
          <div className="grid flex-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CourseDetailLoadingSkeleton() {
  return (
    <div className="page-container py-8 sm:py-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-full max-w-2xl" />
          <Skeleton className="h-5 w-full max-w-xl" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <Skeleton className="h-72 w-full lg:sticky lg:top-20" />
      </div>
    </div>
  );
}

export function LearnLoadingSkeleton() {
  return (
    <div className="page-container py-6 sm:py-8">
      <Skeleton className="mb-4 h-6 w-40" />
      <Skeleton className="aspect-video w-full max-w-4xl" />
      <div className="mt-6 space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-2xl" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
    </div>
  );
}

export function FormLoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("w-full max-w-4xl space-y-4", className)}>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full rounded-2xl" />
      <Skeleton className="h-10 w-32" />
    </div>
  );
}
