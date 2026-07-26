import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { slugify } from "../lib/utils";
import { generateUserCode, backfillMissingUserCodes } from "../lib/user-code";
import { COURSE_CATEGORIES } from "../lib/constants";
import { COURSE_CATALOG, type SeedCourse } from "./course-catalog";

/**
 * Lesson and quiz content is rebuilt on every run so edits to the catalog show
 * up immediately. That clears progress and quiz attempts for seeded courses,
 * which is the right trade-off for demo content but not for learner data.
 */
async function rebuildCourseContent(courseId: string, course: SeedCourse) {
  await prisma.module.deleteMany({ where: { courseId } });
  await prisma.quiz.deleteMany({ where: { courseId } });

  for (const [moduleIndex, courseModule] of course.modules.entries()) {
    const created = await prisma.module.create({
      data: { courseId, title: courseModule.title, orderIndex: moduleIndex },
    });

    await prisma.lesson.createMany({
      data: courseModule.lessons.map((lesson, lessonIndex) => ({
        moduleId: created.id,
        title: lesson.title,
        content: lesson.content,
        videoUrl: lesson.videoUrl ?? null,
        pdfStorageKey: lesson.pdfUrl ?? null,
        orderIndex: lessonIndex,
        durationMin: lesson.durationMin,
      })),
    });
  }

  for (const quiz of course.quizzes) {
    const created = await prisma.quiz.create({
      data: {
        courseId,
        title: quiz.title,
        durationMin: quiz.durationMin,
        passingScore: quiz.passingScore,
      },
    });

    await prisma.question.createMany({
      data: quiz.questions.map((question, orderIndex) => ({
        quizId: created.id,
        question: question.question,
        type: question.type,
        options: question.type === "MCQ" ? question.options : undefined,
        correctAnswer: question.correctAnswer,
        orderIndex,
      })),
    });
  }
}

/**
 * Earlier seeds published a placeholder catalogue. Those courses are retired
 * rather than left alongside the real ones, but a course with recorded payments
 * is hidden instead of deleted so financial history stays intact.
 */
async function retireCoursesOutsideCatalog(instructorId: string, keepSlugs: Set<string>) {
  const stale = await prisma.course.findMany({
    where: { instructorId, slug: { notIn: [...keepSlugs] } },
    select: { id: true, slug: true, _count: { select: { payments: true } } },
  });

  let deleted = 0;
  let hidden = 0;

  for (const course of stale) {
    if (course._count.payments > 0) {
      await prisma.course.update({ where: { id: course.id }, data: { status: "HIDDEN" } });
      hidden += 1;
      continue;
    }
    await prisma.course.delete({ where: { id: course.id } });
    deleted += 1;
  }

  return { deleted, hidden };
}

async function seedUsers() {
  const passwordHash = await bcrypt.hash("Admin123!", 12);
  const adminCode = await generateUserCode("ADMIN", "Super Admin");
  const admin = await prisma.user.upsert({
    where: { email: "admin@bravio.app" },
    update: {
      isSuperAdmin: true,
      userCode: adminCode,
      adminSensitiveApproved: true,
      adminSensitiveSuspended: false,
      emailVerified: new Date(),
    },
    create: {
      name: "Super Admin",
      email: "admin@bravio.app",
      passwordHash,
      role: "ADMIN",
      userCode: adminCode,
      isSuperAdmin: true,
      adminSensitiveApproved: true,
      emailVerified: new Date(),
    },
  });

  const instructorHash = await bcrypt.hash("Instructor123!", 12);
  const instructorCode = await generateUserCode("INSTRUCTOR", "Demo Instructor");
  const instructor = await prisma.user.upsert({
    where: { email: "instructor@bravio.app" },
    update: { userCode: instructorCode, emailVerified: new Date() },
    create: {
      name: "Demo Instructor",
      email: "instructor@bravio.app",
      passwordHash: instructorHash,
      role: "INSTRUCTOR",
      userCode: instructorCode,
      emailVerified: new Date(),
    },
  });

  await prisma.instructorProfile.upsert({
    where: { userId: instructor.id },
    update: { status: "APPROVED" },
    create: {
      userId: instructor.id,
      bio: "Experienced software engineering lecturer with 10+ years teaching web development and databases.",
      expertise: "Web Development",
      experienceYears: 10,
      qualification: "MSc Computer Science",
      status: "APPROVED",
    },
  });

  const studentHash = await bcrypt.hash("Student123!", 12);
  const studentCode = await generateUserCode("STUDENT", "Demo Student");
  await prisma.user.upsert({
    where: { email: "student@bravio.app" },
    update: { userCode: studentCode, emailVerified: new Date() },
    create: {
      name: "Demo Student",
      email: "student@bravio.app",
      passwordHash: studentHash,
      role: "STUDENT",
      userCode: studentCode,
      emailVerified: new Date(),
    },
  });

  await backfillMissingUserCodes();

  return { admin, adminCode, instructor, instructorCode, studentCode };
}

