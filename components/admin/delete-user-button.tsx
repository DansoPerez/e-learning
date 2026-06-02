"use client";

import { deleteUserAction } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function DeleteUserButton({
  userId,
  userLabel,
}: {
  userId: string;
  userLabel: string;
}) {
  return (
    <form
      action={deleteUserAction.bind(null, userId)}
      onSubmit={(e) => {
        const confirmed = window.confirm(
          `Permanently delete "${userLabel}"?\n\nThis removes their account, courses, enrollments, and payment records. This cannot be undone.`,
        );
        if (!confirmed) e.preventDefault();
      }}
    >
      <Button type="submit" variant="danger" size="sm" className="min-h-[44px] w-full gap-1.5 sm:w-auto">
        <Trash2 className="h-3.5 w-3.5" />
        Delete account
      </Button>
    </form>
  );
}
