"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";
import { useAppSession } from "@/lib/use-app-session";
import { PLATFORM_NAME } from "@/lib/constants";
import { publicHeaderLinks } from "@/lib/site-nav";
import { dashboardPathForRole } from "@/lib/dashboard-nav";
import { Button } from "@/components/ui/button";
import { CourseSearch } from "@/components/layout/course-search";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { UserMenu } from "@/components/layout/user-menu";
import { cn } from "@/lib/utils";

function navTabClass(active: boolean) {
  return cn(
    "inline-flex shrink-0 items-center whitespace-nowrap rounded-sm px-3 py-2 text-sm font-semibold transition-colors touch-manipulation",
    active ?
      "bg-[var(--primary-light)] text-[var(--primary)]"
    : "text-[var(--foreground-secondary)] hover:bg-[var(--background-subtle)] hover:text-[var(--primary)]",
  );
}

export function HeaderNav({ initialSession }: { initialSession: Session | null }) {
  const pathname = usePathname();
  const { session, isAuthenticated, isLoading, role } = useAppSession(initialSession);
  const onDashboard = pathname.startsWith("/dashboard");
  const onLearn = pathname.startsWith("/learn");
  const isAppShell = onDashboard || onLearn;

  const appShellLinks = isAuthenticated ?
    [
      {
        href: dashboardPathForRole(role),
        label: role === "STUDENT" ? "My Learning" : "Dashboard",
        active: onDashboard,
      },
      {
        href: "/courses",
        label: "Explore",
        active: pathname.startsWith("/courses"),
      },
    ]
  : [];

  const headerLinks = isAppShell && isAuthenticated ? [] : publicHeaderLinks(isAuthenticated, role);

  const mobileLinks = isAppShell && isAuthenticated ? appShellLinks : headerLinks.map((link) => ({
    href: link.href,
    label: link.label,
    active:
      link.href === "/courses" ?
        pathname.startsWith("/courses")
      : pathname.startsWith(link.href.split("?")[0] ?? link.href),
  }));

  const showMobileSubNav = mobileLinks.length > 0;
  const showMobileSearch =
    !isAppShell &&
    pathname !== "/" &&
    !pathname.startsWith("/courses") &&
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/register");

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-[var(--border)] bg-white/95 shadow-[var(--shadow-sm)] backdrop-blur-md",
        (showMobileSubNav || showMobileSearch) && "header-with-subnav",
      )}
    >
      <div className={cn(isAppShell ? "mx-auto max-w-[1400px] px-4 sm:px-6" : "page-container")}>
        <div className="flex h-14 items-center gap-3 sm:h-[var(--header-height)] lg:gap-6">
          <Link
            href={isAuthenticated ? dashboardPathForRole(role) : "/"}
            className="flex shrink-0 items-center"
          >
            <span className="text-xl font-bold tracking-tight text-[var(--primary)] sm:text-2xl">
              {PLATFORM_NAME}
            </span>
          </Link>

          {isAppShell && isAuthenticated ?
            <nav className="hidden flex-1 items-center gap-1 md:flex" aria-label="App">
              {appShellLinks.map((link) => (
                <Link key={link.href} href={link.href} className={navTabClass(link.active)}>
                  {link.label}
                </Link>
              ))}
            </nav>
          : <nav className="hidden shrink-0 items-center gap-1 lg:flex" aria-label="Main">
              {headerLinks.map((link) => {
                const active =
                  link.href === "/courses" ?
                    pathname.startsWith("/courses")
                  : pathname.startsWith(link.href.split("?")[0] ?? link.href);
                return (
                  <Link key={link.href} href={link.href} className={navTabClass(active)}>
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          }

          {!isAppShell ?
            <div className="hidden min-w-0 flex-1 lg:block">
              <CourseSearch className="mx-auto max-w-xl" />
            </div>
          : null}

          <div className="ml-auto hidden items-center gap-2 md:flex">
            {isLoading ?
              <span className="h-9 w-32 animate-pulse rounded-sm bg-[var(--background-subtle)]" />
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

          <div className="ml-auto flex items-center gap-2 md:hidden">
            {isAuthenticated && session.user ?
              <>
                {isAppShell ?
                  <NotificationBell />
                : null}
                <UserMenu
                  variant="icon"
                  name={session.user.name}
                  email={session.user.email}
                  role={role}
                  onDashboard={onDashboard}
                />
              </>
            : <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="h-9 px-3">
                    Log in
                  </Button>
                </Link>
              </>
            }
          </div>
        </div>

        {showMobileSubNav ?
          <nav
            className="-mx-4 flex gap-1 overflow-x-auto overscroll-x-contain border-t border-[var(--border)] px-4 py-2 md:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Mobile"
          >
            {mobileLinks.map((link) => (
              <Link key={link.href} href={link.href} className={navTabClass(link.active)}>
                {link.label}
              </Link>
            ))}
            {!isAuthenticated ?
              <Link href="/register" className={navTabClass(pathname.startsWith("/register"))}>
                Join for free
              </Link>
            : null}
          </nav>
        : null}

        {showMobileSearch ?
          <div className="border-t border-[var(--border)] py-3 lg:hidden">
            <CourseSearch />
          </div>
        : null}
      </div>
    </header>
  );
}