async function seedCategories() {
  const categoryIds = new Map<string, string>();
  for (const name of COURSE_CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { slug: slugify(name) },
      update: { name },
      create: { name, slug: slugify(name) },
    });
    categoryIds.set(name, category.id);
  }
  return categoryIds;
}

async function main() {
  const { admin, adminCode, instructor, instructorCode, studentCode } = await seedUsers();
  const categoryIds = await seedCategories();

  const slugs = new Set<string>();
  let lessonCount = 0;

  for (const item of COURSE_CATALOG) {
    const slug = slugify(item.title);
    if (slugs.has(slug)) {
      throw new Error(`Duplicate course slug in catalog: ${slug}`);
    }
    slugs.add(slug);

    const course = await prisma.course.upsert({
      where: { slug },
      update: {
        title: item.title,
        description: item.description,
        thumbnailUrl: item.thumbnailUrl ?? null,
        status: "PUBLISHED",
        featured: item.featured ?? false,
        categoryId: categoryIds.get(item.category),
      },
      create: {
        instructorId: instructor.id,
        categoryId: categoryIds.get(item.category),
        title: item.title,
        slug,
        description: item.description,
        thumbnailUrl: item.thumbnailUrl ?? null,
        price: 0,
        status: "PUBLISHED",
        featured: item.featured ?? false,
      },
    });

    await rebuildCourseContent(course.id, item);
    lessonCount += item.modules.reduce((total, m) => total + m.lessons.length, 0);
    console.log(`  seeded ${item.title}`);
  }

  const retired = await retireCoursesOutsideCatalog(instructor.id, slugs);

  await prisma.systemSetting.upsert({
    where: { key: "platform_commission" },
    update: {},
    create: { key: "platform_commission", value: "0.4" },
  });

  const quizCount = await prisma.quiz.count();
  const questionCount = await prisma.question.count();
  const videoCount = await prisma.lesson.count({ where: { videoUrl: { not: null } } });
  const pdfCount = await prisma.lesson.count({ where: { pdfStorageKey: { not: null } } });

  console.log("\nSeed complete.");
  console.log(
    `Courses: ${COURSE_CATALOG.length} published across ${COURSE_CATEGORIES.length} categories.`,
  );
  console.log(`Lessons: ${lessonCount} (${videoCount} with video, ${pdfCount} with a PDF).`);
  console.log(`Quizzes: ${quizCount} · Questions: ${questionCount}.`);
  if (retired.deleted || retired.hidden) {
    console.log(`Retired legacy courses: ${retired.deleted} deleted, ${retired.hidden} hidden.`);
  }
  console.log(`Admin: ${admin.userCode ?? adminCode} / admin@bravio.app / Admin123!`);
  console.log(
    `Instructor: ${instructor.userCode ?? instructorCode} / instructor@bravio.app / Instructor123!`,
  );
  console.log(`Student: ${studentCode} / student@bravio.app / Student123!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
