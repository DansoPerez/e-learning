import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CourseThumbnail } from "@/components/courses/course-thumbnail";
import { courseAccessCtaForRole, getSessionUser } from "@/lib/auth";
import { hasCourseAccess } from "@/lib/services/enrollment";
import { enrollCourseAction } from "@/app/actions/courses";
import { CourseReviews } from "@/components/courses/course-reviews";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { studentEnrollLabel, studentPriceLabel } from "@/lib/course-pricing";
import { countCourseLearners } from "@/lib/learner-counts";
import { CheckCircle2, Star } from "lucide-react";

export default async function CourseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { slug } = await params;
  const { error } = await searchParams;
  const user = await getSessionUser();

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      category: true,
      instructor: { select: { name: true, id: true } },
      modules: {
        orderBy: { orderIndex: "asc" },
        include: {
          lessons: {
            orderBy: { orderIndex: "asc" },
            select: { id: true, title: true, durationMin: true },
          },
        },
      },
      reviews: {
        where: { deletedAt: null },
        include: {
          user: { select: { id: true, name: true } },
          replies: {
            orderBy: { createdAt: "asc" },
            include: { author: { select: { id: true, name: true, role: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!course || (course.status !== "PUBLISHED" && course.instructorId !== user?.id)) {
    notFound();
  }

  const learnerCount = await countCourseLearners(course.id, course.instructorId);

  const enrolled = user ? await hasCourseAccess(user.id, course.id) : false;
  const storedPrice = Number(course.price);
  const isInstructorOwner = user?.id === course.instructorId;
  const isAdmin = user?.role === "ADMIN";
  const canReview = !!user && enrolled && user.role === "STUDENT";
  const lessonCount = course.modules.reduce((n, m) => n + m.lessons.length, 0);
  const reviewCount = course.reviews.length;
  const averageRating =
    reviewCount > 0 ?
      course.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
    : null;
  const accessCta = courseAccessCtaForRole(user?.role, {
    slug: course.slug,
    courseId: course.id,
    isInstructorOwner,
  });

  const enrollError =
    error === "payment-failed" ?
      "We could not start checkout. Check that Paystack is configured, or try again."
    : error === "unavailable" ?
      "This course is not available for enrollment."
    : null;

  const enrollBox = (
    <div className="surface-card-elevated overflow-hidden">
      <div className="relative aspect-video w-full bg-[var(--background-subtle)]">
        {course.thumbnailUrl ?
          <CourseThumbnail src={course.thumbnailUrl} priority sizes="320px" />
        : <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#0056d2] to-[#2a73cc] text-sm font-semibold text-white">
            Course preview
          </div>
        }
      </div>
      <div className="p-5 sm:p-6">
        <p className="text-2xl font-bold text-[var(--foreground)]">
          {studentPriceLabel(storedPrice)}
        </p>
        <ul className="mt-4 space-y-2 text-sm text-[var(--foreground-secondary)]">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--primary)]" />
            {lessonCount} lessons
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--primary)]" />
            {learnerCount} already enrolled
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--primary)]" />
            Learn at your own pace
          </li>
        </ul>
        {enrollError ?
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {enrollError}
          </p>
        : null}
        <div className="mt-5">
          {enrolled ?
            <Link href={accessCta.href} className="block">
              <Button className="w-full" size="lg">
                {accessCta.label}
              </Button>
            </Link>
          : user && user.role === "STUDENT" ?
            <form action={enrollCourseAction.bind(null, course.id)}>
              <Button type="submit" className="w-full" size="lg">
                {studentEnrollLabel(storedPrice)}
              </Button>
            </form>
          : user ?
            <Link href={accessCta.href} className="block">
              <Button className="w-full" size="lg" variant="outline">
                {accessCta.label}
              </Button>
            </Link>
          : <Link href="/login" className="block">
              <Button className="w-full" size="lg">
                Sign in to enroll
              </Button>
            </Link>
          }
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[var(--background)] pb-16">
      <div className="border-b border-[var(--border)] bg-white">
        <div className="page-container py-6 sm:py-8">
          <nav className="text-sm text-[var(--foreground-muted)]">
            <Link href="/courses" className="hover:text-[var(--primary)]">
              Explore
            </Link>
            {course.category ?
              <>
                <span className="mx-2">/</span>
                <Link
                  href={`/courses?category=${course.category.slug}`}
                  className="hover:text-[var(--primary)]"
                >
                  {course.category.name}
                </Link>
              </>
            : null}
          </nav>
          <div className="mt-4 flex flex-wrap gap-2">
            {course.category ?
              <Badge variant="info">{course.category.name}</Badge>
            : null}
            {course.featured ?
              <Badge variant="warning">Popular</Badge>
            : null}
          </div>
          <h1 className="mt-3 text-2xl font-bold leading-tight text-[var(--foreground)] sm:text-3xl lg:text-4xl">
            {course.title}
          </h1>
          <p className="mt-2 text-[var(--foreground-muted)]">
            Instructor:{" "}
            <span className="font-semibold text-[var(--foreground-secondary)]">
              {course.instructor.name}
            </span>
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[var(--foreground-muted)]">
            {averageRating !== null ?
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-[var(--accent)] text-[var(--accent)]" />
                <span className="font-semibold text-[var(--foreground)]">
                  {averageRating.toFixed(1)}
                </span>
                <span>({reviewCount})</span>
              </span>
            : null}
            <span>{learnerCount} learners enrolled</span>
          </div>
        </div>
      </div>

      <div className="page-container py-8 sm:py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          <div className="min-w-0 flex-1 space-y-8">
            <section className="lg:hidden">{enrollBox}</section>

            <section>
              <h2 className="text-xl font-bold text-[var(--foreground)]">About this course</h2>
              <p className="mt-3 whitespace-pre-wrap break-words text-base leading-relaxed text-[var(--foreground-secondary)]">
                {course.description}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--foreground)]">Syllabus</h2>
              <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                {course.modules.length} sections · {lessonCount} lessons
              </p>
              <div className="mt-4 space-y-2">
                {course.modules.map((mod, i) => (
                  <details key={mod.id} className="surface-card group overflow-hidden" open={i === 0}>
                    <summary className="cursor-pointer border-b border-[var(--border)] bg-[var(--background-subtle)] px-4 py-3 font-bold text-[var(--foreground)] marker:content-none">
                      <span className="flex items-center justify-between gap-2">
                        <span>
                          {i + 1}. {mod.title}
                        </span>
                        <span className="text-xs font-normal text-[var(--foreground-muted)]">
                          {mod.lessons.length} lessons
                        </span>
                      </span>
                    </summary>
                    <ul className="divide-y divide-[var(--border)]">
                      {mod.lessons.map((l) => (
                        <li
                          key={l.id}
                          className="flex items-center justify-between gap-2 px-4 py-3 text-sm"
                        >
                          <span className="min-w-0 flex-1 break-words text-[var(--foreground-secondary)]">
                            {l.title}
                          </span>
                          {l.durationMin ?
                            <span className="shrink-0 text-xs text-[var(--foreground-muted)]">
                              {l.durationMin} min
                            </span>
                          : null}
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            </section>

            <CourseReviews
              courseId={course.id}
              courseSlug={course.slug}
              reviews={course.reviews}
              canReview={canReview}
              canReplyAsInstructor={isInstructorOwner}
              isAdmin={isAdmin}
              currentUserId={user?.id}
            />
          </div>

          <aside className="hidden lg:block lg:w-80 lg:shrink-0">
            <div className="sticky top-20">{enrollBox}</div>
          </aside>
        </div>
      </div>
    </div>
  );
}
