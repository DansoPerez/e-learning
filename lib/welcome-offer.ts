import { prisma } from "@/lib/prisma";
import { getPaystackCurrency } from "@/lib/paystack-config";
import { formatCurrency } from "@/lib/utils";

/** Percent off the catalog price for welcome-offer eligible checkouts. 0 disables. */
export function getWelcomeDiscountPercent(): number {
  const raw = Number(process.env.WELCOME_DISCOUNT_PERCENT?.trim() ?? "15");
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  return Math.min(50, Math.round(raw));
}

export function applyWelcomeDiscount(catalogPrice: number, percent = getWelcomeDiscountPercent()): number {
  if (percent <= 0 || catalogPrice <= 0) return catalogPrice;
  const discounted = catalogPrice * (1 - percent / 100);
  return Math.round(discounted * 100) / 100;
}

/**
 * Welcome offer applies to the buyer's next paid courses after their first
 * successful purchase, for a limited window and purchase count.
 */
export async function isWelcomeDiscountEligible(userId: string): Promise<boolean> {
  const percent = getWelcomeDiscountPercent();
  if (percent <= 0) return false;

  const successes = await prisma.payment.findMany({
    where: { userId, status: "SUCCESS", reference: { not: { startsWith: "comp_" } } },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true },
  });

  // First paid course is full price; offer starts after that purchase exists.
  if (successes.length === 0) return false;

  const maxDiscountedPurchases = 3;
  if (successes.length > maxDiscountedPurchases) return false;

  const windowDays = Number(process.env.WELCOME_DISCOUNT_DAYS?.trim() ?? "30");
  const days = Number.isFinite(windowDays) && windowDays > 0 ? windowDays : 30;
  const firstPurchaseAt = successes[0]!.createdAt.getTime();
  const expiresAt = firstPurchaseAt + days * 24 * 60 * 60 * 1000;
  return Date.now() <= expiresAt;
}

export type SuggestedCourse = {
  id: string;
  title: string;
  slug: string;
  price: number;
  discountedPrice: number;
  priceLabel: string;
  discountedLabel: string;
  url: string;
};

export async function getWelcomeSuggestedCourses(
  userId: string,
  excludeCourseId: string,
  appBaseUrl: string,
  limit = 3,
): Promise<{ percent: number; courses: SuggestedCourse[] }> {
  const percent = getWelcomeDiscountPercent();
  const currency = getPaystackCurrency();

  const courses = await prisma.course.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: excludeCourseId },
      price: { gt: 0 },
      enrollments: { none: { userId } },
      payments: { none: { userId, status: "SUCCESS" } },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: limit,
    select: { id: true, title: true, slug: true, price: true },
  });

  return {
    percent,
    courses: courses.map((course) => {
      const price = Number(course.price);
      const discountedPrice = applyWelcomeDiscount(price, percent);
      return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        price,
        discountedPrice,
        priceLabel: formatCurrency(price, currency),
        discountedLabel: formatCurrency(discountedPrice, currency),
        url: `${appBaseUrl}/courses/${course.slug}`,
      };
    }),
  };
}
