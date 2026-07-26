import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  hrefForPage,
  className,
}: {
  page: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "flex flex-col items-center justify-between gap-3 border-t border-[var(--border)] pt-6 sm:flex-row",
        className,
      )}
    >
      <p className="text-sm text-[var(--foreground-muted)]">
        Page <span className="font-semibold text-[var(--foreground)]">{page}</span> of{" "}
        <span className="font-semibold text-[var(--foreground)]">{totalPages}</span>
      </p>
      <div className="flex items-center gap-2">
        {prev ?
          <Link
            href={hrefForPage(prev)}
            className="inline-flex h-10 items-center gap-1.5 rounded-[var(--radius)] border border-[var(--border-strong)] bg-white px-3.5 text-sm font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Previous
          </Link>
        : <span className="inline-flex h-10 cursor-not-allowed items-center gap-1.5 rounded-[var(--radius)] border border-[var(--border)] px-3.5 text-sm font-semibold text-[var(--foreground-muted)] opacity-50">
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Previous
          </span>
        }
        {next ?
          <Link
            href={hrefForPage(next)}
            className="inline-flex h-10 items-center gap-1.5 rounded-[var(--radius)] bg-[var(--primary)] px-3.5 text-sm font-semibold text-white shadow-[var(--shadow-primary)] transition-opacity hover:opacity-90"
          >
            Next
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        : <span className="inline-flex h-10 cursor-not-allowed items-center gap-1.5 rounded-[var(--radius)] bg-[var(--primary)] px-3.5 text-sm font-semibold text-white opacity-40">
            Next
            <ChevronRight className="h-4 w-4" aria-hidden />
          </span>
        }
      </div>
    </nav>
  );
}
