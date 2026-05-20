import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { User } from "lucide-react";

type CourseCardProps = {
  slug: string;
  title: string;
  description: string;
  price: number;
  category?: string | null;
  instructor?: string | null;
  featured?: boolean;
};

export function CourseCard({
  slug,
  title,
  description,
  price,
  category,
  instructor,
  featured,
}: CourseCardProps) {
  return (
    <Link href={`/courses/${slug}`} className="group block h-full">
      <article className="surface-card flex h-full flex-col overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[var(--shadow-lg)]">
        <div className="relative h-36 bg-gradient-to-br from-indigo-500 via-violet-500 to-sky-500 p-4">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,white,transparent_50%)] opacity-20" />
          <div className="relative flex flex-wrap gap-2">
            {category ?
              <Badge variant="info" className="border-0 bg-white/95 text-indigo-800 shadow-sm">
                {category}
              </Badge>
            : null}
            {featured ?
              <Badge variant="warning" className="border-0 bg-amber-400 text-amber-950 shadow-sm">
                Featured
              </Badge>
            : null}
          </div>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h3 className="line-clamp-2 text-lg font-bold text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)]">
            {title}
          </h3>
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-[var(--foreground-muted)]">
            {description}
          </p>
          <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-4">
            <span className="text-lg font-extrabold text-[var(--primary)]">
              {price > 0 ? formatCurrency(price) : "Free"}
            </span>
            {instructor ?
              <span className="flex max-w-[120px] items-center gap-1 truncate text-xs font-medium text-[var(--foreground-muted)]">
                <User className="h-3.5 w-3.5 shrink-0" />
                {instructor}
              </span>
            : null}
          </div>
        </div>
      </article>
    </Link>
  );
}
