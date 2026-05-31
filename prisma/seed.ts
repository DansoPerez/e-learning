import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { slugify } from "../lib/utils";
import { generateUserCode, backfillMissingUserCodes } from "../lib/user-code";
import { COURSE_CATEGORIES } from "../lib/constants";

type SeedCourse = {
  title: string;
  description: string;
  featured?: boolean;
};

const COURSE_CATALOG: Record<(typeof COURSE_CATEGORIES)[number], SeedCourse[]> = {
  Programming: [
    {
      title: "Intro to Web Development",
      description:
        "Learn HTML, CSS, JavaScript, and modern full-stack fundamentals. Perfect for university students and IT beginners.",
      featured: true,
    },
    {
      title: "Python Programming Fundamentals",
      description:
        "Write clean Python from scratch — variables, functions, OOP, file I/O, and practical scripts for automation.",
    },
    {
      title: "React & Next.js for Production",
      description:
        "Build fast, SEO-friendly apps with React 19 and Next.js — routing, server components, forms, and deployment.",
      featured: true,
    },
  ],
  Design: [
    {
      title: "UI/UX Design Essentials",
      description:
        "Research, wireframes, prototypes, and usability testing — design interfaces users actually enjoy.",
      featured: true,
    },
    {
      title: "Figma for Product Teams",
      description:
        "Master components, auto-layout, design systems, and handoff workflows for real product work.",
    },
    {
      title: "Visual Design with Typography & Color",
      description:
        "Hierarchy, grids, contrast, and brand-consistent palettes for web and mobile interfaces.",
    },
  ],
  Business: [
    {
      title: "Entrepreneurship Basics",
      description:
        "Validate ideas, model revenue, pitch investors, and launch a lean startup with measurable milestones.",
      featured: true,
    },
    {
      title: "Business Strategy & Planning",
      description:
        "SWOT, competitive analysis, OKRs, and execution plans for small teams and growing companies.",
    },
    {
      title: "Finance for Non-Finance Founders",
      description:
        "Read financial statements, manage cash flow, price products, and make data-informed decisions.",
    },
  ],
  Marketing: [
    {
      title: "Digital Marketing Fundamentals",
      description:
        "SEO basics, content marketing, email funnels, and analytics — grow an audience without wasted spend.",
      featured: true,
    },
    {
      title: "Social Media Marketing",
      description:
        "Platform strategy, content calendars, community management, and paid social campaign basics.",
    },
    {
      title: "Copywriting That Converts",
      description:
        "Headlines, landing pages, CTAs, and email sequences that turn visitors into customers.",
    },
  ],
  "Data Science": [
    {
      title: "Data Analysis with Python & Pandas",
      description:
        "Clean datasets, explore trends, and visualize insights with pandas, NumPy, and matplotlib.",
      featured: true,
    },
    {
      title: "SQL for Analytics",
      description:
        "Query relational databases, joins, aggregations, and reporting queries for business intelligence.",
    },
    {
      title: "Introduction to Machine Learning",
      description:
        "Supervised learning, train/test splits, regression, classification, and model evaluation basics.",
    },
  ],
  "Personal Development": [
    {
      title: "Productivity & Time Management",
      description:
        "Prioritization frameworks, deep work habits, and tools to finish projects without burnout.",
    },
    {
      title: "Public Speaking & Presentation Skills",
      description:
        "Structure talks, manage nerves, use slides effectively, and engage live or virtual audiences.",
      featured: true,
    },
    {
      title: "Career Planning & Interview Prep",
      description:
        "Résumés, portfolios, behavioral interviews, and negotiation for your next role.",
    },
  ],
  Academics: [
    {
      title: "Academic Writing & Research Methods",
      description:
        "Thesis structure, citations, literature reviews, and ethical research practices for students.",
    },
    {
      title: "Statistics for University Students",
      description:
        "Probability, distributions, hypothesis testing, and interpreting results in coursework and labs.",
      featured: true,
    },
    {
      title: "Critical Thinking & Study Skills",
      description:
        "Note-taking, exam preparation, argument analysis, and learning strategies that stick.",
    },
  ],
  Other: [
    {
      title: "Introduction to Cybersecurity",
      description:
        "Threat models, passwords, phishing awareness, and safe browsing for everyday digital life.",
    },
    {
      title: "Project Management Essentials",
      description:
        "Scopes, timelines, risk registers, and agile vs waterfall — deliver projects on time.",
    },
    {
      title: "Freelancing & Remote Work",
      description:
        "Find clients, write proposals, manage contracts, and build a sustainable solo practice.",
      featured: true,
    },
  ],
};

type SeedQuestion =
  | {
      question: string;
      type: "MCQ";
      options: string[];
      correctAnswer: string;
    }
  | {
      question: string;
      type: "TRUE_FALSE";
      correctAnswer: string;
    };

function defaultQuestions(courseTitle: string): SeedQuestion[] {
  return [
    {
      question: `${courseTitle} is designed to build practical, job-relevant skills.`,
      type: "TRUE_FALSE",
      correctAnswer: "true",
    },
    {
      question: `Which best describes the focus of "${courseTitle}"?`,
      type: "MCQ",
      options: [
        "Hands-on learning with assessments",
        "Memorization only, no practice",
        "Unrelated general trivia",
      ],
      correctAnswer: "Hands-on learning with assessments",
    },
    {
      question: "Passing course quizzes requires a score of at least 70%.",
      type: "TRUE_FALSE",
      correctAnswer: "true",
    },
  ];
}

