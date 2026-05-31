import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { courseAccessCtaForRole, getSessionUser } from "@/lib/auth";
import { hasCourseAccess } from "@/lib/services/enrollment";
import { enrollCourseAction } from "@/app/actions/courses";
import { CourseReviews } from "@/components/courses/course-reviews";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { studentEnrollLabel, studentPriceLabel } from "@/lib/course-pricing";
import { BookOpen, CheckCircle2 } from "lucide-react";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
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
        include: {
          user: { select: { id: true, name: true } },
          replies: {
            orderBy: { createdAt: "asc" },
            include: { author: { select: { id: true, name: true, role: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course || (course.status !== "PUBLISHED" && course.instructorId !== user?.id)) {
    notFound();
  }

  const enrolled = user ? await hasCourseAccess(user.id, course.id) : false;
  const storedPrice = Number(course.price);
  const isInstructorOwner = user?.id === course.instructorId;
  const isAdmin = user?.role === "ADMIN";
  const canReview = !!user && enrolled && user.role === "STUDENT";
  const lessonCount = course.modules.reduce((n, m) => n + m.lessons.length, 0);
  const accessCta = courseAccessCtaForRole(user?.role, {
    slug: course.slug,
    courseId: course.id,
    isInstructorOwner,
  });

  const enrollBox = (
    <div className="surface-card-elevated p-5 sm:p-6">
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
          {course._count.enrollments} enrolled
        </li>
        <li className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--primary)]" />
          Learn at your own pace
        </li>
      </ul>
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
  );

  return (
    <div className="bg-[var(--background)] pb-16">
      <div className="border-b border-[var(--border)] bg-white">
        <div className="page-container py-6 sm:py-8">
          <div className="flex flex-wrap gap-2">
            {course.category ?
              <Badge variant="info">{course.category.name}</Badge>
            : null}
            {course.featured ?
              <Badge variant="warning">Featured</Badge>
            : null}
          </div>
          <h1 className="mt-4 text-2xl font-bold leading-tight text-[var(--foreground)] sm:text-3xl lg:text-4xl">
            {course.title}
          </h1>
          <p className="mt-2 text-[var(--foreground-muted)]">
            Created by{" "}
            <span className="font-semibold text-[var(--foreground-secondary)]">
              {course.instructor.name}
            </span>
            {" · "}
            {course._count.enrollments} learners enrolled
          </p>
        </div>
      </div>

      <div className="page-container py-8 sm:py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
          <div className="min-w-0 flex-1 space-y-8">
            <div className="flex h-48 items-center justify-center rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background-subtle)] sm:h-56">
              <BookOpen className="h-16 w-16 text-[var(--border-strong)]" strokeWidth={1} />
            </div>

            <section>
              <h2 className="text-xl font-bold text-[var(--foreground)]">About this course</h2>
              <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-[var(--foreground-secondary)]">
                {course.description}
              </p>
            </section>

            <section className="lg:hidden">{enrollBox}</section>

            <section>
              <h2 className="text-xl font-bold text-[var(--foreground)]">Course content</h2>
              <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                {course.modules.length} sections · {lessonCount} lessons
              </p>
              <div className="mt-4 space-y-3">
                {course.modules.map((mod, i) => (
                  <div key={mod.id} className="surface-card overflow-hidden">
                    <div className="border-b border-[var(--border)] bg-[var(--background-subtle)] px-4 py-3">
                      <h3 className="font-bold text-[var(--foreground)]">
                        {i + 1}. {mod.title}
                      </h3>
                    </div>
                    <ul className="divide-y divide-[var(--border)]">
                      {mod.lessons.map((l) => (
                        <li
                          key={l.id}
                          className="flex items-center justify-between gap-2 px-4 py-3 text-sm"
                        >
                          <span className="text-[var(--foreground-secondary)]">{l.title}</span>
                          {l.durationMin ?
                            <span className="shrink-0 text-xs text-[var(--foreground-muted)]">
                              {l.durationMin} min
                            </span>
                          : null}
                        </li>
                      ))}
                    </ul>
                  </div>
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
