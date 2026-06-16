import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { containsFilter } from "@/lib/prisma-search";
import { CourseCard } from "@/components/courses/course-card";
import { CourseCategoryFilter } from "@/components/courses/course-category-filter";
import { CourseSearch } from "@/components/layout/course-search";
import { Button } from "@/components/ui/button";
import { getCachedCategories } from "@/lib/catalog-cache";
import { courseCatalogGridClass } from "@/lib/course-grid";

export const metadata = { title: "Explore" };

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

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const titleFilter = q ? containsFilter(q) : undefined;

  const [courses, categories] = await Promise.all([
    prisma.course.findMany({
      where: {
        status: "PUBLISHED",
        ...(titleFilter ? { title: titleFilter } : {}),
        ...(category ? { category: { slug: category } } : {}),
      },
      select: courseListSelect,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    }),
    getCachedCategories(),
  ]);

  const activeCategory = categories.find((c) => c.slug === category);
  const hasFilters = !!(q || category);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="border-b border-[var(--border)] bg-white py-6 sm:py-8">
        <div className="page-container">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            {activeCategory ? activeCategory.name : "Explore courses"}
          </h1>
          <p className="mt-2 max-w-2xl text-[var(--foreground-muted)]">
            {courses.length} result{courses.length === 1 ? "" : "s"}
            {q ? ` for “${q}”` : ""}
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
        : <div className={courseCatalogGridClass}>
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
        }
      </div>
    </div>
  );
}
