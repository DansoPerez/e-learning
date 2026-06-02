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
    <form onSubmit={onSubmit} className="surface-card mb-6 flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap">
      <input
        name="q"
        defaultValue={q ?? ""}
        placeholder="Search name or email..."
        className="input-field min-h-[44px] w-full flex-1 sm:min-w-[200px]"
      />
      <select name="status" defaultValue={status ?? ""} className="input-field min-h-[44px] w-full sm:w-36">
        <option value="">All statuses</option>
        <option value="ACTIVE">Active</option>
        <option value="SUSPENDED">Suspended</option>
        <option value="BANNED">Banned</option>
      </select>
      <select name="role" defaultValue={role ?? ""} className="input-field min-h-[44px] w-full sm:w-36">
        <option value="">All roles</option>
        <option value="STUDENT">Student</option>
        <option value="INSTRUCTOR">Instructor</option>
        <option value="ADMIN">Admin</option>
      </select>
      <Button type="submit" className="w-full sm:w-auto">
        Filter
      </Button>
      {(q || status || role) ?
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => router.push("/dashboard/admin/users")}
        >
          Clear
        </Button>
      : null}
    </form>
  );
}
