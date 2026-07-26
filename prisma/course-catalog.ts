import { ACADEMIC_COURSES } from "./catalog/academics";
import { BUSINESS_COURSES } from "./catalog/business";
import { DATA_SCIENCE_COURSES } from "./catalog/data-science";
import { DESIGN_COURSES } from "./catalog/design";
import { PERSONAL_DEVELOPMENT_COURSES } from "./catalog/personal-development";
import { PROFESSIONAL_COURSES } from "./catalog/professional";
import { PROGRAMMING_COURSES } from "./catalog/programming";
import type { SeedCourse } from "./catalog/types";

export type {
  CourseCategory,
  SeedCourse,
  SeedLesson,
  SeedModule,
  SeedQuestion,
  SeedQuiz,
} from "./catalog/types";

/**
 * The seeded course library. Every lesson video, PDF and thumbnail points at a
 * real, openly available resource — run `npm run courses:verify` after editing.
 */
export const COURSE_CATALOG: SeedCourse[] = [
  ...PROGRAMMING_COURSES,
  ...DATA_SCIENCE_COURSES,
  ...DESIGN_COURSES,
  ...BUSINESS_COURSES,
  ...PERSONAL_DEVELOPMENT_COURSES,
  ...ACADEMIC_COURSES,
  ...PROFESSIONAL_COURSES,
];
