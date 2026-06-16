import { getServerSession } from "@/lib/session";
import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { CourseCard } from "@/components/courses/course-card";
import { HomeClosingCta, HomeHeroCta } from "@/components/home/home-hero-cta";
import {
  getCachedFeaturedCourses,
  getCachedLatestCourses,
  getCachedPlatformStats,
  getCachedCategories,
} from "@/lib/catalog-cache";
import { Award, BookOpen, Globe, Layers, Shield, Users } from "lucide-react";
import { courseCatalogGridClass } from "@/lib/course-grid";

export default async function HomePage() {
  const session = await getServerSession();
  const [featured, stats, categories] = await Promise.all([
    getCachedFeaturedCourses(),
    getCachedPlatformStats(),
    getCachedCategories(),
  ]);
  const latest = featured.length === 0 ? await getCachedLatestCourses() : [];
  const courses = featured.length > 0 ? featured : latest;

  return (
    <div>
      <section className="hero-mesh border-b border-[var(--primary-hover)]">
        <div className="page-container py-14 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-3xl text-center lg:max-w-4xl">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl lg:leading-[1.1]">
              Learn without limits
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-blue-100 sm:text-lg">
              Start, switch, or advance your career with thousands of courses from
              verified instructors.
            </p>
            <HomeHeroCta initialSession={session} />
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--border)] bg-white py-8 sm:py-10">
        <div className="page-container">
          <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:grid-cols-4 sm:gap-5">
            {[
              { icon: BookOpen, label: "Courses", value: `${stats.publishedCount}+` },
              { icon: Users, label: "Learners", value: `${stats.enrollmentCount}+` },
              { icon: Globe, label: "Categories", value: `${stats.categoryCount}` },
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

      {categories.length > 0 ?
        <section className="border-b border-[var(--border)] bg-[var(--background)] py-10 sm:py-12">
          <div className="page-container">
            <h2 className="section-title">Explore top categories</h2>
            <div className="mt-6 flex flex-wrap gap-2">
              {categories.slice(0, 10).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/courses?category=${cat.slug}`}
                  className="rounded-sm border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground-secondary)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      : null}

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
            View all →
          </Link>
        </div>
        {courses.length === 0 ?
          <div className="surface-card py-16 text-center">
            <p className="text-[var(--foreground-muted)]">
              New courses are coming soon. Check back shortly.
            </p>
          </div>
        : <div className={courseCatalogGridClass}>
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
                thumbnailUrl={c.thumbnailUrl}
              />
            ))}
          </div>
        }
      </section>

      <section className="border-t border-[var(--border)] bg-white py-12 sm:py-16">
        <div className="page-container">
          <h2 className="section-title text-center">Why learners choose Bravio</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-[var(--foreground-muted)]">
            A professional learning experience — clear paths, fair pricing, and expert instruction.
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
                text: "Study on phone, tablet, or desktop with a responsive player.",
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

      <section className="hero-mesh py-14 sm:py-16">
        <div className="page-container relative text-center">
          <Suspense fallback={null}>
            <HomeClosingCta initialSession={session} />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
