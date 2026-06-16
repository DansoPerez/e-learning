import Link from "next/link";
import { CourseThumbnail } from "@/components/courses/course-thumbnail";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

type InstructorCourseCardProps = {
  id: string;
  title: string;
  slug: string;
  status: string;
  price: number;
  thumbnailUrl?: string | null;
  enrollmentCount: number;
};

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

function statusVariant(status: string): "success" | "warning" | "default" {
  if (status === "PUBLISHED") return "success";
  if (status === "PENDING") return "warning";
  return "default";
}

export function InstructorCourseCard({
  id,
  title,
  status,
  price,
  thumbnailUrl,
  enrollmentCount,
}: InstructorCourseCardProps) {
  const gradient = thumbnailGradient(title);

  return (
    <Link href={`/dashboard/instructor/courses/${id}`} className="group block h-full min-w-0">
      <article className="coursera-card flex h-full flex-col overflow-hidden">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--background-subtle)]">
          {thumbnailUrl ?
            <CourseThumbnail
              src={thumbnailUrl}
              className="transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
          : <div className={`h-full w-full bg-gradient-to-br ${gradient}`} />}
          <Badge
            variant={statusVariant(status)}
            className="absolute right-1.5 top-1.5 text-[10px] sm:right-2 sm:top-2"
          >
            {status}
          </Badge>
        </div>
        <div className="flex flex-1 flex-col p-2 sm:p-3">
          <h3 className="line-clamp-2 text-xs font-bold leading-snug text-[var(--foreground)] group-hover:text-[var(--primary)] sm:text-sm">
            {title}
          </h3>
          <p className="mt-1 text-[10px] text-[var(--foreground-muted)] sm:text-xs">
            {enrollmentCount} learner{enrollmentCount === 1 ? "" : "s"} · {formatCurrency(price)}
          </p>
          <p className="mt-2 text-[10px] font-semibold text-[var(--primary)] sm:text-xs">
            Manage course →
          </p>
        </div>
      </article>
    </Link>
  );
}
