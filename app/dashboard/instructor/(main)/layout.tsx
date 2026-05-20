import { requireRole } from "@/lib/auth";
import { requireApprovedInstructor } from "@/lib/instructor";

export default async function InstructorPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("INSTRUCTOR", "ADMIN");

  if (user.role === "INSTRUCTOR") {
    await requireApprovedInstructor(user.id);
  }

  return children;
}
