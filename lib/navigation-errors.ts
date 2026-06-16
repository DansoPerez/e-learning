/** Rethrow Next.js redirect/notFound errors so catch blocks do not swallow them. */
export function rethrowNavigationError(err: unknown): void {
  if (
    err &&
    typeof err === "object" &&
    "digest" in err &&
    typeof (err as { digest?: string }).digest === "string"
  ) {
    const digest = (err as { digest: string }).digest;
    if (digest.startsWith("NEXT_REDIRECT") || digest.startsWith("NEXT_NOT_FOUND")) {
      throw err;
    }
  }
}
