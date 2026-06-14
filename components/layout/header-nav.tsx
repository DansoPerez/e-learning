"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";
import { PLATFORM_NAME } from "@/lib/constants";
import { publicHeaderLinks } from "@/lib/site-nav";
import { dashboardPathForRole, type DashboardRole } from "@/lib/dashboard-nav";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { UserMenu } from "@/components/layout/user-menu";
import { BookOpen, LayoutDashboard, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

function navLinkClass(active: boolean) {
  return cn(
    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    active ?
      "bg-[var(--primary-light)] text-[var(--primary)]"
    : "text-[var(--foreground-secondary)] hover:bg-[var(--background-subtle)] hover:text-[var(--foreground)]",
  );
}

const mobileLinkClass =
  "block rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--background-subtle)] hover:text-[var(--foreground)]";

function userInitials(name: string | null | undefined, email: string | null | undefined) {
  const source = name?.trim() || email?.trim() || "?";
  const parts = source.split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export function HeaderNav({ initialSession }: { initialSession: Session | null }) {
  const { data: clientSession, status } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const session = clientSession ?? initialSession;
  const isAuthenticated = !!session?.user?.id;
  const isLoading = status === "loading" && !initialSession?.user?.id;
  const onDashboard = pathname.startsWith("/dashboard");
  const onLearn = pathname.startsWith("/learn");
  const isAppShell = onDashboard || onLearn;
  const role = (session?.user?.role ?? "STUDENT") as DashboardRole;
  const headerLinks = isAppShell && isAuthenticated ? [] : publicHeaderLinks(isAuthenticated);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b backdrop-blur-md",
        isAppShell ?
          "border-[var(--border)] bg-white/95 shadow-[var(--shadow-sm)]"
        : "border-[var(--border)] bg-white/90 shadow-[var(--shadow-sm)]",
      )}
    >
      <div className={cn(isAppShell ? "mx-auto max-w-[1400px] px-4 sm:px-6" : "page-container")}>
        <div className="flex h-[var(--header-height)] items-center justify-between gap-3">
          <Link
            href={isAuthenticated ? dashboardPathForRole(role) : "/"}
            className="flex shrink-0 items-center gap-2.5"
            onClick={closeMenu}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-violet-600 text-white shadow-[var(--shadow-primary)]">
              <BookOpen className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold tracking-tight text-[var(--foreground)]">
              {PLATFORM_NAME}
            </span>
          </Link>

          {isAppShell && isAuthenticated ?
            <nav className="hidden flex-1 items-center justify-center gap-1 md:flex" aria-label="App">
              <Link href={dashboardPathForRole(role)} className={navLinkClass(onDashboard)}>
                <span className="inline-flex items-center gap-1.5">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </span>
              </Link>
              <Link href="/courses" className={navLinkClass(pathname.startsWith("/courses"))}>
                Courses
              </Link>
            </nav>
          : <nav className="hidden flex-1 items-center justify-center gap-1 md:flex" aria-label="Main">
              {headerLinks.map((link) => {
                const active =
                  link.href === "/courses" ?
                    pathname.startsWith("/courses")
                  : pathname.startsWith(link.href.split("?")[0] ?? link.href);
                return (
                  <Link key={link.href} href={link.href} className={navLinkClass(active)}>
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          }

          <div className="hidden items-center gap-2 md:flex">
            {isLoading ?
              <span className="h-9 w-32 animate-pulse rounded-lg bg-[var(--background-subtle)]" />
            : isAuthenticated && session.user ?
              <>
                {isAppShell ?
                  <NotificationBell />
                : null}
                <UserMenu
                  name={session.user.name}
                  email={session.user.email}
                  role={role}
                  onDashboard={onDashboard}
                />
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

          <div className="flex items-center gap-2 md:hidden">
            {isAuthenticated ?
              <>
                {isAppShell ?
                  <NotificationBell />
                : null}
                <Link
                  href={dashboardPathForRole(role)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-white"
                  aria-label="Open dashboard"
                >
                  {userInitials(session.user?.name, session.user?.email)}
                </Link>
              </>
            : null}
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--background-subtle)]"
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
      </div>

      {menuOpen ?
        <div className="border-t border-[var(--border)] bg-white md:hidden">
          <nav className="page-container flex flex-col gap-1 py-4" aria-label="Mobile">
            {isAppShell && isAuthenticated ?
              <>
                <Link href={dashboardPathForRole(role)} className={mobileLinkClass} onClick={closeMenu}>
                  Dashboard
                </Link>
                <Link href="/courses" className={mobileLinkClass} onClick={closeMenu}>
                  Explore courses
                </Link>
              </>
            : headerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={mobileLinkClass}
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              ))
            }

            <div className="mt-3 border-t border-[var(--border)] pt-4">
              {isLoading ?
                <div className="h-24 animate-pulse rounded-lg bg-[var(--background-subtle)]" />
              : isAuthenticated && session.user ?
                <UserMenu
                  variant="mobile"
                  name={session.user.name}
                  email={session.user.email}
                  role={role}
                  onDashboard={onDashboard}
                  onNavigate={closeMenu}
                />
              : <div className="flex flex-col gap-2">
                  <Link href="/login" onClick={closeMenu}>
                    <Button variant="outline" className="w-full">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/register" onClick={closeMenu}>
                    <Button className="w-full">Join for free</Button>
                  </Link>
                </div>
              }
            </div>
          </nav>
        </div>
      : null}
    </header>
  );
}
