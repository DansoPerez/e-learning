import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { hasCourseAccess } from "@/lib/services/enrollment";
import { enrollCourseAction } from "@/app/actions/courses";
import { CourseReviews } from "@/components/courses/course-reviews";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

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
  const price = Number(course.price);
  const isInstructorOwner = user?.id === course.instructorId;
  const isAdmin = user?.role === "ADMIN";
  const canReview = !!user && enrolled && user.role === "STUDENT";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex flex-wrap gap-2">
        {course.category ? <Badge variant="info">{course.category.name}</Badge> : null}
        {course.featured ? <Badge variant="warning">Featured</Badge> : null}
      </div>

      <h1 className="text-3xl font-bold">{course.title}</h1>
      <p className="mt-2 text-zinc-600">
        by {course.instructor.name} · {course._count.enrollments} students
      </p>
      <p className="mt-6 whitespace-pre-wrap text-zinc-700">{course.description}</p>

      <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
        <p className="text-2xl font-bold text-indigo-700">
          {price > 0 ? formatCurrency(price) : "Free"}
        </p>
        {enrolled ?
          <Link href={`/learn/${course.slug}`} className="mt-4 inline-block">
            <Button>Continue learning</Button>
          </Link>
        : user ?
          <form action={enrollCourseAction.bind(null, course.id)} className="mt-4">
            <Button type="submit">{price > 0 ? "Buy & enroll" : "Enroll for free"}</Button>
          </form>
        : <Link href="/login" className="mt-4 inline-block">
            <Button>Sign in to enroll</Button>
          </Link>
        }
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">Curriculum</h2>
        <div className="space-y-4">
          {course.modules.map((mod) => (
            <div key={mod.id} className="rounded-lg border bg-white p-4">
              <h3 className="font-medium">{mod.title}</h3>
              <ul className="mt-2 space-y-1 text-sm text-zinc-600">
                {mod.lessons.map((l) => (
                  <li key={l.id}>• {l.title}</li>
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
  );
}
