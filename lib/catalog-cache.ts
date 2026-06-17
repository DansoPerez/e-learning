import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { countDistinctPlatformLearners } from "@/lib/learner-counts";

const courseCardSelect = {
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

export type CatalogCourse = {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: unknown;
  featured: boolean;
  thumbnailUrl: string | null;
  category: { name: string } | null;
  instructor: { name: string | null };
};

export const getCachedCategories = unstable_cache(
  () => prisma.category.findMany({ orderBy: { name: "asc" } }),
  ["catalog-categories"],
  { revalidate: 300 },
);

export const getCachedPlatformStats = unstable_cache(
  async () => {
    const [row, learnerCount] = await Promise.all([
      prisma.$queryRaw<
        [{ published_count: bigint; category_count: bigint }]
      >`
        SELECT
          (SELECT COUNT(*)::bigint FROM "Course" WHERE status = 'PUBLISHED') AS published_count,
          (SELECT COUNT(*)::bigint FROM "Category") AS category_count
      `,
      countDistinctPlatformLearners(),
    ]);
    return {
      publishedCount: Number(row[0].published_count),
      categoryCount: Number(row[0].category_count),
      enrollmentCount: learnerCount,
    };
  },
  ["catalog-platform-stats"],
  { revalidate: 120 },
);

export const getCachedFeaturedCourses = unstable_cache(
  (): Promise<CatalogCourse[]> =>
    prisma.course.findMany({
      where: { status: "PUBLISHED", featured: true },
      take: 4,
      select: courseCardSelect,
      orderBy: { createdAt: "desc" },
    }),
  ["catalog-featured-courses"],
  { revalidate: 60 },
);

export const getCachedLatestCourses = unstable_cache(
  (): Promise<CatalogCourse[]> =>
    prisma.course.findMany({
      where: { status: "PUBLISHED" },
      take: 8,
      select: courseCardSelect,
      orderBy: { createdAt: "desc" },
    }),
  ["catalog-latest-courses"],
  { revalidate: 60 },
);
