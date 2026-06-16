import Link from "next/link";
import { CourseThumbnail } from "@/components/courses/course-thumbnail";
import { studentPriceLabel } from "@/lib/course-pricing";
import { cn } from "@/lib/utils";

type CourseCardProps = {
  slug: string;
  title: string;
  description: string;
  price: number;
  category?: string | null;
  instructor?: string | null;
  featured?: boolean;
  thumbnailUrl?: string | null;
};

function thumbnailGradient(seed: string) {
  const palettes = [
    "from-[#0056d2] to-[#2a73cc]",
    "from-[#1c7ed6] to-[#339af0]",
    "from-[#1864ab] to-[#228be6]",
    "from-[#364fc7] to-[#4c6ef5]",
    "from-[#0b7285] to-[#1098ad]",
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
  thumbnailUrl,
}: CourseCardProps) {
  const gradient = thumbnailGradient(category ?? title);
  const priceLabel = studentPriceLabel(price);

  return (
    <Link href={`/courses/${slug}`} className="group block h-full min-w-0">
      <article className="coursera-card flex h-full flex-col overflow-hidden">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--background-subtle)]">
          {thumbnailUrl ?
            <CourseThumbnail
              src={thumbnailUrl}
              className="transition-transform duration-300 group-hover:scale-[1.02]"
            />
          : <div className={`flex h-full w-full items-end bg-gradient-to-br ${gradient} p-4`}>
              {category ?
                <span className="rounded-sm bg-white/95 px-2 py-1 text-xs font-semibold text-[var(--foreground)]">
                  {category}
                </span>
              : null}
            </div>
          }
          {featured ?
            <span className="absolute left-2 top-2 rounded-sm bg-[var(--accent)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--foreground)]">
              Popular
            </span>
          : null}
        </div>
        <div className="flex flex-1 flex-col p-2 sm:p-4">
          <h3 className="line-clamp-2 text-xs font-bold leading-snug text-[var(--foreground)] group-hover:text-[var(--primary)] sm:text-[0.9375rem]">
            {title}
          </h3>
          {instructor ?
            <p className="mt-0.5 line-clamp-1 text-[10px] text-[var(--foreground-muted)] sm:mt-1 sm:text-xs">
              {instructor}
            </p>
          : null}
          <p
            className={cn(
              "mt-1.5 line-clamp-2 flex-1 text-[10px] leading-relaxed text-[var(--foreground-muted)] sm:mt-2 sm:text-sm",
              "hidden sm:block",
            )}
          >
            {description}
          </p>
          <div className="mt-2 border-t border-[var(--border)] pt-2 sm:mt-3 sm:pt-3">
            <span className="text-xs font-bold text-[var(--foreground)] sm:text-sm">{priceLabel}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
