import Link from "next/link";
import { PLATFORM_NAME } from "@/lib/constants";
import { BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-white">
      <div className="page-container flex flex-col items-center justify-between gap-4 py-10 sm:flex-row">
        <div className="flex items-center gap-2 font-bold text-[var(--primary)]">
          <BookOpen className="h-5 w-5" />
          {PLATFORM_NAME}
        </div>
        <nav className="flex flex-wrap justify-center gap-6 text-sm font-medium text-[var(--foreground-secondary)]">
          <Link href="/courses" className="hover:text-[var(--primary)]">
            Courses
          </Link>
          <Link href="/login" className="hover:text-[var(--primary)]">
            Sign in
          </Link>
          <Link href="/register" className="hover:text-[var(--primary)]">
            Register
          </Link>
        </nav>
        <p className="text-sm text-[var(--foreground-muted)]">
          © {new Date().getFullYear()} {PLATFORM_NAME}
        </p>
      </div>
    </footer>
  );
}
