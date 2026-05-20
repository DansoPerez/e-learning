import type { AnnouncementScope } from "@/app/generated/prisma/client";

export function scopeLabel(scope: AnnouncementScope): string {
  switch (scope) {
    case "STUDENTS":
      return "All students";
    case "INSTRUCTORS":
      return "All instructors";
    case "COURSE":
      return "Course";
    default:
      return scope;
  }
}
