"use client";

import { useActionState } from "react";
import { updateCourseAction } from "@/app/actions/courses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Category = { id: string; name: string };

export function EditCourseForm({
  courseId,
  course,
  categories,
}: {
  courseId: string;
  course: {
    title: string;
    description: string;
    price: number;
    thumbnailUrl: string | null;
    categoryId: string | null;
    status: string;
  };
  categories: Category[];
}) {
  const [state, action, pending] = useActionState(
    updateCourseAction.bind(null, courseId),
    {},
  );

  return (
    <form action={action} className="surface-card mb-8 space-y-4 p-6">
      <h2 className="font-semibold text-[var(--foreground)]">Course details</h2>
      {state.error ?
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{state.error}</p>
      : null}
      {state.success ?
        <p className="rounded-lg bg-[var(--success-bg)] px-3 py-2 text-sm text-[var(--success)]">
          Course details saved.
        </p>
      : null}
      <div className="space-y-2">
        <Label htmlFor="edit-title">Title</Label>
        <Input id="edit-title" name="title" required defaultValue={course.title} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-description">Description</Label>
        <Textarea
          id="edit-description"
          name="description"
          required
          rows={5}
          defaultValue={course.description}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edit-category">Category</Label>
          <select
            id="edit-category"
            name="categoryId"
            className="input-field w-full"
            defaultValue={course.categoryId ?? ""}
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-price">Price (GHS, 0 = free)</Label>
          <Input
            id="edit-price"
            name="price"
            type="number"
            min={0}
            step="0.01"
            defaultValue={Number(course.price)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-thumbnail">Thumbnail URL</Label>
        <Input
          id="edit-thumbnail"
          name="thumbnailUrl"
          type="url"
          defaultValue={course.thumbnailUrl ?? ""}
          placeholder="https://..."
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save course details"}
      </Button>
    </form>
  );
}
