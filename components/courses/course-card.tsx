import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { studentPriceLabel } from "@/lib/course-pricing";
import { BookOpen, Star } from "lucide-react";

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
    <Link href={`/courses/${slug}`} className="group block h-full min-w-0">
      <article className="flex h-full flex-col overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-white shadow-[var(--shadow-sm)] transition-shadow duration-200 hover:shadow-[var(--shadow-md)]">
        <div className="relative flex h-32 items-center justify-center bg-[var(--background-subtle)] sm:h-36">
          <BookOpen className="h-12 w-12 text-[var(--border-strong)]" strokeWidth={1.25} />
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {category ?
              <Badge variant="info" className="bg-white/95 text-xs">
                {category}
              </Badge>
            : null}
            {featured ?
              <Badge variant="warning" className="text-xs">
                Featured
              </Badge>
            : null}
          </div>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-[var(--foreground)] group-hover:text-[var(--primary)]">
            {title}
          </h3>
          {instructor ?
            <p className="mt-1 text-xs text-[var(--foreground-muted)]">{instructor}</p>
          : null}
          <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-[var(--foreground-muted)]">
            {description}
          </p>
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-[var(--border)] pt-3">
            <span className="text-base font-bold text-[var(--foreground)]">
              {studentPriceLabel(price)}
            </span>
            <span className="flex items-center gap-0.5 text-xs font-medium text-[var(--foreground-muted)]">
              <Star className="h-3.5 w-3.5 fill-[var(--accent)] text-[var(--accent)]" />
              Professional
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
