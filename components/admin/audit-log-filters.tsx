"use client";

import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import { Button } from "@/components/ui/button";

export function AuditLogFilters({
  q,
  role,
  action,
}: {
  q?: string;
  role?: string;
  action?: string;
}) {
  const router = useRouter();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const params = new URLSearchParams();

    const query = (data.get("q") as string)?.trim();
    const roleVal = data.get("role") as string;
    const actionVal = (data.get("action") as string)?.trim();

    if (query) params.set("q", query);
    if (roleVal) params.set("role", roleVal);
    if (actionVal) params.set("action", actionVal);

    const qs = params.toString();
    router.push(qs ? `/dashboard/admin/logs?${qs}` : "/dashboard/admin/logs");
  }

  return (
    <form onSubmit={onSubmit} className="surface-card mb-6 flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap">
      <input
        name="q"
        defaultValue={q ?? ""}
        placeholder="Search user ID, name, action, description..."
        className="input-field min-h-[44px] w-full flex-1 sm:min-w-[220px]"
      />
      <select name="role" defaultValue={role ?? ""} className="input-field min-h-[44px] w-full sm:w-36">
        <option value="">All roles</option>
        <option value="STUDENT">Student</option>
        <option value="INSTRUCTOR">Instructor</option>
        <option value="ADMIN">Admin</option>
      </select>
      <input
        name="action"
        defaultValue={action ?? ""}
        placeholder="Action (e.g. LOGIN)"
        className="input-field min-h-[44px] w-full sm:w-44"
      />
      <Button type="submit" className="w-full sm:w-auto">
        Search
      </Button>
      {(q || role || action) ?
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => router.push("/dashboard/admin/logs")}
        >
          Clear
        </Button>
      : null}
    </form>
  );
}
