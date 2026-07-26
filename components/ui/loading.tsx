import { BravioLogoMark, BravioWordmark } from "@/components/brand/bravio-logo";
import { PLATFORM_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) {
  return (
    <div
      aria-hidden
      style={{ animationDelay: delay ? `${delay}ms` : undefined }}
      className={cn(
        "loading-shimmer rounded-[var(--radius)]",
        delay > 0 && "loading-fade-up",
        className,
      )}
    />
  );
}

export function BrandLoader({
  className,
  label = "Loading",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn("relative flex flex-col items-center gap-5", className)}
    >
      <span className="sr-only">{label}</span>

      <div className="relative flex h-[4.5rem] w-[4.5rem] items-center justify-center">
        {/* Orbit ring */}
        <span
          aria-hidden
          className="loading-orbit absolute inset-0 rounded-full border-2 border-[var(--primary-light)] border-t-[var(--primary)] border-r-[var(--accent)]"
        />
        {/* Soft pulse halo */}
        <span
          aria-hidden
          className="loading-halo absolute inset-2 rounded-full bg-[var(--primary-light)]"
        />
        {/* Brand mark */}
        <span
          aria-hidden
          className="loading-mark-pop relative z-[1] flex h-12 w-12 items-center justify-center rounded-[0.55rem] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.14)] ring-1 ring-[var(--border)]"
        >
          <BravioLogoMark size="md" />
        </span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <span className="pointer-events-none inline-flex items-center gap-2" aria-hidden>
          <BravioWordmark size="sm" />
        </span>
        <span className="text-xs font-medium tracking-wide text-[var(--foreground-muted)]">
          {label}
          <span className="loading-ellipsis" aria-hidden>
            …
          </span>
        </span>
      </div>
    </div>
  );
}

export function PageLoading({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "loading-fade-up relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden bg-[var(--background)] py-20",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 55% 40% at 50% 42%, var(--primary-light) 0%, transparent 70%)",
        }}
      />
      <BrandLoader label={`Preparing ${PLATFORM_NAME}`} />
    </div>
  );
}

function CourseCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="loading-fade-up flex h-full flex-col overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Skeleton className="h-32 rounded-none sm:h-36" />
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <Skeleton className="h-4 w-full max-w-[90%]" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="mt-1 h-3 w-20" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full max-w-[95%]" />
        <div className="mt-auto flex items-center justify-between border-t border-[var(--border)] pt-3">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

function StatCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="loading-fade-up rounded-[var(--radius)] border border-[var(--border)] border-l-4 border-l-[var(--primary)] bg-white p-5 shadow-[var(--shadow-sm)]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-9 w-16" />
    </div>
  );
}

function NavItemSkeleton({ delay = 0 }: { delay?: number }) {
  return <Skeleton className="h-9 w-full" delay={delay} />;
}

export function DashboardLoadingSkeleton() {
  return (
    <div className="page-container py-6 sm:py-8">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:gap-8">
        <aside className="hidden lg:block">
          <div className="surface-card space-y-4 p-3">
            <Skeleton className="mx-3 h-3 w-16" />
            <div className="space-y-1">
              {[0, 1, 2, 3].map((i) => (
                <NavItemSkeleton key={i} delay={i * 50} />
              ))}
            </div>
          </div>
        </aside>
        <div className="min-w-0 space-y-6">
          <div className="loading-fade-up border-b border-[var(--border)] pb-5">
            <Skeleton className="h-8 w-52" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <StatCardSkeleton key={i} delay={80 + i * 60} />
            ))}
          </div>
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="loading-fade-up surface-card flex items-center justify-between gap-4 p-4"
                style={{ animationDelay: `${200 + i * 70}ms` }}
              >
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-9 w-24 shrink-0 rounded-md" />
              </div>
            ))}
          </div>
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
          <Skeleton className="loading-fade-up h-9 w-56" />
          <Skeleton className="loading-fade-up h-5 w-full max-w-xl" delay={60} />
        </div>
      </div>
      <div className="page-container py-8 sm:py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
          <aside className="lg:w-64 lg:shrink-0">
            <div className="surface-card-elevated space-y-4 p-4 sm:p-5">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full rounded-[var(--radius)]" />
              <Skeleton className="h-10 w-full rounded-[var(--radius)]" />
              <div className="space-y-2 pt-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-3 w-full" delay={i * 40} />
                ))}
              </div>
            </div>
          </aside>
          <div className="grid flex-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CourseCardSkeleton key={i} delay={100 + i * 55} />
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
          <Skeleton className="loading-fade-up h-6 w-28 rounded-full" />
          <Skeleton className="loading-fade-up h-10 w-full max-w-2xl" delay={40} />
          <Skeleton className="loading-fade-up h-5 w-full max-w-xl" delay={80} />
          <div
            className="loading-fade-up surface-card space-y-4 p-6"
            style={{ animationDelay: "120ms" }}
          >
            <Skeleton className="h-5 w-32" />
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
          <Skeleton className="loading-fade-up h-36 w-full" delay={180} />
        </div>
        <div
          className="loading-fade-up surface-card-elevated space-y-4 p-5 lg:sticky lg:top-24"
          style={{ animationDelay: "100ms" }}
        >
          <Skeleton className="h-8 w-24" />
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-4 w-full" delay={i * 50} />
            ))}
          </div>
          <Skeleton className="mt-2 h-11 w-full rounded-[var(--radius)]" />
        </div>
      </div>
    </div>
  );
}

export function LearnLoadingSkeleton() {
  return (
    <div className="page-container py-6 sm:py-8">
      <Skeleton className="loading-fade-up mb-6 h-5 w-44" />
      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          <div
            className="loading-fade-up relative aspect-video w-full max-w-4xl overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background-subtle)]"
            style={{ animationDelay: "60ms" }}
          >
            <div className="absolute inset-0 loading-shimmer opacity-60" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-[0.55rem] bg-white shadow-[var(--shadow-md)] ring-1 ring-[var(--border)]">
                <BravioLogoMark size="md" />
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <Skeleton className="loading-fade-up h-7 w-64" delay={120} />
            <Skeleton className="h-4 w-full max-w-2xl" delay={160} />
            <Skeleton className="h-4 w-full max-w-xl" delay={200} />
          </div>
        </div>
        <aside className="space-y-2">
          <Skeleton className="loading-fade-up mb-3 h-4 w-24" />
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="loading-fade-up flex items-center gap-3 rounded-[var(--radius)] border border-[var(--border)] bg-white p-3"
              style={{ animationDelay: `${140 + i * 50}ms` }}
            >
              <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
              <Skeleton className="h-3.5 flex-1" />
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}

export function FormLoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("w-full max-w-4xl space-y-5", className)}>
      <Skeleton className="loading-fade-up h-10 w-full rounded-[var(--radius)]" />
      <div className="loading-fade-up surface-card space-y-4 p-6" style={{ animationDelay: "80ms" }}>
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
      <Skeleton className="loading-fade-up h-11 w-36 rounded-[var(--radius)]" delay={160} />
    </div>
  );
}

/** @deprecated Use BrandLoader */
export function LoadingSpinner({ className }: { className?: string }) {
  return <BrandLoader className={className} />;
}
