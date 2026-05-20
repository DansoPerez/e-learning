import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/courses/course-card";
import { GraduationCap, Shield, Sparkles, Wallet } from "lucide-react";

export default async function HomePage() {
  const featured = await prisma.course.findMany({
    where: { status: "PUBLISHED", featured: true },
    take: 3,
    include: {
      category: true,
      instructor: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const latest = await prisma.course.findMany({
    where: { status: "PUBLISHED" },
    take: 6,
    include: {
      category: true,
      instructor: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const courses = featured.length > 0 ? featured : latest;

  return (
    <div>
      <section className="relative overflow-hidden border-b border-indigo-200/50 bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-800 px-4 py-24 text-white sm:py-28">
        <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-sky-400/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-0 h-80 w-80 rounded-full bg-violet-400/40 blur-3xl" />
        <div className="relative mx-auto max-w-4xl text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-amber-300" />
            Learn from expert instructors
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl sm:leading-tight">
            Learn. Teach. Grow with{" "}
            <span className="bg-gradient-to-r from-amber-200 to-sky-200 bg-clip-text text-transparent">
              Bravio
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-indigo-100">
            A modern e-learning marketplace with structured courses, quizzes, and
            fair instructor payouts — built for students, lecturers, and institutions.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/courses">
              <Button size="lg" className="bg-white text-indigo-700 shadow-xl hover:bg-indigo-50">
                Browse courses
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/80 bg-transparent text-white hover:bg-white/15"
              >
                Start learning free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="page-container py-16 sm:py-20">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold text-[var(--foreground)]">Why Bravio?</h2>
          <p className="mt-2 text-[var(--foreground-muted)]">
            Everything you need to learn, teach, and manage courses in one place
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: GraduationCap,
              title: "Structured learning",
              text: "Courses with modules, video lessons, and built-in quizzes.",
              color: "from-indigo-500 to-violet-500",
            },
            {
              icon: Wallet,
              title: "Fair earnings",
              text: "Instructors keep 60% of revenue with transparent payouts.",
              color: "from-emerald-500 to-teal-500",
            },
            {
              icon: Shield,
              title: "Full governance",
              text: "Admins control quality, users, and platform settings.",
              color: "from-sky-500 to-blue-500",
            },
          ].map(({ icon: Icon, title, text, color }) => (
            <div
              key={title}
              className="surface-card group p-6 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]"
            >
              <div
                className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${color} p-3 text-white shadow-lg`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[var(--foreground)]">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--foreground-muted)]">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="page-container pb-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-[var(--foreground)]">Popular courses</h2>
            <p className="mt-1 text-[var(--foreground-muted)]">Start learning today</p>
          </div>
          <Link
            href="/courses"
            className="shrink-0 text-sm font-semibold text-[var(--primary)] hover:underline"
          >
            View all →
          </Link>
        </div>
        {courses.length === 0 ?
          <div className="surface-card py-16 text-center">
            <p className="text-[var(--foreground-muted)]">No published courses yet. Check back soon.</p>
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
      </section>
    </div>
  );
}
