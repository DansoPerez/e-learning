"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { flattenNavSections, type NavSection } from "@/lib/site-nav";

function useNavActive(pathname: string, allItems: { href: string; label: string }[]) {
  return (href: string) => {
    const matches = allItems.filter(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    );
    if (matches.length === 0) return false;
    const best = matches.reduce((a, b) => (a.href.length >= b.href.length ? a : b));
    return best.href === href;
  };
}

const tabClass = (active: boolean) =>
  cn(
    "inline-flex shrink-0 items-center whitespace-nowrap rounded-sm px-3 py-2.5 text-sm font-semibold transition-colors touch-manipulation",
    active ?
      "bg-[var(--primary-light)] text-[var(--primary)]"
    : "text-[var(--foreground-secondary)] hover:bg-[var(--background-subtle)] hover:text-[var(--primary)]",
  );

const sidebarLinkClass = (active: boolean) =>
  cn(
    "flex min-h-[40px] items-center rounded-sm px-3 py-2 text-sm font-semibold transition-colors touch-manipulation",
    active ?
      "bg-[var(--primary-light)] text-[var(--primary)]"
    : "text-[var(--foreground-secondary)] hover:bg-[var(--background-subtle)] hover:text-[var(--primary)]",
  );

type NavProps = {
  sections: NavSection[];
  pathname: string;
  roleLabel: string;
};

/** Fixed tab bar below header on mobile/tablet — always visible, scrollable, no popup. */
export function DashboardMobileBar({ sections, pathname, roleLabel }: NavProps) {
  const allItems = flattenNavSections(sections);
  const isActive = useNavActive(pathname, allItems);

  return (
    <>
      <nav
        className="fixed inset-x-0 top-[var(--mobile-header-offset)] z-40 border-b border-[var(--border)] bg-white/95 shadow-[var(--shadow-sm)] backdrop-blur-md lg:hidden"
        aria-label={`${roleLabel} navigation`}
      >
        <div className="page-container">
          <div className="flex gap-1 overflow-x-auto overscroll-x-contain py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {allItems.map((item) => (
              <Link key={item.href} href={item.href} className={tabClass(isActive(item.href))}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
      <div className="h-11 shrink-0 lg:hidden" aria-hidden />
    </>
  );
}

/** Sticky sidebar on desktop. */
export function DashboardSidebar({ sections, pathname, roleLabel }: NavProps) {
  const allItems = flattenNavSections(sections);
  const isActive = useNavActive(pathname, allItems);

  return (
    <aside className="hidden min-w-0 lg:block lg:self-start">
      <div className="sticky top-[calc(var(--header-height)+1rem)] rounded-sm border border-[var(--border)] bg-white p-2 shadow-[var(--shadow-sm)]">
        <div className="mb-2 border-b border-[var(--border)] px-3 py-2.5">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
            {roleLabel}
          </p>
        </div>
        <nav
          className="max-h-[calc(100dvh-var(--header-height)-3rem)] space-y-3 overflow-y-auto overscroll-contain p-1"
          aria-label={`${roleLabel} navigation`}
        >
          {sections.map((section) => (
            <div key={section.label} className="space-y-0.5">
              <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-[var(--foreground-muted)]">
                {section.label}
              </p>
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={sidebarLinkClass(isActive(item.href))}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}

/** @deprecated Use DashboardMobileBar + DashboardSidebar in shell layout. */
export function DashboardNav(props: NavProps) {
  return (
    <>
      <DashboardMobileBar {...props} />
      <DashboardSidebar {...props} />
    </>
  );
}

export function DashboardHeader({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  const hideTitle = title === "Overview" || title === "Teaching";
  if (hideTitle && !children) return null;

  return (
    <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      {!hideTitle ?
        <div>
          <h1 className="min-w-0 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-[1.75rem]">
            {title}
          </h1>
        </div>
      : null}
      {children ?
        <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>
      : null}
    </div>
  );
}
