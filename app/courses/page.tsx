import { prisma } from "@/lib/prisma";
import { CourseCard } from "@/components/courses/course-card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Courses" };

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;

  const courses = await prisma.course.findMany({
    where: {
      status: "PUBLISHED",
      ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
      ...(category ? { category: { slug: category } } : {}),
    },
    include: {
      category: true,
      instructor: { select: { name: true } },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="page-container py-10 sm:py-14">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-[var(--foreground)]">
          Explore courses
        </h1>
        <p className="mt-2 text-lg text-[var(--foreground-muted)]">
          Find your next skill on Bravio
        </p>
      </div>

      <form className="surface-card mb-10 flex flex-wrap gap-3 p-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search courses..."
          className="input-field min-w-[200px] flex-1"
        />
        <select name="category" defaultValue={category ?? ""} className="input-field w-auto min-w-[160px]">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <Button type="submit">Search</Button>
      </form>

      {courses.length === 0 ?
        <div className="surface-card py-16 text-center">
          <p className="text-[var(--foreground-muted)]">No courses found. Try a different search.</p>
        </div>
      : <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
    </div>
  );
}
