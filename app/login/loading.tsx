import { FormLoadingSkeleton } from "@/components/ui/loading";

export default function Loading() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-[var(--background)] px-4 py-12">
      <FormLoadingSkeleton className="max-w-md" />
    </div>
  );
}
