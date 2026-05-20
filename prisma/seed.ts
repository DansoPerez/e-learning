import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { slugify } from "../lib/utils";

async function main() {
  const passwordHash = await bcrypt.hash("Admin123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@bravio.app" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@bravio.app",
      passwordHash,
      role: "ADMIN",
    },
  });

  const instructorHash = await bcrypt.hash("Instructor123!", 12);
  const instructor = await prisma.user.upsert({
    where: { email: "instructor@bravio.app" },
    update: {},
    create: {
      name: "Demo Instructor",
      email: "instructor@bravio.app",
      passwordHash: instructorHash,
      role: "INSTRUCTOR",
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
  await prisma.user.upsert({
    where: { email: "student@bravio.app" },
    update: {},
    create: {
      name: "Demo Student",
      email: "student@bravio.app",
      passwordHash: studentHash,
      role: "STUDENT",
    },
  });

  const categories = ["Programming", "Design", "Business"];
  for (const name of categories) {
    await prisma.category.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name) },
    });
  }

  const programming = await prisma.category.findUnique({
    where: { slug: "programming" },
  });

  const course = await prisma.course.upsert({
    where: { slug: "intro-to-web-development" },
    update: {},
    create: {
      instructorId: instructor.id,
      categoryId: programming?.id,
      title: "Intro to Web Development",
      slug: "intro-to-web-development",
      description:
        "Learn HTML, CSS, JavaScript, and modern full-stack fundamentals. Perfect for university students and IT beginners.",
      price: 0,
      status: "PUBLISHED",
      featured: true,
    },
  });

  const existingModule = await prisma.module.findFirst({
    where: { courseId: course.id },
  });

  if (!existingModule) {
    const mod = await prisma.module.create({
      data: { courseId: course.id, title: "Getting Started", orderIndex: 0 },
    });

    await prisma.lesson.createMany({
      data: [
        {
          moduleId: mod.id,
          title: "Welcome to the course",
          content: "Welcome to Bravio! This lesson introduces the course structure.",
          orderIndex: 0,
        },
        {
          moduleId: mod.id,
          title: "Setting up your environment",
          content: "Install Node.js, VS Code, and Git to follow along with exercises.",
          orderIndex: 1,
        },
      ],
    });

    const quiz = await prisma.quiz.create({
      data: {
        courseId: course.id,
        title: "Module 1 Quiz",
        passingScore: 70,
      },
    });

    await prisma.question.createMany({
      data: [
        {
          quizId: quiz.id,
          question: "What does HTML stand for?",
          type: "MCQ",
          options: [
            "HyperText Markup Language",
            "High Tech Modern Language",
            "Home Tool Markup Language",
          ],
          correctAnswer: "HyperText Markup Language",
          orderIndex: 0,
        },
        {
          quizId: quiz.id,
          question: "JavaScript runs only on servers.",
          type: "TRUE_FALSE",
          correctAnswer: "false",
          orderIndex: 1,
        },
      ],
    });
  }

  await prisma.systemSetting.upsert({
    where: { key: "platform_commission" },
    update: {},
    create: { key: "platform_commission", value: "0.4" },
  });

  console.log("Seed complete.");
  console.log("Admin: admin@bravio.app / Admin123!");
  console.log("Instructor: instructor@bravio.app / Instructor123!");
  console.log("Student: student@bravio.app / Student123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
