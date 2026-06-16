import { InstructorDashboardWrapper } from "@/components/layout/instructor-dashboard-wrapper";
import { NewCourseForm } from "@/components/instructor/new-course-form";
import { isCloudinaryEnabled } from "@/lib/cloudinary";

export default function NewCoursePage() {
  return (
    <InstructorDashboardWrapper title="Create course">
      <NewCourseForm cloudinaryReady={isCloudinaryEnabled()} />
    </InstructorDashboardWrapper>
  );
}
