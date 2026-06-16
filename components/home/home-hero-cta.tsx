"use client";

import Link from "next/link";
import type { Session } from "next-auth";
import { Button } from "@/components/ui/button";
import { CourseSearch } from "@/components/layout/course-search";
import {
  dashboardCtaLabelForRole,
  dashboardPathForRole,
} from "@/lib/dashboard-nav";
import { useAppSession } from "@/lib/use-app-session";
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
        heading: "Keep building your skills",
        body: "Pick up your courses and continue learning where you left off.",
        cta: dashboardCtaLabelForRole("STUDENT"),
      };
  }
}

export function HomeHeroCta({ initialSession }: { initialSession?: Session | null }) {
  const { session, isAuthenticated, isLoading } = useAppSession(initialSession);

  if (isLoading) {
    return (
      <div className="mt-8 space-y-4">
        <div className="mx-auto h-14 max-w-2xl animate-pulse rounded-sm bg-white/20" />
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <div className="h-11 w-full animate-pulse rounded-sm bg-white/20 sm:min-w-[180px] sm:w-auto" />
          <div className="h-11 w-full animate-pulse rounded-sm bg-white/20 sm:min-w-[180px] sm:w-auto" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto mt-8 max-w-2xl">
        <CourseSearch size="lg" placeholder="What do you want to learn?" />
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {isAuthenticated && session?.user ?
          <Link href={dashboardPathForRole(session.user.role)} className="w-full sm:w-auto">
            <Button size="lg" variant="secondaryOnDark" className="w-full sm:min-w-[200px]">
              {dashboardCtaLabelForRole(session.user.role)}
            </Button>
          </Link>
        : <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" variant="secondaryOnDark" className="w-full sm:min-w-[200px]">
              Join for free
            </Button>
          </Link>
        }
        <Link href="/courses" className="w-full sm:w-auto">
          <Button size="lg" variant="outlineOnDark" className="w-full sm:min-w-[200px]">
            Explore catalog
          </Button>
        </Link>
      </div>
      {!isAuthenticated ?
        <p className="mt-4 text-sm text-blue-100">
          Already on Bravio?{" "}
          <Link href="/login" className="font-semibold text-white underline-offset-2 hover:underline">
            Log in
          </Link>
        </p>
      : null}
    </>
  );
}

export function HomeClosingCta({ initialSession }: { initialSession?: Session | null }) {
  const { session, isAuthenticated, isLoading } = useAppSession(initialSession);

  if (isLoading) {
    return (
      <div className="mt-6 h-12 w-full max-w-[220px] animate-pulse rounded-sm bg-white/20 sm:mx-auto" />
    );
  }

  const closing =
    isAuthenticated && session?.user ?
      closingCopy(session.user.role)
    : {
        heading: "Take the next step toward your goals",
        body: "Join learners worldwide building skills with expert-led courses.",
        cta: "Join for free",
      };
  const href =
    isAuthenticated && session?.user ?
      dashboardPathForRole(session.user.role)
    : "/register";

  return (
    <>
      <h2 className="text-2xl font-bold sm:text-3xl">{closing.heading}</h2>
      <p className="mx-auto mt-3 max-w-lg text-blue-100">{closing.body}</p>
      <Link href={href} className="mt-6 inline-block w-full sm:w-auto">
        <Button size="lg" variant="secondaryOnDark" className="w-full sm:min-w-[220px]">
          {closing.cta}
        </Button>
      </Link>
    </>
  );
}
