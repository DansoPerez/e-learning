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
          message.includes("postgresql://") ?
          "Database URL is missing or wrong on Vercel. Set DATABASE_URL to your MongoDB Atlas connection string (mongodb://… with /bravio in the path), redeploy Production, and ensure the latest code is deployed (Prisma 6 + MongoDB)."
        : message.includes("does not exist") ||
            message.includes("P2021") ||
            message.includes("Course") ||
            message.includes("findMany") ?
          "Your MongoDB database has no collections yet. Run npx prisma db push (see DEPLOY.md), then redeploy Vercel."
        : message.includes("Connection terminated") ||
            message.includes("Can't reach database") ||
            message.includes("P1001") ?
          "Database is not reachable. Check DATABASE_URL (mongodb:// or mongodb+srv://) and that MongoDB Atlas allows your IP (or 0.0.0.0/0 for Vercel)."
        : "Check Vercel deployment logs (Functions) for details."}
      </p>
      <Button type="button" className="mt-6" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
