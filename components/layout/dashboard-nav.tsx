"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Menu, X } from "lucide-react";
import type { NavItem } from "@/components/layout/dashboard-shell";

export function DashboardNav({
  items,
  pathname,
  roleLabel,
}: {
  items: NavItem[];
  pathname: string;
  roleLabel: string;
}) {
  const [open, setOpen] = useState(false);

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
    const matches = items.filter(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    );
    if (matches.length === 0) return false;
    const best = matches.reduce((a, b) => (a.href.length >= b.href.length ? a : b));
    return best.href === href;
  }

  const linkClass = (active: boolean) =>
    cn(
      "block rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
      active ?
        "bg-[var(--primary)] text-white shadow-md shadow-indigo-500/25"
      : "text-[var(--foreground-secondary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)]",
    );

  const navLinks = items.map((item) => {
    const active = isActive(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        className={linkClass(active)}
        onClick={() => setOpen(false)}
      >
        {item.label}
      </Link>
    );
  });

  return (
    <>
      {/* Mobile / tablet: menu bar */}
      <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-[var(--shadow-sm)] lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary-light)] px-3 py-2 text-sm font-semibold text-[var(--primary)]"
          aria-expanded={open}
          aria-controls="dashboard-mobile-nav"
        >
          <Menu className="h-5 w-5" />
          Menu
        </button>
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
          {roleLabel}
        </span>
      </div>

      {/* Mobile drawer */}
      {open ?
        <div className="fixed inset-0 z-50 lg:hidden" id="dashboard-mobile-nav">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[min(100%,280px)] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4">
              <p className="text-sm font-bold text-[var(--foreground)]">Dashboard</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-[var(--foreground-muted)] hover:bg-zinc-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">{navLinks}</nav>
          </aside>
        </div>
      : null}

      {/* Desktop sidebar */}
      <aside className="surface-card hidden h-fit p-4 lg:sticky lg:top-24 lg:block">
        <p className="mb-3 px-2 text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
          {roleLabel} menu
        </p>
        <nav className="space-y-0.5">{navLinks}</nav>
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
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <h1 className="min-w-0 text-2xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-3xl">
        {title}
      </h1>
      <div className="flex shrink-0 items-center gap-2">
        <NotificationBell />
        {children}
      </div>
    </div>
  );
}
