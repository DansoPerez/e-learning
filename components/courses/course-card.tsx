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

function thumbnailGradient(seed: string) {
  const palettes = [
    "from-indigo-500 via-violet-500 to-purple-600",
    "from-blue-500 via-indigo-500 to-violet-600",
    "from-violet-600 via-purple-500 to-fuchsia-500",
    "from-sky-500 via-blue-500 to-indigo-600",
    "from-indigo-600 via-blue-600 to-cyan-500",
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return palettes[Math.abs(hash) % palettes.length];
}

export function CourseCard({
  slug,
  title,
  description,
  price,
  category,
  instructor,
  featured,
}: CourseCardProps) {
  const gradient = thumbnailGradient(category ?? title);

  return (
    <Link href={`/courses/${slug}`} className="group block h-full min-w-0">
      <article className="flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-white shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary-muted)] hover:shadow-[var(--shadow-lg)]">
        <div
          className={`relative flex h-36 items-center justify-center bg-gradient-to-br ${gradient} sm:h-40`}
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggIGQ9Ik0wIDYwaDYwVjB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTAgMzBoMzBWMHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0uMDUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-40" />
          <BookOpen className="relative h-14 w-14 text-white/90 drop-shadow-md" strokeWidth={1.25} />
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {category ?
              <Badge variant="info" className="border-0 bg-white/95 text-xs normal-case shadow-sm">
                {category}
              </Badge>
            : null}
            {featured ?
              <Badge variant="warning" className="border-0 text-xs normal-case shadow-sm">
                Featured
              </Badge>
            : null}
          </div>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)]">
            {title}
          </h3>
          {instructor ?
            <p className="mt-1.5 text-xs font-medium text-[var(--foreground-muted)]">{instructor}</p>
          : null}
          <p className="mt-2.5 line-clamp-2 flex-1 text-sm leading-relaxed text-[var(--foreground-muted)]">
            {description}
          </p>
          <div className="mt-4 flex items-center justify-between gap-2 border-t border-[var(--border)] pt-4">
            <span className="text-lg font-bold text-[var(--foreground)]">
              {studentPriceLabel(price)}
            </span>
            <span className="flex items-center gap-1 text-xs font-medium text-[var(--foreground-muted)]">
              <Star className="h-3.5 w-3.5 fill-[var(--accent)] text-[var(--accent)]" />
              Top rated
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
