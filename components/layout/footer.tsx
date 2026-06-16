"use client";

import Link from "next/link";
import { useAppSession } from "@/lib/use-app-session";
import { PLATFORM_NAME } from "@/lib/constants";
import {
  EXPLORE_COURSES_LINK,
  TEACH_LINK,
  dashboardNavLabelForRole,
  dashboardPathForRole,
  profilePathForRole,
} from "@/lib/site-nav";
import type { Session } from "next-auth";

export function Footer({ initialSession }: { initialSession: Session | null }) {
  const { isAuthenticated, role } = useAppSession(initialSession);
  const year = new Date().getFullYear();
  const isInstructor = role === "INSTRUCTOR";

  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-white text-[var(--foreground-secondary)]">
      <div className="page-container py-10 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="text-xl font-bold text-[var(--primary)]">
              {PLATFORM_NAME}
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--foreground-muted)]">
              Professional online courses for students and instructors worldwide.
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--foreground)]">
              Bravio
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href={EXPLORE_COURSES_LINK.href} className="hover:text-[var(--primary)]">
                  {EXPLORE_COURSES_LINK.label}
                </Link>
              </li>
              {isAuthenticated ?
                <>
                  <li>
                    <Link href={dashboardPathForRole(role)} className="hover:text-[var(--primary)]">
                      {dashboardNavLabelForRole(role)}
                    </Link>
                  </li>
                  <li>
                    <Link href={profilePathForRole(role)} className="hover:text-[var(--primary)]">
                      Profile & settings
                    </Link>
                  </li>
                </>
              : <>
                  <li>
                    <Link href="/login" className="hover:text-[var(--primary)]">
                      Log in
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="hover:text-[var(--primary)]">
                      Join for free
                    </Link>
                  </li>
                </>
              }
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--foreground)]">
              Community
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {!isInstructor ?
                <li>
                  <Link href={TEACH_LINK.href} className="hover:text-[var(--primary)]">
                    {TEACH_LINK.label}
                  </Link>
                </li>
              : null}
              <li>
                <a href="mailto:support@bravio.app" className="hover:text-[var(--primary)]">
                  Contact support
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--foreground)]">
              More
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-[var(--foreground-muted)]">
              <li>Admin-verified instructors</li>
              <li>Secure platform infrastructure</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-[var(--border)] pt-6 text-center text-xs text-[var(--foreground-muted)] sm:text-left">
          © {year} {PLATFORM_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
