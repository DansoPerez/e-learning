"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { flattenNavSections, type NavSection } from "@/lib/site-nav";
import { Menu, X } from "lucide-react";

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
      "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
      active ?
        "bg-[var(--primary)] text-white"
      : "text-[var(--foreground-secondary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)]",
    );

  const navContent = sections.map((section) => (
    <div key={section.label} className="space-y-0.5">
      <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
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
    <>
      <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-white p-3 shadow-[var(--shadow-sm)] lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-[var(--primary-light)] px-3 py-2 text-sm font-semibold text-[var(--primary)]"
          aria-expanded={open}
          aria-controls="dashboard-mobile-nav"
        >
          <Menu className="h-4 w-4" />
          Navigation
        </button>
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
          {roleLabel}
        </span>
      </div>

      {open ?
        <div className="fixed inset-0 z-50 lg:hidden" id="dashboard-mobile-nav">
          <button
            type="button"
            className="absolute inset-0 bg-[var(--foreground)]/40"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[min(100%,300px)] flex-col bg-white shadow-[var(--shadow-lg)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4">
              <div>
                <p className="text-sm font-bold text-[var(--foreground)]">Navigation</p>
                <p className="text-xs text-[var(--foreground-muted)]">{roleLabel} dashboard</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-2 text-[var(--foreground-muted)] hover:bg-[var(--background-subtle)]"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-4 overflow-y-auto p-3">{navContent}</nav>
          </aside>
        </div>
      : null}

      <aside className="surface-card hidden h-fit p-3 lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:block">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
          {roleLabel}
        </p>
        <nav className="space-y-4">{navContent}</nav>
      </aside>
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
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border)] pb-5">
      <h1 className="min-w-0 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
        {title}
      </h1>
      {children ?
        <div className="flex shrink-0 items-center gap-2">{children}</div>
      : null}
    </div>
  );
}
