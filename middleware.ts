import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const sessionUserId = req.auth?.user?.id;

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");
  const isDashboard = pathname.startsWith("/dashboard");

  let role = req.auth?.user?.role;
  let active = true;

  if (isLoggedIn && sessionUserId && (isDashboard || isAuthPage)) {
    const dbUser = await prisma.user.findUnique({
      where: { id: sessionUserId },
      select: { role: true, status: true },
    });
    if (!dbUser || dbUser.status !== "ACTIVE") {
      active = false;
    } else {
      role = dbUser.role;
    }
  }

  if (!active && (isDashboard || isAuthPage)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAuthPage && isLoggedIn && active) {
    const dest =
      role === "ADMIN" ?
        "/dashboard/admin"
      : role === "INSTRUCTOR" ?
        "/dashboard/instructor"
      : "/dashboard/student";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  if (isDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/dashboard/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (
    pathname.startsWith("/dashboard/instructor") &&
    role !== "INSTRUCTOR" &&
    role !== "ADMIN"
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
