"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  dashboardCtaLabelForRole,
  dashboardPathForRole,
} from "@/lib/dashboard-nav";
import type { Role } from "@/app/generated/prisma/client";

function closingCopy(role: Role): { heading: string; body: string; cta: string } {
  switch (role) {
    case "ADMIN":
      return {
        heading: "Manage the platform",
        body: "Review users, courses, payouts, and platform settings from your admin panel.",
        cta: "Open admin panel",
      };
    case "INSTRUCTOR":
      return {
        heading: "Grow your teaching",
        body: "Update your courses, respond to learners, and track earnings from your dashboard.",
        cta: "Open teaching dashboard",
      };
    default:
      return {
        heading: "Ready to start learning?",
        body: "Join thousands building skills with instructor-led courses on Bravio.",
        cta: "Get started — it's free",
      };
  }
}

export function HomeHeroCta() {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  if (loading) {
    return (
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <div className="h-12 w-full animate-pulse rounded-[var(--radius)] bg-[var(--background-subtle)] sm:min-w-[200px] sm:w-auto" />
        <Link href="/courses" className="w-full sm:w-auto">
          <Button size="lg" variant="outline" className="w-full sm:min-w-[200px]">
            Explore courses
          </Button>
        </Link>
      </div>
    );
  }

  const isAuthenticated = !!session?.user?.id;

  return (
    <>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {isAuthenticated && session.user ?
          <Link href={dashboardPathForRole(session.user.role)} className="w-full sm:w-auto">
            <Button size="lg" variant="accent" className="w-full sm:min-w-[200px]">
              {dashboardCtaLabelForRole(session.user.role)}
            </Button>
          </Link>
        : <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" variant="accent" className="w-full sm:min-w-[200px]">
              Join for free
            </Button>
          </Link>
        }
        <Link href="/courses" className="w-full sm:w-auto">
          <Button size="lg" variant="outline" className="w-full sm:min-w-[200px]">
            Explore courses
          </Button>
        </Link>
      </div>
      {!isAuthenticated ?
        <p className="mt-4 text-sm text-[var(--foreground-muted)]">
          Already learning?{" "}
          <Link href="/login" className="font-semibold text-[var(--primary)] hover:underline">
            Log in
          </Link>
        </p>
      : null}
    </>
  );
}

export function HomeClosingCta() {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  if (loading) {
    return (
      <div className="mt-6 h-12 w-full max-w-[220px] animate-pulse rounded-[var(--radius)] bg-white/20 sm:mx-auto" />
    );
  }

  const isAuthenticated = !!session?.user?.id;
  const closing =
    isAuthenticated && session.user ?
      closingCopy(session.user.role)
    : {
        heading: "Ready to start learning?",
        body: "Join thousands building skills with instructor-led courses on Bravio.",
        cta: "Get started — it's free",
      };
  const href =
    isAuthenticated && session.user ?
      dashboardPathForRole(session.user.role)
    : "/register";

  return (
    <>
      <h2 className="text-2xl font-bold sm:text-3xl">{closing.heading}</h2>
      <p className="mx-auto mt-3 max-w-lg text-indigo-100">{closing.body}</p>
      <Link href={href} className="mt-6 inline-block w-full sm:w-auto">
        <Button size="lg" variant="accent" className="w-full sm:min-w-[220px]">
          {closing.cta}
        </Button>
      </Link>
    </>
  );
}
