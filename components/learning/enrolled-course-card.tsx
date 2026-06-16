import Link from "next/link";
import { CourseThumbnail } from "@/components/courses/course-thumbnail";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

type EnrolledCourseCardProps = {
  slug: string;
  title: string;
  thumbnailUrl?: string | null;
  category?: string | null;
  instructor?: string | null;
  progressPercent: number;
  lastLessonId?: string | null;
  completed?: boolean;
};

function learnHref(slug: string, lastLessonId?: string | null) {
  return lastLessonId ? `/learn/${slug}?lesson=${lastLessonId}` : `/learn/${slug}`;
}

function thumbnailGradient(seed: string) {
  const palettes = [
    "from-[#0056d2] to-[#2a73cc]",
    "from-[#1c7ed6] to-[#339af0]",
    "from-[#1864ab] to-[#228be6]",
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return palettes[Math.abs(hash) % palettes.length];
}

export function EnrolledCourseCard({
  slug,
  title,
  thumbnailUrl,
  category,
  instructor,
  progressPercent,
  lastLessonId,
  completed,
}: EnrolledCourseCardProps) {
  const gradient = thumbnailGradient(category ?? title);
  const href = learnHref(slug, lastLessonId);
  const done = completed ?? progressPercent >= 100;

  return (
    <article className="coursera-card flex h-full flex-col overflow-hidden">
      <Link href={href} className="group block min-w-0">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--background-subtle)]">
          {thumbnailUrl ?
            <CourseThumbnail
              src={thumbnailUrl}
              className="transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
          : <div className={`h-full w-full bg-gradient-to-br ${gradient}`} />}
          {done ?
            <span className="absolute left-1.5 top-1.5 rounded-sm bg-[var(--success-bg)] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[var(--success)] sm:left-2 sm:top-2 sm:px-2">
              Done
            </span>
          : null}
        </div>
        <div className="p-2 sm:p-3">
          <h3 className="line-clamp-2 text-xs font-bold leading-snug text-[var(--foreground)] group-hover:text-[var(--primary)] sm:text-sm">
            {title}
          </h3>
          {instructor ?
            <p className="mt-0.5 line-clamp-1 text-[10px] text-[var(--foreground-muted)] sm:text-xs">
              {instructor}
            </p>
          : null}
        </div>
      </Link>
      <div className="mt-auto border-t border-[var(--border)] p-2 sm:p-3">
        {!done ?
          <>
            <div className="h-1.5 overflow-hidden rounded-full bg-[var(--background-subtle)]">
              <div
                className="h-full rounded-full bg-[var(--primary)]"
                style={{ width: `${Math.max(progressPercent, 4)}%` }}
              />
            </div>
            <p className="mt-1 text-[10px] font-medium text-[var(--foreground-muted)] sm:text-xs">
              {progressPercent}% complete
            </p>
          </>
        : <p className="text-[10px] font-medium text-[var(--foreground-muted)] sm:text-xs">
            Completed
          </p>
        }
        <Link href={href} className="mt-2 block">
          <Button size="sm" className="h-8 w-full gap-1 text-xs sm:h-9 sm:text-sm">
            <Play className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            {done ? "Review" : "Resume"}
          </Button>
        </Link>
      </div>
    </article>
  );
}

export function EnrolledCourseRow({
  slug,
  title,
  thumbnailUrl,
  category,
  progressPercent,
  lastLessonId,
}: EnrolledCourseCardProps) {
  const gradient = thumbnailGradient(category ?? title);
  const href = learnHref(slug, lastLessonId);

  return (
    <article className="surface-card flex gap-3 p-3 sm:gap-4 sm:p-4">
      <Link
        href={href}
        className="relative aspect-[16/10] w-28 shrink-0 overflow-hidden rounded-sm bg-[var(--background-subtle)] sm:w-36"
      >
        {thumbnailUrl ?
          <CourseThumbnail src={thumbnailUrl} sizes="144px" />
        : <div className={`h-full w-full bg-gradient-to-br ${gradient}`} />}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
        <div>
          <Link
            href={href}
            className="line-clamp-2 text-sm font-bold text-[var(--foreground)] hover:text-[var(--primary)] sm:text-base"
          >
            {title}
          </Link>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--background-subtle)] sm:h-2">
            <div
              className="h-full rounded-full bg-[var(--primary)]"
              style={{ width: `${Math.max(progressPercent, 4)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-[var(--foreground-muted)]">
            {progressPercent}% complete
          </p>
        </div>
        <Link href={href} className="self-start">
          <Button size="sm" className="gap-1.5">
            <Play className="h-3.5 w-3.5" />
            Resume course
          </Button>
        </Link>
      </div>
    </article>
  );
}
