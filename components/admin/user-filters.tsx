"use client";

import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import { Button } from "@/components/ui/button";

export function UserFilters({
  q,
  status,
  role,
}: {
  q?: string;
  status?: string;
  role?: string;
}) {
  const router = useRouter();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const params = new URLSearchParams();

    const query = (data.get("q") as string)?.trim();
    const statusVal = data.get("status") as string;
    const roleVal = data.get("role") as string;

    if (query) params.set("q", query);
    if (statusVal) params.set("status", statusVal);
    if (roleVal) params.set("role", roleVal);

    const qs = params.toString();
    router.push(qs ? `/dashboard/admin/users?${qs}` : "/dashboard/admin/users");
  }

  return (
    <form onSubmit={onSubmit} className="surface-card mb-6 flex flex-wrap gap-3 p-4">
      <input
        name="q"
        defaultValue={q ?? ""}
        placeholder="Search name or email..."
        className="input-field min-w-[200px] flex-1"
      />
      <select name="status" defaultValue={status ?? ""} className="input-field w-36">
        <option value="">All statuses</option>
        <option value="ACTIVE">Active</option>
        <option value="SUSPENDED">Suspended</option>
        <option value="BANNED">Banned</option>
      </select>
      <select name="role" defaultValue={role ?? ""} className="input-field w-36">
        <option value="">All roles</option>
        <option value="STUDENT">Student</option>
        <option value="INSTRUCTOR">Instructor</option>
        <option value="ADMIN">Admin</option>
      </select>
      <Button type="submit">Filter</Button>
      {(q || status || role) ?
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/admin/users")}
        >
          Clear
        </Button>
      : null}
    </form>
  );
}
