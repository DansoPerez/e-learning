"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { PLATFORM_NAME } from "@/lib/constants";
import {
  EXPLORE_COURSES_LINK,
  TEACH_LINK,
  dashboardNavLabelForRole,
  dashboardPathForRole,
} from "@/lib/site-nav";
import type { DashboardRole } from "@/lib/dashboard-nav";
import { BookOpen } from "lucide-react";

export function Footer() {
  const { data: session } = useSession();
  const year = new Date().getFullYear();
  const isAuthenticated = !!session?.user?.id;
  const role = (session?.user?.role ?? "STUDENT") as DashboardRole;
  const isInstructor = role === "INSTRUCTOR";

  return (
    <footer className="mt-auto border-t border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 text-slate-300">
      <div className="page-container py-10 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-violet-600 shadow-[var(--shadow-primary)]">
                <BookOpen className="h-5 w-5" />
              </span>
              <span className="text-lg font-bold">{PLATFORM_NAME}</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              Professional online courses for students and instructors worldwide.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Learn
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href={EXPLORE_COURSES_LINK.href} className="hover:text-white">
                  {EXPLORE_COURSES_LINK.label}
                </Link>
              </li>
              {isAuthenticated ?
                <li>
                  <Link href={dashboardPathForRole(role)} className="hover:text-white">
                    {dashboardNavLabelForRole(role)}
                  </Link>
                </li>
              : <>
                  <li>
                    <Link href="/login" className="hover:text-white">
                      Log in
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="hover:text-white">
                      Join for free
                    </Link>
                  </li>
                </>
              }
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Teach
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {!isInstructor ?
                <li>
                  <Link href={TEACH_LINK.href} className="hover:text-white">
                    {TEACH_LINK.label}
                  </Link>
                </li>
              : null}
              <li>
                <a href="mailto:support@bravio.app" className="hover:text-white">
                  Contact support
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Trust & safety
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              <li>Admin-verified instructors</li>
              <li>Secure platform infrastructure</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-700 pt-6 text-center text-xs text-slate-500 sm:text-left">
          © {year} {PLATFORM_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
