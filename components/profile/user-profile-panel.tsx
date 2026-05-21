"use client";

import { useActionState } from "react";
import {
  changePasswordAction,
  updateDisplayNameAction,
  type ProfileActionState,
} from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Role, UserStatus } from "@/app/generated/prisma/client";
import { User, KeyRound, Shield } from "lucide-react";

const initial: ProfileActionState = {};

export function UserProfilePanel({
  user,
}: {
  user: {
    name: string | null;
    email: string;
    userCode: string | null;
    role: Role;
    status: UserStatus;
    createdAt: Date;
    isSuperAdmin: boolean;
    adminSensitiveApproved?: boolean;
    adminSensitiveSuspended: boolean;
    instructorStatus?: string | null;
  };
}) {
  const [pwState, pwAction, pwPending] = useActionState(changePasswordAction, initial);
  const [nameState, nameAction, namePending] = useActionState(updateDisplayNameAction, initial);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="surface-card p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-[var(--primary-light)] p-3 text-[var(--primary)]">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--foreground)]">Account</h2>
            <p className="text-sm text-[var(--foreground-muted)]">Your Bravio identity</p>
          </div>
        </div>

        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
              User ID
            </dt>
            <dd className="mt-1 font-mono text-lg font-bold text-[var(--primary)]">
              {user.userCode ?? "—"}
            </dd>
            <p className="mt-1 text-xs text-[var(--foreground-muted)]">
              Use this ID to sign in with your password
            </p>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
              Display name
            </dt>
            <dd className="mt-1 font-semibold text-[var(--foreground)]">
              {user.name ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
              Email
            </dt>
            <dd className="mt-1 text-[var(--foreground-secondary)]">{user.email}</dd>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={user.role === "ADMIN" ? "info" : "default"}>{user.role}</Badge>
            <Badge
              variant={
                user.status === "ACTIVE" ? "success"
                : user.status === "SUSPENDED" ? "warning"
                : "danger"
              }
            >
              {user.status}
            </Badge>
            {user.isSuperAdmin ?
              <Badge variant="info">Super admin</Badge>
            : null}
            {user.instructorStatus ?
              <Badge variant="warning">{user.instructorStatus}</Badge>
            : null}
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-[var(--foreground-muted)]">
              Member since
            </dt>
            <dd className="mt-1 text-[var(--foreground-secondary)]">
              {formatDate(user.createdAt)}
            </dd>
          </div>
        </dl>

        {user.role === "ADMIN" && !user.isSuperAdmin ?
          <p className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
            <Shield className="mb-1 inline h-4 w-4" />
            {user.adminSensitiveApproved && !user.adminSensitiveSuspended ?
              "You have super-admin–approved access to sensitive actions (finances, delete users, all-course access)."
            : user.adminSensitiveSuspended ?
              "Your sensitive admin access has been revoked. Contact a super admin."
            : "Sensitive admin actions require approval from a super admin."}
          </p>
        : null}
      </section>

      <div className="space-y-6">
        <section className="surface-card p-6">
          <h3 className="mb-4 font-bold text-[var(--foreground)]">Update display name</h3>
          <form action={nameAction} className="space-y-3">
            {nameState.error ?
              <p className="text-sm text-red-600">{nameState.error}</p>
            : null}
            {nameState.success ?
              <p className="text-sm text-emerald-700">{nameState.success}</p>
            : null}
            <div className="space-y-1">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" defaultValue={user.name ?? ""} required />
            </div>
            <Button type="submit" disabled={namePending}>
              {namePending ? "Saving..." : "Save name"}
            </Button>
          </form>
        </section>

        <section className="surface-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-[var(--primary)]" />
            <h3 className="font-bold text-[var(--foreground)]">Change password</h3>
          </div>
          <form action={pwAction} className="space-y-3">
            {pwState.error ?
              <p className="text-sm text-red-600">{pwState.error}</p>
            : null}
            {pwState.success ?
              <p className="text-sm text-emerald-700">{pwState.success}</p>
            : null}
            <div className="space-y-1">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" disabled={pwPending}>
              {pwPending ? "Updating..." : "Update password"}
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}
