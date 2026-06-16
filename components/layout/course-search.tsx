"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type CourseSearchProps = {
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  size?: "sm" | "lg";
};

export function CourseSearch({
  defaultValue = "",
  placeholder = "What do you want to learn?",
  className,
  inputClassName,
  size = "sm",
}: CourseSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/courses?q=${encodeURIComponent(q)}` : "/courses");
  }

  return (
    <form onSubmit={onSubmit} className={cn("relative w-full", className)}>
      <Search
        className={cn(
          "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]",
          size === "lg" ? "h-5 w-5" : "h-4 w-4",
        )}
        aria-hidden
      />
      <input
        type="search"
        name="q"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-sm border border-[var(--border-strong)] bg-white pr-4 text-[var(--foreground)] shadow-sm transition-colors placeholder:text-[var(--foreground-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20",
          size === "lg" ? "h-12 pl-11 text-base sm:h-14 sm:pl-12 sm:text-lg" : "h-10 pl-10 text-sm",
          inputClassName,
        )}
      />
    </form>
  );
}
