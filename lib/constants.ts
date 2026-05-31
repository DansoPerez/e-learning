export const PLATFORM_NAME = "Bravio";

/** Require Brevo OTP before registration (see app/actions/registration.ts). Set true when Brevo is configured. */
export const EMAIL_VERIFICATION_ENABLED = false;

/** Charge for paid courses via Paystack. Set true after PAYSTACK_SECRET_KEY is configured. */
export const PAYMENTS_ENABLED = false;

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
