"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Category = {
  id: string;
  slug: string;
  name: string;
};

export function CourseCategoryFilter({
  categories,
  activeSlug,
  query,
  className,
}: {
  categories: Category[];
  activeSlug?: string;
  query?: string;
  className?: string;
}) {
  const router = useRouter();

  function buildUrl(categorySlug: string) {
    const params = new URLSearchParams();
    if (query?.trim()) params.set("q", query.trim());
    if (categorySlug) params.set("category", categorySlug);
    const qs = params.toString();
    return qs ? `/courses?${qs}` : "/courses";
  }

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    router.push(buildUrl(e.target.value));
  }

  return (
    <label className={cn("block min-w-0", className)}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
        Category
      </span>
      <select
        value={activeSlug ?? ""}
        onChange={onChange}
        className="input-field"
        aria-label="Filter by category"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  );
}
