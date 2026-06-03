"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const message = error.message ?? "Unknown error";

  return (
    <div className="page-container flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Something went wrong</h1>
      <p className="mt-3 max-w-lg text-sm text-[var(--foreground-muted)]">
        {message.includes("DATABASE_URL") ||
          message.includes("ERR_INVALID_URL") ||
          message.includes("Invalid URL") ||
          message.includes("mongodb") ?
          "Database URL is wrong. Set DATABASE_URL to your Supabase PostgreSQL URI (postgresql://…) in .env or Vercel, then redeploy."
        : message.includes("P2025") ||
            message.includes("No record was found for an update") ?
          "Your session may be outdated or the database is empty. Run npm run db:seed on Supabase, then sign in again with admin@bravio.app."
        : message.includes("does not exist") ||
            message.includes("P2021") ||
            message.includes("relation") ?
          "Database tables are missing. Run: npm run db:push && npm run db:seed"
        : message.includes("Connection terminated") ||
            message.includes("Can't reach database") ||
            message.includes("P1001") ?
          "Cannot reach Supabase. Check DATABASE_URL and that the project is not paused."
        : "Check Vercel deployment logs (Functions) for details."}
      </p>
      <Button type="button" className="mt-6" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
