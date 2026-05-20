"use client";

import { useActionState } from "react";
import { createCourseAction } from "@/app/actions/courses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function NewCourseForm() {
  const [state, action, pending] = useActionState(createCourseAction, {});

  return (
    <form action={action} className="max-w-xl space-y-4 surface-card p-6">
      {state.error ?
        <p className="text-sm text-red-600">{state.error}</p>
      : null}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" required rows={5} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="price">Price (GHS, 0 = free)</Label>
        <Input id="price" name="price" type="number" min={0} step="0.01" defaultValue={0} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
        <Input id="thumbnailUrl" name="thumbnailUrl" type="url" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Creating..." : "Create course"}
      </Button>
    </form>
  );
}
