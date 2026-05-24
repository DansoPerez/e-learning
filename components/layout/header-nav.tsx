"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";
import { signOutAction } from "@/app/actions/auth";
import { PLATFORM_NAME } from "@/lib/constants";
import { dashboardNavLabelForRole, dashboardPathForRole } from "@/lib/dashboard-nav";
import { Button } from "@/components/ui/button";
import { BookOpen, Menu, X } from "lucide-react";

const navLinkClass =
  "block rounded-md px-3 py-2.5 text-sm font-medium text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--background-subtle)] hover:text-[var(--foreground)] sm:px-3 sm:py-2";

export function HeaderNav({ initialSession }: { initialSession: Session | null }) {
  const { data: clientSession, status } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const session = clientSession ?? initialSession;
  const isAuthenticated = !!session?.user?.id;
  const isLoading = status === "loading" && !initialSession?.user?.id;

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white shadow-[var(--shadow-sm)]">
      <div className="page-container">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2"
            onClick={closeMenu}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--primary)] text-white">
              <BookOpen className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold tracking-tight text-[var(--foreground)]">
              {PLATFORM_NAME}
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/courses"
              className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                pathname.startsWith("/courses") ?
                  "text-[var(--primary)]"
                : "text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
              }`}
            >
              Explore
            </Link>
            {isAuthenticated && session.user ?
              <Link
                href={dashboardPathForRole(session.user.role)}
                className="rounded-md px-3 py-2 text-sm font-semibold text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
              >
                {dashboardNavLabelForRole(session.user.role)}
              </Link>
            : null}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {isLoading ?
              <span className="h-9 w-28 animate-pulse rounded-md bg-[var(--background-subtle)]" />
            : isAuthenticated ?
              <>
                <form action={signOutAction}>
                  <Button type="submit" variant="ghost" size="sm">
                    Sign out
                  </Button>
                </form>
              </>
            : <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Join for free</Button>
                </Link>
              </>
            }
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--border)] text-[var(--foreground)] md:hidden"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ?
              <X className="h-5 w-5" />
            : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen ?
        <div className="border-t border-[var(--border)] bg-white md:hidden">
          <nav className="page-container flex flex-col gap-1 py-4">
            <Link href="/courses" className={navLinkClass} onClick={closeMenu}>
              Explore courses
            </Link>
            {isAuthenticated && session.user ?
              <Link
                href={dashboardPathForRole(session.user.role)}
                className={navLinkClass}
                onClick={closeMenu}
              >
                {dashboardNavLabelForRole(session.user.role)}
              </Link>
            : null}
            <div className="mt-3 flex flex-col gap-2 border-t border-[var(--border)] pt-4">
              {isAuthenticated ?
                <form action={signOutAction}>
                  <Button type="submit" variant="outline" className="w-full">
                    Sign out
                  </Button>
                </form>
              : <>
                  <Link href="/login" onClick={closeMenu}>
                    <Button variant="outline" className="w-full">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/register" onClick={closeMenu}>
                    <Button className="w-full">Join for free</Button>
                  </Link>
                </>
              }
            </div>
          </nav>
        </div>
      : null}
    </header>
  );
}
