"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";
import { PLATFORM_NAME } from "@/lib/constants";
import { dashboardNavLabelForRole, dashboardPathForRole } from "@/lib/dashboard-nav";
import { BookOpen } from "lucide-react";

export function Footer({ initialSession }: { initialSession: Session | null }) {
  const { data: clientSession } = useSession();
  const session = clientSession ?? initialSession;
  const year = new Date().getFullYear();
  const isAuthenticated = !!session?.user?.id;
  const role = session?.user?.role ?? "STUDENT";

  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[#1c1d1f] text-slate-300">
      <div className="page-container py-10 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--primary)]">
                <BookOpen className="h-5 w-5" />
              </span>
              <span className="text-lg font-bold">{PLATFORM_NAME}</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              Professional online courses for students and instructors worldwide.
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Platform
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/courses" className="hover:text-white">
                  Browse courses
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
                      Sign in
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
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Teach
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/register?role=instructor" className="hover:text-white">
                  Become an instructor
                </Link>
              </li>
              <li>
                <a href="mailto:support@bravio.app" className="hover:text-white">
                  Contact support
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Legal
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              <li>Secure payments via Paystack</li>
              <li>Admin-verified instructors</li>
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
