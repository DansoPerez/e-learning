import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/courses/course-card";
import {
  dashboardCtaLabelForRole,
  dashboardPathForRole,
} from "@/lib/dashboard-nav";
import type { Role } from "@/app/generated/prisma/client";
import { Award, BookOpen, Globe, Layers, Shield, Users } from "lucide-react";

function homepageClosingCopy(role: Role): { heading: string; body: string; cta: string } {
  switch (role) {
    case "ADMIN":
      return {
        heading: "Manage the platform",
        body: "Review users, courses, payouts, and platform settings from your admin panel.",
        cta: "Open admin panel",
      };
    case "INSTRUCTOR":
      return {
        heading: "Grow your teaching",
        body: "Update your courses, respond to learners, and track earnings from your dashboard.",
        cta: "Open teaching dashboard",
      };
    default:
      return {
        heading: "Ready to start learning?",
        body: "Join thousands building skills with instructor-led courses on Bravio.",
        cta: "Get started — it's free",
      };
  }
}

export default async function HomePage() {
  const session = await auth();
  const isAuthenticated = !!session?.user?.id;
  const [featured, latest, publishedCount, categoryCount, enrollmentCount] =
    await Promise.all([
    prisma.course.findMany({
      where: { status: "PUBLISHED", featured: true },
      take: 4,
      include: {
        category: true,
        instructor: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.course.findMany({
      where: { status: "PUBLISHED" },
      take: 8,
      include: {
        category: true,
        instructor: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.course.count({ where: { status: "PUBLISHED" } }),
    prisma.category.count(),
    prisma.enrollment.count(),
  ]);

  const courses = featured.length > 0 ? featured : latest.slice(0, 8);

  return (
    <div>
      <section className="hero-mesh border-b border-[var(--border)]">
        <div className="page-container py-14 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-3xl text-center lg:max-w-4xl">
            <span className="inline-flex items-center rounded-full border border-[var(--primary-muted)]/50 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--primary)] shadow-sm backdrop-blur-sm">
              Professional online learning
            </span>
            <h1 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight text-[var(--foreground)] sm:text-4xl lg:text-5xl lg:leading-[1.1]">
              Learn without limits on{" "}
              <span className="bg-gradient-to-r from-[var(--primary)] to-violet-600 bg-clip-text text-transparent">
                Bravio
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--foreground-muted)] sm:text-lg">
              Structured courses from verified instructors — modules, quizzes, and
              progress tracking built for students and professionals.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              {isAuthenticated && session.user ?
                <Link href={dashboardPathForRole(session.user.role)} className="w-full sm:w-auto">
                  <Button size="lg" variant="accent" className="w-full sm:min-w-[200px]">
                    {dashboardCtaLabelForRole(session.user.role)}
                  </Button>
                </Link>
              : <Link href="/register" className="w-full sm:w-auto">
                  <Button size="lg" variant="accent" className="w-full sm:min-w-[200px]">
                    Join for free
                  </Button>
                </Link>
              }
              <Link href="/courses" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:min-w-[200px]">
                  Explore courses
                </Button>
              </Link>
            </div>
            {!isAuthenticated ?
              <p className="mt-4 text-sm text-[var(--foreground-muted)]">
                Already learning?{" "}
                <Link href="/login" className="font-semibold text-[var(--primary)] hover:underline">
                  Log in
                </Link>
              </p>
            : null}
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--border)] bg-white py-8 sm:py-10">
        <div className="page-container">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
            {[
              { icon: BookOpen, label: "Courses", value: `${publishedCount}+` },
              { icon: Users, label: "Learners", value: `${enrollmentCount}+` },
              { icon: Globe, label: "Categories", value: `${categoryCount}` },
              { icon: Award, label: "Instructors", value: "Verified" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="stat-pill text-center">
                <span className="feature-icon mx-auto">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-3 text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
                  {value}
                </p>
                <p className="mt-0.5 text-xs font-medium text-[var(--foreground-muted)] sm:text-sm">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-container py-12 sm:py-16">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="section-title">Most popular</h2>
            <p className="mt-1 text-[var(--foreground-muted)]">
              Courses learners are enrolling in now
            </p>
          </div>
          <Link
            href="/courses"
            className="text-sm font-bold text-[var(--primary)] hover:underline"
          >
            View all courses →
          </Link>
        </div>
        {courses.length === 0 ?
          <div className="surface-card py-16 text-center">
            <p className="text-[var(--foreground-muted)]">
              New courses are coming soon. Check back shortly.
            </p>
          </div>
        : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
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

      <section className="border-t border-[var(--border)] bg-[var(--background)] py-12 sm:py-16">
        <div className="page-container">
          <h2 className="section-title text-center">Why learners choose Bravio</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-[var(--foreground-muted)]">
            A classic learning experience — clear paths, fair pricing, and admin oversight.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Layers,
                title: "Structured curriculum",
                text: "Modules, lessons, and assessments in a clear sequence — like leading MOOC platforms.",
              },
              {
                icon: Shield,
                title: "Expert instructors",
                text: "Every teaching application is reviewed before courses go live.",
              },
              {
                icon: Globe,
                title: "Learn on any device",
                text: "Responsive design so you can study on phone, tablet, or desktop.",
              },
            ].map((item) => (
              <div key={item.title} className="surface-card surface-card-hover p-6">
                <span className="feature-icon">
                  <item.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-[var(--foreground)]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--foreground-muted)]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-[var(--border)] bg-gradient-to-br from-[var(--primary)] via-indigo-600 to-violet-700 py-14 text-white sm:py-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMzBoMzBWMHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0uMDUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-30" />
        <div className="page-container relative text-center">
          {(() => {
            const closing =
              isAuthenticated && session.user ?
                homepageClosingCopy(session.user.role)
              : {
                  heading: "Ready to start learning?",
                  body: "Join thousands building skills with instructor-led courses on Bravio.",
                  cta: "Get started — it's free",
                };
            const closingHref =
              isAuthenticated && session.user ?
                dashboardPathForRole(session.user.role)
              : "/register";
            return (
              <>
                <h2 className="text-2xl font-bold sm:text-3xl">{closing.heading}</h2>
                <p className="mx-auto mt-3 max-w-lg text-indigo-100">{closing.body}</p>
                <Link href={closingHref} className="mt-6 inline-block w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="accent"
                    className="w-full sm:min-w-[220px]"
                  >
                    {closing.cta}
                  </Button>
                </Link>
              </>
            );
          })()}
        </div>
      </section>
    </div>
  );
}
