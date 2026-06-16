"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, User } from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import { userMenuLinks, type NavLink } from "@/lib/site-nav";
import type { DashboardRole } from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";

function initials(name: string | null | undefined, email: string | null | undefined) {
  const source = name?.trim() || email?.trim() || "?";
  const parts = source.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function UserMenu({
  name,
  email,
  role,
  onDashboard,
  onNavigate,
  variant = "desktop",
}: {
  name: string | null | undefined;
  email: string | null | undefined;
  role: DashboardRole;
  onDashboard: boolean;
  onNavigate?: () => void;
  variant?: "desktop" | "mobile" | "icon";
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const links = userMenuLinks(role, { onDashboard });

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function close() {
    setOpen(false);
    onNavigate?.();
  }

  if (variant === "mobile") {
    return (
      <div className="space-y-1">
        <div className="mb-3 flex items-center gap-3 rounded-lg bg-[var(--background-subtle)] px-3 py-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-white">
            {initials(name, email)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--foreground)]">
              {name || "Account"}
            </p>
            {email ?
              <p className="truncate text-xs text-[var(--foreground-muted)]">{email}</p>
            : null}
          </div>
        </div>
        {links.map((item) => (
          <MobileMenuLink key={item.href} item={item} onClick={close} />
        ))}
        <form action={signOutAction} className="pt-2">
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-[var(--foreground-secondary)] hover:bg-[var(--background-subtle)]"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    );
  }

  const isIcon = variant === "icon";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        className={cn(
          isIcon ?
            "flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-white touch-manipulation"
          : "inline-flex max-w-[220px] items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-2 py-1.5 pl-1.5 text-left transition-colors hover:bg-[var(--background-subtle)]",
          !isIcon && open && "border-[var(--border-strong)] bg-[var(--background-subtle)]",
        )}
      >
        {isIcon ?
          initials(name, email)
        : <>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-white">
              {initials(name, email)}
            </span>
            <span className="hidden min-w-0 sm:block">
              <span className="block truncate text-sm font-semibold leading-tight text-[var(--foreground)]">
                {name?.split(" ")[0] || "Account"}
              </span>
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-[var(--foreground-muted)] transition-transform",
                open && "rotate-180",
              )}
            />
          </>
        }
      </button>

      {open ?
        <>
          {isIcon ?
            <button
              type="button"
              className="fixed inset-0 z-[55] bg-black/25 md:hidden"
              aria-label="Close account menu"
              onClick={close}
            />
          : null}
          <div
            role="menu"
            className={cn(
              "z-[60] overflow-hidden rounded-lg border border-[var(--border)] bg-white py-1 shadow-[var(--shadow-lg)]",
              isIcon ?
                "fixed right-4 top-14 w-[min(100vw-2rem,16rem)] md:absolute md:right-0 md:top-[calc(100%+0.5rem)] md:w-56"
              : "absolute right-0 top-[calc(100%+0.5rem)] w-56",
            )}
          >
          <div className="border-b border-[var(--border)] px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-[var(--foreground)]">
              {name || "Account"}
            </p>
            {email ?
              <p className="truncate text-xs text-[var(--foreground-muted)]">{email}</p>
            : null}
          </div>
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              onClick={close}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground-secondary)] hover:bg-[var(--background-subtle)] hover:text-[var(--foreground)]"
            >
              <User className="h-4 w-4 text-[var(--foreground-muted)]" />
              {item.label}
            </Link>
          ))}
          <div className="mt-1 border-t border-[var(--border)] pt-1">
            <form action={signOutAction}>
              <button
                type="submit"
                role="menuitem"
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--foreground-secondary)] hover:bg-[var(--background-subtle)] hover:text-[var(--foreground)]"
              >
                <LogOut className="h-4 w-4 text-[var(--foreground-muted)]" />
                Sign out
              </button>
            </form>
          </div>
          </div>
        </>
      : null}
    </div>
  );
}

function MobileMenuLink({ item, onClick }: { item: NavLink; onClick: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className="block rounded-md px-3 py-2.5 text-sm font-medium text-[var(--foreground-secondary)] hover:bg-[var(--background-subtle)] hover:text-[var(--foreground)]"
    >
      {item.label}
    </Link>
  );
}
