import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { containsFilter } from "@/lib/prisma-search";
import { CourseCard } from "@/components/courses/course-card";
import { Button } from "@/components/ui/button";
import { getCachedCategories } from "@/lib/catalog-cache";

export const metadata = { title: "Explore courses" };

const courseListSelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  price: true,
  featured: true,
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

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="page-hero py-10 sm:py-12">
        <div className="page-container">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            Explore courses
          </h1>
          <p className="mt-2 max-w-2xl text-[var(--foreground-muted)]">
            Browse professional courses across categories. Filter by topic or search by title.
          </p>
        </div>
      </div>

      <div className="page-container py-8 sm:py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
          <aside className="lg:w-64 lg:shrink-0">
            <div className="surface-card-elevated p-4 sm:p-5 lg:sticky lg:top-20">
              <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--foreground)]">
                Filter
              </h2>
              <form className="mt-4 space-y-4">
                <div>
                  <label htmlFor="q" className="mb-1.5 block text-xs font-semibold text-[var(--foreground-secondary)]">
                    Search
                  </label>
                  <input
                    id="q"
                    name="q"
                    defaultValue={q}
                    placeholder="Course title..."
                    className="input-field"
                  />
                </div>
                <div>
                  <label
                    htmlFor="category"
                    className="mb-1.5 block text-xs font-semibold text-[var(--foreground-secondary)]"
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    defaultValue={category ?? ""}
                    className="input-field"
                  >
                    <option value="">All categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="submit" className="w-full">
                  Apply filters
                </Button>
                {(q || category) ?
                  <Link
                    href="/courses"
                    className="block text-center text-sm font-semibold text-[var(--primary)] hover:underline"
                  >
                    Clear filters
                  </Link>
                : null}
              </form>

              <div className="mt-6 hidden border-t border-[var(--border)] pt-4 lg:block">
                <p className="text-xs font-semibold text-[var(--foreground-muted)]">Topics</p>
                <ul className="mt-2 space-y-1">
                  {categories.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/courses?category=${c.slug}`}
                        className={`block rounded-md px-2 py-1.5 text-sm ${
                          category === c.slug ?
                            "bg-[var(--primary-light)] font-semibold text-[var(--primary)]"
                          : "text-[var(--foreground-secondary)] hover:bg-[var(--background-subtle)]"
                        }`}
                      >
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          <main className="min-w-0 flex-1">
            <p className="mb-4 text-sm text-[var(--foreground-muted)]">
              {courses.length} course{courses.length === 1 ? "" : "s"} found
            </p>
            {courses.length === 0 ?
              <div className="surface-card py-16 text-center">
                <p className="text-[var(--foreground-muted)]">
                  No courses match your filters. Try another search or category.
                </p>
                <Link href="/courses" className="mt-4 inline-block">
                  <Button variant="outline">View all courses</Button>
                </Link>
              </div>
            : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
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
                  />
                ))}
              </div>
            }
          </main>
        </div>
      </div>
    </div>
  );
}
