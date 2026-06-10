import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getInstructorProfile } from "@/lib/instructor";
import { dashboardPathForRole } from "@/lib/dashboard-nav";

export default async function DashboardIndexPage() {
  const user = await requireAuth();

  if (user.role === "INSTRUCTOR") {
    const profile = await getInstructorProfile(user.id);
    if (!profile) redirect("/dashboard/instructor/apply");
    if (profile.status !== "APPROVED") redirect("/dashboard/instructor/pending");
  }

  redirect(dashboardPathForRole(user.role));
}
