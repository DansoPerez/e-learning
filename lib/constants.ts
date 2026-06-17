export const PLATFORM_NAME = "Bravio";

export const INSTRUCTOR_SHARE = 0.6;
export const PLATFORM_SHARE = 0.4;

export const DEFAULT_PLATFORM_COMMISSION_KEY = "platform_commission";

export const COURSE_CATEGORIES = [
  "Programming",
  "Design",
  "Business",
  "Marketing",
  "Data Science",
  "Personal Development",
  "Academics",
  "Other",
] as const;

export const DASHBOARD_ROUTES = {
  STUDENT: "/dashboard/student",
  INSTRUCTOR: "/dashboard/instructor",
  ADMIN: "/dashboard/admin",
} as const;
