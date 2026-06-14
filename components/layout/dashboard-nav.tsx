"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { flattenNavSections, type NavSection } from "@/lib/site-nav";
import { AdminMobileNav } from "@/components/layout/admin-mobile-nav";
import { LayoutDashboard, Menu, X } from "lucide-react";

export function DashboardNav({
  sections,
  pathname,
  roleLabel,
}: {
  sections: NavSection[];
  pathname: string;
  roleLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const allItems = flattenNavSections(sections);
  const isAdmin = roleLabel === "Admin";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function isActive(href: string) {
    const matches = allItems.filter(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    );
    if (matches.length === 0) return false;
    const best = matches.reduce((a, b) => (a.href.length >= b.href.length ? a : b));
    return best.href === href;
  }

  const linkClass = (active: boolean) =>
    cn(
      "flex min-h-[40px] items-center rounded-lg px-3 py-2 text-sm font-medium transition-all touch-manipulation",
      active ?
        "bg-[var(--primary)] text-white shadow-[var(--shadow-primary)]"
      : "text-[var(--foreground-secondary)] hover:bg-white/80 hover:text-[var(--primary)]",
    );

  const navContent = sections.map((section) => (
    <div key={section.label} className="space-y-0.5">
      <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-[var(--foreground-muted)]">
        {section.label}
      </p>
      {section.items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={linkClass(isActive(item.href))}
          onClick={() => setOpen(false)}
        >
          {item.label}
        </Link>
      ))}
    </div>
  ));

  return (
    <div className="min-w-0 lg:self-start">
      <div
        className={cn(
          "mb-3 flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-white p-2.5 shadow-[var(--shadow-sm)] lg:hidden",
          isAdmin && "z-40",
        )}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white touch-manipulation"
          aria-expanded={open}
          aria-controls="dashboard-mobile-nav"
        >
          <Menu className="h-5 w-5" />
          Menu
        </button>
      </div>

      {open ?
        <div className="fixed inset-0 z-[100] lg:hidden" id="dashboard-mobile-nav">
          <button
            type="button"
            className="absolute inset-0 bg-[var(--foreground)]/50 touch-manipulation"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[min(100%,min(300px,100vw))] flex-col bg-white shadow-[var(--shadow-lg)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
              <div>
                <p className="text-sm font-bold text-[var(--foreground)]">{roleLabel}</p>
                <p className="text-xs text-[var(--foreground-muted)]">Dashboard navigation</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-[var(--foreground-muted)] hover:bg-[var(--background-subtle)] touch-manipulation"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-4 overflow-y-auto overscroll-contain p-3 pb-8">
              {navContent}
            </nav>
          </aside>
        </div>
      : null}

      <aside className="hidden lg:block">
        <div className="sticky top-[calc(var(--header-height)+1rem)] rounded-xl border border-[var(--border)] bg-white/90 p-2 shadow-[var(--shadow-sm)] backdrop-blur-sm">
          <div className="mb-2 flex items-center gap-2 rounded-lg bg-[var(--primary-light)] px-3 py-2.5">
            <LayoutDashboard className="h-4 w-4 text-[var(--primary)]" />
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
              {roleLabel}
            </p>
          </div>
          <nav className="max-h-[calc(100dvh-var(--header-height)-6rem)] space-y-3 overflow-y-auto overscroll-contain p-1">
            {navContent}
          </nav>
        </div>
      </aside>

      {isAdmin ?
        <AdminMobileNav onOpenMenu={() => setOpen(true)} />
      : null}
    </div>
  );
}

export function DashboardHeader({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  const hideTitle = title === "Overview";
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
