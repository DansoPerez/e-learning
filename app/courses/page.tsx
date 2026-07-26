import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { containsFilter } from "@/lib/prisma-search";
import { CourseCard } from "@/components/courses/course-card";
import { CourseCategoryFilter } from "@/components/courses/course-category-filter";
import { CourseSearch } from "@/components/layout/course-search";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { getCachedCategories } from "@/lib/catalog-cache";
import { courseCatalogGridClass } from "@/lib/course-grid";

export const metadata = { title: "Explore" };

const COURSES_PER_PAGE = 15;

const courseListSelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  price: true,
  featured: true,
  thumbnailUrl: true,
  category: { select: { name: true } },
  instructor: { select: { name: true } },
} as const;

function parsePage(value?: string): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

function buildCoursesHref(opts: {
  page: number;
  q?: string;
  category?: string;
}): string {
  const params = new URLSearchParams();
  if (opts.q?.trim()) params.set("q", opts.q.trim());
  if (opts.category) params.set("category", opts.category);
  if (opts.page > 1) params.set("page", String(opts.page));
  const qs = params.toString();
  return qs ? `/courses?${qs}` : "/courses";
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const { q, category, page: pageParam } = await searchParams;
  const requestedPage = parsePage(pageParam);
  const titleFilter = q ? containsFilter(q) : undefined;

  const where = {
    status: "PUBLISHED" as const,
    ...(titleFilter ? { title: titleFilter } : {}),
    ...(category ? { category: { slug: category } } : {}),
  };

  const [total, categories] = await Promise.all([
    prisma.course.count({ where }),
    getCachedCategories(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / COURSES_PER_PAGE));
  const page = Math.min(requestedPage, totalPages);

  const courses = await prisma.course.findMany({
    where,
    select: courseListSelect,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    skip: (page - 1) * COURSES_PER_PAGE,
    take: COURSES_PER_PAGE,
  });

  const activeCategory = categories.find((c) => c.slug === category);
  const hasFilters = !!(q || category);
  const rangeStart = total === 0 ? 0 : (page - 1) * COURSES_PER_PAGE + 1;
  const rangeEnd = Math.min(page * COURSES_PER_PAGE, total);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="border-b border-[var(--border)] bg-white py-6 sm:py-8">
        <div className="page-container">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            {activeCategory ? activeCategory.name : "Explore courses"}
          </h1>
          <p className="mt-2 max-w-2xl text-[var(--foreground-muted)]">
            {total === 0 ?
              `0 results${q ? ` for “${q}”` : ""}`
            : `Showing ${rangeStart}–${rangeEnd} of ${total} result${total === 1 ? "" : "s"}${q ? ` for “${q}”` : ""}`
            }
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="min-w-0 flex-1 sm:max-w-xl">
              <CourseSearch defaultValue={q} />
            </div>
            <CourseCategoryFilter
              categories={categories}
              activeSlug={category}
              query={q}
              className="w-full sm:w-48"
            />
          </div>
          {hasFilters ?
            <Link
              href="/courses"
              className="mt-3 inline-block text-sm font-semibold text-[var(--primary)] hover:underline"
            >
              Clear all filters
            </Link>
          : null}
        </div>
      </div>

      <div className="page-container py-6 sm:py-8">
        {courses.length === 0 ?
          <div className="surface-card py-16 text-center">
            <p className="text-[var(--foreground-muted)]">
              No courses match your filters. Try another search or category.
            </p>
            <Link href="/courses" className="mt-4 inline-block">
              <Button variant="outline">View all courses</Button>
            </Link>
          </div>
        : <>
            <div className={courseCatalogGridClass}>
              {courses.map((c) => (
                <CourseCard
                  key={c.id}
                  slug={c.slug}
                  title={c.title}
                  description={c.description}
                  price={Number(c.price)}
                  category={c.category?.name}
                  instructor={c.instructor.name}
                  featured={c.featured}
                  thumbnailUrl={c.thumbnailUrl}
                />
              ))}
            </div>
            <Pagination
              className="mt-8"
              page={page}
              totalPages={totalPages}
              hrefForPage={(p) => buildCoursesHref({ page: p, q, category })}
            />
          </>
        }
      </div>
    </div>
  );
}
