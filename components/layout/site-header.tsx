import { Suspense } from "react";
import { getServerSession } from "@/lib/session";
import { Header } from "@/components/layout/header";
import { Skeleton } from "@/components/ui/loading";

function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/95 shadow-[var(--shadow-sm)]">
      <div className="page-container">
        <div className="flex h-14 items-center gap-3 sm:h-[var(--header-height)]">
          <Skeleton className="h-7 w-24" />
          <div className="ml-auto flex items-center gap-2">
            <Skeleton className="hidden h-9 w-28 sm:block" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
      </div>
    </header>
  );
}

async function HeaderWithSession() {
  const session = await getServerSession();
  return <Header initialSession={session} />;
}

/** Streams independently so route loading.tsx / page content are not blocked by auth. */
export function SiteHeader() {
  return (
    <Suspense fallback={<HeaderSkeleton />}>
      <HeaderWithSession />
    </Suspense>
  );
}
