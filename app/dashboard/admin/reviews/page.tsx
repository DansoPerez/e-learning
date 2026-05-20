import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";
import { adminCommentOnReviewAction } from "@/app/actions/reviews";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import { Star } from "lucide-react";

export default async function AdminReviewsPage() {
  await requireRole("ADMIN");

  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { title: true, slug: true, instructor: { select: { name: true } } } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { name: true, role: true } } },
      },
    },
  });

  return (
    <DashboardWrapper role="ADMIN" title="Course reviews">
      <p className="mb-6 text-sm text-[var(--foreground-muted)]">
        All student ratings and comments across the platform. You can reply as admin on any review.
      </p>

      {reviews.length === 0 ?
        <p className="text-sm text-[var(--foreground-muted)]">No reviews yet.</p>
      : <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="surface-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/courses/${r.course.slug}`}
                    className="font-bold text-[var(--primary)] hover:underline"
                  >
                    {r.course.title}
                  </Link>
                  <p className="text-xs text-[var(--foreground-muted)]">
                    Instructor: {r.course.instructor.name ?? "—"}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < r.rating ? "fill-current" : "text-zinc-300"}`}
                    />
                  ))}
                </div>
              </div>

              <p className="mt-3 text-sm font-medium text-[var(--foreground)]">
                {r.user.name ?? r.user.email}
                <span className="ml-2 text-xs font-normal text-[var(--foreground-muted)]">
                  {formatDate(r.createdAt)}
                </span>
              </p>
              <p className="mt-1 text-sm text-[var(--foreground-secondary)]">{r.comment}</p>

              {r.replies.length > 0 ?
                <ul className="mt-4 space-y-2 border-l-2 border-indigo-100 pl-4">
                  {r.replies.map((reply) => (
                    <li key={reply.id} className="text-sm">
                      <span className="font-medium">{reply.author.name ?? "User"}</span>{" "}
                      <Badge
                        variant={
                          reply.author.role === "ADMIN" ? "info"
                          : reply.author.role === "INSTRUCTOR" ? "warning"
                          : "default"
                        }
                      >
                        {reply.author.role}
                      </Badge>
                      <span className="ml-2 text-xs text-[var(--foreground-muted)]">
                        {formatDate(reply.createdAt)}
                      </span>
                      <p className="mt-1 text-[var(--foreground-secondary)]">{reply.body}</p>
                    </li>
                  ))}
                </ul>
              : null}

              <form
                action={adminCommentOnReviewAction.bind(null, r.id)}
                className="mt-4 space-y-2 border-t border-[var(--border)] pt-4"
              >
                <Label htmlFor={`admin-reply-${r.id}`}>Admin comment</Label>
                <Textarea
                  id={`admin-reply-${r.id}`}
                  name="body"
                  required
                  rows={2}
                  placeholder="Reply as platform admin..."
                />
                <Button type="submit" size="sm">
                  Post admin comment
                </Button>
              </form>
            </div>
          ))}
        </div>
      }
    </DashboardWrapper>
  );
}