const EXTRA_QUESTIONS_BY_SLUG: Record<string, SeedQuestion[]> = {
  "intro-to-web-development": [
    {
      question: "What does HTML stand for?",
      type: "MCQ",
      options: [
        "HyperText Markup Language",
        "High Tech Modern Language",
        "Home Tool Markup Language",
      ],
      correctAnswer: "HyperText Markup Language",
    },
    {
      question: "JavaScript runs only on servers.",
      type: "TRUE_FALSE",
      correctAnswer: "false",
    },
  ],
  "python-programming-fundamentals": [
    {
      question: "Python uses indentation to define code blocks.",
      type: "TRUE_FALSE",
      correctAnswer: "true",
    },
    {
      question: "Which keyword defines a function in Python?",
      type: "MCQ",
      options: ["def", "func", "function"],
      correctAnswer: "def",
    },
  ],
  "sql-for-analytics": [
    {
      question: "SQL is used to query and manage data in relational databases.",
      type: "TRUE_FALSE",
      correctAnswer: "true",
    },
    {
      question: "Which clause filters rows after grouping?",
      type: "MCQ",
      options: ["HAVING", "ORDER BY", "SELECT"],
      correctAnswer: "HAVING",
    },
  ],
};

async function seedQuiz(
  courseId: string,
  title: string,
  slug: string,
  quizTitle: string,
  questions: SeedQuestion[],
) {
  const existing = await prisma.quiz.findFirst({
    where: { courseId, title: quizTitle },
  });
  if (existing) return;

  const quiz = await prisma.quiz.create({
    data: {
      courseId,
      title: quizTitle,
      passingScore: 70,
      durationMin: 15,
    },
  });

  await prisma.question.createMany({
    data: questions.map((q, orderIndex) => ({
      quizId: quiz.id,
      question: q.question,
      type: q.type,
      options: q.type === "MCQ" ? q.options : undefined,
      correctAnswer: q.correctAnswer,
      orderIndex,
    })),
  });
}

async function seedCourseContent(courseId: string, courseTitle: string, slug: string) {
  const existingModule = await prisma.module.findFirst({ where: { courseId } });

  if (!existingModule) {
    const foundations = await prisma.module.create({
      data: { courseId, title: "Foundations", orderIndex: 0 },
    });
    const practice = await prisma.module.create({
      data: { courseId, title: "Practice & Projects", orderIndex: 1 },
    });

    await prisma.lesson.createMany({
      data: [
        {
          moduleId: foundations.id,
          title: `Welcome to ${courseTitle}`,
          content: `Overview of ${courseTitle}, how the course is structured, and what you will achieve by the end.`,
          orderIndex: 0,
          durationMin: 8,
        },
        {
          moduleId: foundations.id,
          title: "Core concepts",
          content: "Key terminology, principles, and the mental models you need before hands-on work.",
          orderIndex: 1,
          durationMin: 12,
        },
        {
          moduleId: practice.id,
          title: "Guided exercise",
          content: "Apply what you learned in a step-by-step exercise with instructor tips.",
          orderIndex: 0,
          durationMin: 15,
        },
        {
          moduleId: practice.id,
          title: "Mini project",
          content: "Complete a short project that mirrors real-world tasks in this subject area.",
          orderIndex: 1,
          durationMin: 20,
        },
      ],
    });
  }

  const topicQuestions = EXTRA_QUESTIONS_BY_SLUG[slug] ?? defaultQuestions(courseTitle).slice(0, 2);

  await seedQuiz(courseId, courseTitle, slug, "Module 1 Quiz", [
    ...topicQuestions,
    {
      question: "You should review lesson notes before attempting this quiz.",
      type: "TRUE_FALSE",
      correctAnswer: "true",
    },
  ]);

  await seedQuiz(courseId, courseTitle, slug, "Final Course Quiz", defaultQuestions(courseTitle));
}

async function main() {
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

  const categoryIds = new Map<string, string>();
  for (const name of COURSE_CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { slug: slugify(name) },
      update: { name },
      create: { name, slug: slugify(name) },
    });
    categoryIds.set(name, category.id);
  }

  let courseCount = 0;
  for (const categoryName of COURSE_CATEGORIES) {
    const categoryId = categoryIds.get(categoryName);
    const courses = COURSE_CATALOG[categoryName];

    for (const item of courses) {
      const slug = slugify(item.title);
      const course = await prisma.course.upsert({
        where: { slug },
        update: {
          title: item.title,
          description: item.description,
          status: "PUBLISHED",
          featured: item.featured ?? false,
          categoryId,
        },
        create: {
          instructorId: instructor.id,
          categoryId,
          title: item.title,
          slug,
          description: item.description,
          price: 0,
          status: "PUBLISHED",
          featured: item.featured ?? false,
        },
      });

      await seedCourseContent(course.id, item.title, slug);

      courseCount += 1;
    }
  }

  const quizCount = await prisma.quiz.count();
  const questionCount = await prisma.question.count();

  await prisma.systemSetting.upsert({
    where: { key: "platform_commission" },
    update: {},
    create: { key: "platform_commission", value: "0.4" },
  });

  console.log("Seed complete.");
  console.log(
    `Courses: ${courseCount} published across ${COURSE_CATEGORIES.length} categories (3+ each).`,
  );
  console.log(`Quizzes: ${quizCount} · Questions: ${questionCount} (2 quizzes per course).`);
  console.log(`Admin: ${admin.userCode ?? adminCode} / admin@bravio.app / Admin123!`);
  console.log(`Instructor: ${instructor.userCode ?? instructorCode} / instructor@bravio.app / Instructor123!`);
  console.log(`Student: ${studentCode} / student@bravio.app / Student123!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
