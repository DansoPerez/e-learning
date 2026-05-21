"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { PLATFORM_NAME, DASHBOARD_ROUTES } from "@/lib/constants";
import { BookOpen, Mail, ShieldCheck } from "lucide-react";
import type { Role } from "@/app/generated/prisma/client";

function dashboardPathForRole(role: Role): string {
  switch (role) {
    case "ADMIN":
      return DASHBOARD_ROUTES.ADMIN;
    case "INSTRUCTOR":
      return DASHBOARD_ROUTES.INSTRUCTOR;
    default:
      return DASHBOARD_ROUTES.STUDENT;
  }
}

function profilePathForRole(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "/dashboard/admin/profile";
    case "INSTRUCTOR":
      return "/dashboard/instructor/profile";
    default:
      return "/dashboard/student/profile";
  }
}

const guestPlatformLinks = [
  { href: "/courses", label: "Browse courses" },
  { href: "/login", label: "Sign in" },
  { href: "/register", label: "Create account" },
];

const guestAccountLinks = [
  { href: "/register?role=student", label: "Join as a student" },
  { href: "/register?role=instructor", label: "Apply to teach" },
];

export function Footer() {
  const { data: session, status } = useSession();
  const year = new Date().getFullYear();
  const isAuthenticated = status === "authenticated" && !!session?.user;
  const role = session?.user?.role ?? "STUDENT";

  const platformLinks =
    isAuthenticated ?
      [
        { href: "/courses", label: "Browse courses" },
        { href: dashboardPathForRole(role), label: "Dashboard" },
      ]
    : guestPlatformLinks;

  const accountLinks =
    isAuthenticated ?
      [
        { href: dashboardPathForRole(role), label: "My dashboard" },
        { href: profilePathForRole(role), label: "Profile" },
        ...(role === "STUDENT" ?
          [{ href: "/dashboard/student/courses", label: "My courses" }]
        : role === "INSTRUCTOR" ?
          [{ href: "/dashboard/instructor/courses", label: "My courses" }]
        : []),
      ]
    : guestAccountLinks;

  const accountSectionTitle = isAuthenticated ? "Your account" : "Get started";

  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-white">
      <div className="page-container py-12 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-lg font-bold text-[var(--primary)]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)] text-white shadow-md shadow-indigo-500/25">
                <BookOpen className="h-5 w-5" />
              </span>
              {PLATFORM_NAME}
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--foreground-muted)]">
              Structured courses, verified instructors, and transparent administration — built for students and educators who expect a professional learning experience.
            </p>
            <a
              href="mailto:support@bravio.app"
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:underline"
            >
              <Mail className="h-4 w-4" aria-hidden />
              support@bravio.app
            </a>
          </div>

          <div className="lg:col-span-2 lg:col-start-7">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-secondary)]">
              Platform
            </p>
            <ul className="mt-4 space-y-3">
              {platformLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--foreground-muted)] transition-colors hover:text-[var(--primary)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-secondary)]">
              {accountSectionTitle}
            </p>
            <ul className="mt-4 space-y-3">
              {accountLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--foreground-muted)] transition-colors hover:text-[var(--primary)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-secondary)]">
              Trust &amp; safety
            </p>
            <ul className="mt-4 space-y-3">
              <li className="flex gap-2.5 text-sm text-[var(--foreground-muted)]">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden />
                <span>Secure payments processed via Paystack</span>
              </li>
              <li className="flex gap-2.5 text-sm text-[var(--foreground-muted)]">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden />
                <span>Instructor applications reviewed by admins</span>
              </li>
              <li className="flex gap-2.5 text-sm text-[var(--foreground-muted)]">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden />
                <span>Course quality and community standards enforced</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[var(--border)] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--foreground-muted)]">
            © {year} {PLATFORM_NAME}. All rights reserved.
          </p>
          <p className="text-xs text-[var(--foreground-muted)]">
            {isAuthenticated && session?.user?.userCode ?
              `Signed in as ${session.user.userCode}`
            : "Professional e-learning for modern teams and classrooms."}
          </p>
        </div>
      </div>
    </footer>
  );
}
