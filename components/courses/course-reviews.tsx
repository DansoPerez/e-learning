"use client";

import { useActionState } from "react";
import {
  adminCommentOnReviewAction,
  deleteReviewAction,
  deleteReviewReplyAction,
  replyToReviewAction,
  submitReviewAction,
} from "@/app/actions/reviews";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Star } from "lucide-react";

type Reply = {
  id: string;
  body: string;
  createdAt: Date;
  deletedAt?: Date | null;
  author: { id: string; name: string | null; role: string };
};

type Review = {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date;
  deletedAt?: Date | null;
  user: { id: string; name: string | null };
  replies: Reply[];
};

export function CourseReviews({
  courseId,
  courseSlug,
  reviews,
  canReview,
  canReplyAsInstructor,
  isAdmin,
  currentUserId,
}: {
  courseId: string;
  courseSlug: string;
  reviews: Review[];
  canReview: boolean;
  canReplyAsInstructor: boolean;
  isAdmin: boolean;
  currentUserId?: string;
}) {
  return (
    <section className="mt-10">
      <h2 className="mb-4 text-xl font-semibold text-[var(--foreground)]">
        Reviews & discussion
      </h2>

      {canReview ?
        <ReviewForm courseId={courseId} courseSlug={courseSlug} />
      : null}

      {reviews.length === 0 ?
        <p className="text-sm text-[var(--foreground-muted)]">No reviews yet.</p>
      : <div className="space-y-4">
          {reviews.map((r) => (
            <ReviewCard
              key={r.id}
              review={r}
              courseSlug={courseSlug}
              canReply={canReplyAsInstructor || isAdmin}
              isAdmin={isAdmin}
              isOwnReview={currentUserId === r.user.id}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      }
    </section>
  );
}

function ReviewForm({ courseId, courseSlug }: { courseId: string; courseSlug: string }) {
  const [state, action, pending] = useActionState(
    submitReviewAction.bind(null, courseId, courseSlug),
    {},
  );

  return (
    <form action={action} className="surface-card mb-6 space-y-3 p-4">
      {state.error ?
        <p className="text-sm text-red-600">{state.error}</p>
      : null}
      {state.success ?
        <p className="text-sm text-emerald-600">Review submitted. Thank you!</p>
      : null}
      <div className="space-y-2">
        <Label htmlFor="rating">Rating (1–5)</Label>
        <select id="rating" name="rating" required className="input-field w-32" defaultValue={5}>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} stars
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="comment">Your review</Label>
        <Textarea
          id="comment"
          name="comment"
          required
          minLength={3}
          rows={3}
          placeholder="Share your experience with this course..."
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Submitting..." : "Submit review"}
      </Button>
    </form>
  );
}

function ReviewCard({
  review,
  courseSlug,
  canReply,
  isAdmin,
  isOwnReview,
  currentUserId,
}: {
  review: Review;
  courseSlug: string;
  canReply: boolean;
  isAdmin: boolean;
  isOwnReview: boolean;
  currentUserId?: string;
}) {
  const deleted = !!review.deletedAt;

  return (
    <div
      className={`surface-card p-4 ${isAdmin && deleted ? "border-2 border-red-300 bg-red-50" : ""}`}
    >
      {isAdmin && deleted ?
        <p className="mb-2 text-xs font-bold text-red-700">Deleted review (visible to admin)</p>
      : null}
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-semibold text-[var(--foreground)]">
          {review.user.name ?? "Student"}
          {isOwnReview ? <span className="text-xs text-[var(--foreground-muted)]"> (you)</span> : null}
        </p>
        <div className="flex items-center gap-0.5 text-amber-500">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < review.rating ? "fill-current" : "text-zinc-300"}`}
            />
          ))}
        </div>
        <span className="text-xs text-[var(--foreground-muted)]">
          {formatDate(review.createdAt)}
        </span>
      </div>
      <p
        className={`mt-2 text-sm ${deleted && !isAdmin ? "italic text-[var(--foreground-muted)]" : "text-[var(--foreground-secondary)]"}`}
      >
        {deleted && !isAdmin ? "[Review deleted]" : review.comment}
      </p>
      {isOwnReview && !deleted ?
        <form action={deleteReviewAction.bind(null, review.id, courseSlug)} className="mt-2">
          <Button type="submit" size="sm" variant="outline">
            Delete my review
          </Button>
        </form>
      : null}

      {review.replies.length > 0 ?
        <ul className="mt-4 space-y-3 border-l-2 border-[var(--primary-muted)] pl-4">
          {review.replies.map((reply) => {
            const replyDeleted = !!reply.deletedAt;
            const isOwnReply = reply.author.id === currentUserId;
            return (
            <li
              key={reply.id}
              className={isAdmin && replyDeleted ? "rounded-lg border border-red-200 bg-red-50/80 p-2" : ""}
            >
              {isAdmin && replyDeleted ?
                <p className="text-xs font-bold text-red-700">Deleted reply</p>
              : null}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {reply.author.name ?? "User"}
                </span>
                <Badge
                  variant={
                    reply.author.role === "ADMIN" ? "info"
                    : reply.author.role === "INSTRUCTOR" ? "warning"
                    : "default"
                  }
                >
                  {reply.author.role === "ADMIN" ?
                    "Admin"
                  : reply.author.role === "INSTRUCTOR" ?
                    "Instructor"
                  : "Reply"}
                </Badge>
                <span className="text-xs text-[var(--foreground-muted)]">
                  {formatDate(reply.createdAt)}
                </span>
              </div>
              <p className="mt-1 text-sm text-[var(--foreground-secondary)]">
                {replyDeleted && !isAdmin ? "[Reply deleted]" : reply.body}
              </p>
              {isOwnReply && !replyDeleted ?
                <form
                  action={deleteReviewReplyAction.bind(null, reply.id, courseSlug)}
                  className="mt-1"
                >
                  <Button type="submit" size="sm" variant="outline">
                    Delete
                  </Button>
                </form>
              : null}
            </li>
          );
          })}
        </ul>
      : null}

      {canReply ?
        <ReplyForm
          reviewId={review.id}
          courseSlug={courseSlug}
          isAdmin={isAdmin}
          label={isAdmin ? "Admin comment" : "Reply as instructor"}
        />
      : null}
    </div>
  );
}

function ReplyForm({
  reviewId,
  courseSlug,
  isAdmin,
  label,
}: {
  reviewId: string;
  courseSlug: string;
  isAdmin: boolean;
  label: string;
}) {
  if (isAdmin) {
    return (
      <form
        action={adminCommentOnReviewAction.bind(null, reviewId)}
        className="mt-4 space-y-2 border-t border-[var(--border)] pt-4"
      >
        <Label htmlFor={`reply-${reviewId}`}>{label}</Label>
        <Textarea
          id={`reply-${reviewId}`}
          name="body"
          required
          rows={2}
          placeholder="Write your comment..."
        />
        <Button type="submit" size="sm">
          Post comment
        </Button>
      </form>
    );
  }

  const [state, formAction, pending] = useActionState(
    replyToReviewAction.bind(null, reviewId, courseSlug),
    {},
  );

  return (
    <form action={formAction} className="mt-4 space-y-2 border-t border-[var(--border)] pt-4">
      {state.error ?
        <p className="text-sm text-red-600">{state.error}</p>
      : null}
      <Label htmlFor={`reply-${reviewId}`}>{label}</Label>
      <Textarea
        id={`reply-${reviewId}`}
        name="body"
        required
        rows={2}
        placeholder="Write your reply..."
      />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Posting..." : "Post reply"}
      </Button>
    </form>
  );
}
