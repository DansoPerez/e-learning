import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getInstructorProfile, instructorStatusMessage } from "@/lib/instructor";
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";
import { getInstructorNavItems } from "@/lib/instructor-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ShieldAlert } from "lucide-react";

export default async function InstructorPendingPage() {
  const user = await requireRole("INSTRUCTOR");
  const profile = await getInstructorProfile(user.id);

  if (!profile) {
    redirect("/dashboard/instructor/apply");
  }

  if (profile.status === "APPROVED") {
    redirect("/dashboard/instructor");
  }

  return (
    <DashboardWrapper
      role="INSTRUCTOR"
      title="Application status"
      navItems={getInstructorNavItems(profile.status, false)}
    >
      <div className="mx-auto max-w-2xl">
        <div className="surface-card p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            {profile.status === "PENDING" ?
              <Clock className="h-8 w-8" />
            : <ShieldAlert className="h-8 w-8" />}
          </div>

          <Badge
            variant={
              profile.status === "PENDING" ? "warning"
              : profile.status === "REJECTED" ? "danger"
              : "default"
            }
            className="mb-4"
          >
            {profile.status}
          </Badge>

          <h2 className="text-xl font-bold text-[var(--foreground)]">
            {profile.status === "PENDING" ?
              "Awaiting admin approval"
            : profile.status === "REJECTED" ?
              "Application not approved"
            : "Instructor access restricted"}
          </h2>

          <p className="mt-3 text-[var(--foreground-muted)]">
            {instructorStatusMessage(profile.status)}
          </p>

          {profile.rejectionReason ?
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
              Admin note: {profile.rejectionReason}
            </p>
          : null}

          {profile.status === "PENDING" ?
            <p className="mt-6 text-sm text-[var(--foreground-secondary)]">
              You cannot create, edit, or publish courses until an administrator reviews your
              application and live selfie verification.
            </p>
          : null}

          {profile.selfieUrl ?
            <div className="mt-6">
              <p className="mb-2 text-xs font-semibold uppercase text-[var(--foreground-muted)]">
                Submitted verification photo
              </p>
              <img
                src={profile.selfieUrl}
                alt="Your verification selfie"
                className="mx-auto h-40 w-40 rounded-xl border object-cover"
              />
            </div>
          : null}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {(profile.status === "REJECTED" || profile.status === "REVOKED") ?
              <Link href="/dashboard/instructor/apply">
                <Button>Update application</Button>
              </Link>
            : null}
            <Link href="/courses">
              <Button variant="outline">Browse courses</Button>
            </Link>
          </div>
        </div>
      </div>
    </DashboardWrapper>
  );
}
