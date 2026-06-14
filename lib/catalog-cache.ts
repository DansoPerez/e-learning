import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

const courseCardSelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  price: true,
  featured: true,
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
    const [publishedCount, categoryCount, enrollmentCount] = await Promise.all([
      prisma.course.count({ where: { status: "PUBLISHED" } }),
      prisma.category.count(),
      prisma.enrollment.count(),
    ]);
    return { publishedCount, categoryCount, enrollmentCount };
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
