# Project Defence Preparation Guide

## Secure Web-Based E-Learning Marketplace

This guide gives ready answers for your defence. Practise speaking them in your own words. Do not claim features you did not build.

---

## 1. Understand Your Project Completely

### 30-second explanation (memorise this)

**SAY THIS:**

My project is a web-based e-learning marketplace developed to solve the problem of limited local payment support, weak content governance, and weak account security on many existing platforms. The system allows students to enrol and learn, instructors to create and sell approved courses, and administrators to manage users, content, payments, and audit records. It was developed using Next.js, React, TypeScript, PostgreSQL, Prisma, Auth.js, and Paystack, and aims to improve access, trust, and transparent revenue sharing.

### Know these facts

- **Title:** Design and Implementation of a Secure Web-Based E-Learning Marketplace
- **Why chosen:** Growing demand for online skills training in Ghana, plus gaps in local payment, content review, and security
- **Problem solved:** Combines local payment, role-based access, course approval, quizzes, and transparent earnings in one platform
- **Who benefits:** Students, instructors, administrators, and institutions seeking affordable digital-skills platforms
- **Why important:** Improves access, trust, and accountability for online learning and course sales
- **What makes it different:** Local payment (Paystack), enforced course approval, RBAC, audit logs, idempotent payments, auto-graded quizzes

---

## 2. Problem Domain Knowledge

### Problems in traditional / existing approaches

- Limited access to learning materials outside classrooms
- High cost of physical training and travel
- Difficulty tracking student progress
- Inflexible schedules
- Weak instructor–student interaction online
- Global platforms that assume international cards
- Open marketplaces with little pre-publication review
- Small local systems that skip payment security and audit trails

### Before this system

Problems were handled with manual processes, institutional LMS tools such as Moodle (closed to one institution), global marketplaces such as Udemy/Coursera (payment and access barriers), or student-built demos without robust payment and security.

### Problems with existing methods

- **Inefficient:** separate tools for content, payment, and tracking
- **Expensive or inaccessible** for local card / mobile-money users
- **Time-consuming** manual moderation or reconciliation
- **Difficult to manage** roles, trust, and payouts together

---

## 3. Aim and Objectives (memorise)

### Main Aim

**SAY THIS:**

To design and implement a secure, web-based e-learning marketplace that supports role-based course management, local online payment, automated assessment, and transparent revenue sharing.

### Specific Objectives

1. Design a role-based access model for students, instructors, and administrators.
2. Develop a course management and approval workflow before publication.
3. Implement secure authentication and account protection (hashing, rate limiting, audit trail).
4. Integrate local payment for free/paid enrolment with automatic revenue sharing.
5. Build automated timed quizzes, grading, and progress tracking.
6. Evaluate the system through unit, integration, and user testing.

---

## 4. Scope of the System

### Included

- Registration / login (email or user code, Google OAuth optional)
- Student, instructor, and admin dashboards
- Instructor application and approval
- Course modules, lessons (video/text/PDF), quizzes
- Admin course approval / publish / reject / hide
- Free and paid enrolment (Paystack)
- Progress tracking, reviews, messaging, notifications
- Earnings, withdrawals, commission settings, audit logs

### Excluded (say this clearly)

- Native mobile applications
- Live video classrooms / real-time teaching
- AI recommendations or AI content generation
- Own video streaming infrastructure (videos are embedded)
- Production-scale load testing / live-money volume proof

**Never claim features you did not build.**

---

## 5. Users and Roles

### Student

- **Who:** Learners seeking skills online
- **Can:** Register, browse catalogue, enrol (free/paid), learn, take quizzes, review, message
- **Cannot:** Access instructor tools or admin pages

### Instructor

- **Who:** Content creators (must apply and be approved)
- **Can:** Create courses/modules/lessons/quizzes, submit for review, view earnings, withdraw, message
- **Cannot:** Publish without admin approval

### Administrator

- **Who:** Platform governors
- **Can:** Approve instructors/courses, manage users, process withdrawals, announcements, analytics, audit logs, commission
- **Cannot:** Be overridden by student/instructor role checks

---

## 6. System Requirements

### Functional requirements (what it does)

- Authenticate and authorise users by role
- Create/update courses, modules, lessons, quizzes
- Approve/publish/reject/hide courses
- Enrol students; process payments and splits
- Track progress; auto-grade quizzes
- Record reviews, messages, notifications, audit events

### Non-functional requirements (quality)

- **Security:** bcrypt passwords, RBAC, rate limiting, signed quiz sessions
- **Reliability:** idempotent payment completion
- **Usability:** responsive web UI on mobile browsers
- **Maintainability:** typed schemas, shared services
- **Privacy:** presence visible only to related users

---

## 7. System Architecture

**SAY THIS:**

The system uses a three-tier architecture. The frontend is a React interface in the browser. The backend is a Next.js server with Server Actions, API routes, and middleware. The database is PostgreSQL accessed through Prisma. External services include Paystack, email, blob storage, and Google OAuth.

### Data flow

User → Frontend (pages/forms) → Middleware/role check → Server Action or API → Validation and domain services → PostgreSQL → Response back to the user. Secrets never leave the server.

**Q:** What technology did you use for the frontend, and why?

**A:** React with Next.js for component-based UI, server rendering, and one codebase for interface and server logic.

---

## 8. Technology Stack

| Technology | Role / Why |
|------------|------------|
| TypeScript | Catches many errors before runtime |
| Next.js 16 / React 19 | Full-stack web app (UI + server) |
| Tailwind CSS | Consistent, fast styling |
| PostgreSQL | Relational data and transactions for money |
| Prisma | Type-safe ORM and migrations |
| Auth.js (next-auth) | Credentials and Google sign-in |
| bcryptjs | Password hashing |
| Paystack | Local cards and mobile money |
| Zod | Input validation |
| Vercel | Hosting; managed PostgreSQL for data |

**Q:** Why not another technology?

**A:** Next.js let one developer cover frontend and backend. PostgreSQL was chosen because enrolment and payment must succeed or fail together. Paystack fits the local payment context better than card-only gateways.

---

## 9. Database Knowledge

**Database type:** Relational (PostgreSQL).

### Core tables (know these)

- **User:** id, name, email, passwordHash, role, status, userCode
- **InstructorProfile:** bio, expertise, status, balance
- **Course / Module / Lesson:** structured content
- **Enrollment / LessonProgress:** access and progress
- **Payment / EarningsLedger / Withdrawal:** money flow
- **Quiz / Question / QuizAttempt:** assessment
- **Review, Conversation/Message, Notification, Announcement, AuditLog**

### Relationships

- One instructor → many courses (one-to-many)
- One course → many modules → many lessons
- Many users ↔ many courses via Enrollment (many-to-many)
- One quiz → many questions; many attempts

### CRUD examples

- **Create:** register user, create course, create payment
- **Read:** catalogue, dashboards, analytics
- **Update:** progress, course status, password, balance
- **Delete:** soft-delete messages/reviews; hard-delete where allowed

---

## 10. System Design

### Use cases (actors and actions)

- **Student:** register/login, browse/enrol, learn, quiz, review, message
- **Instructor:** apply, create/submit course, manage quizzes, withdraw
- **Admin:** approve instructor/course, manage users, withdrawals, audit

### Activity: login

Enter credentials → validate → check ACTIVE status → create session/JWT → redirect to role dashboard.

### Activity: course approval

Draft → Pending → Approved → Published (or Rejected/Hidden).

### ER idea

User links to InstructorProfile, Courses, Enrollments, Payments, and QuizAttempts. Course links to Modules, Quizzes, and Reviews.

---

## 11. Development Methodology

**SAY THIS:**

I used an iterative Agile approach. Work was broken into increments: authentication, courses, enrolment and learning, payments, quizzes, then admin and messaging. Each increment was designed, built, tested, and refined.

- **Why Agile:** requirements evolved; Waterfall would have delayed feedback
- **Phases per increment:** Plan → Design → Build → Test → Refine
- Git version control; Prisma migrations kept schema and code aligned

---

## 12. Programming Knowledge

### Frontend

Pages under `app/`; reusable components; forms via server actions.

### Backend

Server Actions in `app/actions/`; API routes for webhooks/polling/files. Business logic in `lib/` and `lib/services/`.

### Authentication flow

User enters email/user code and password → loginSchema validates → bcrypt compare → ACTIVE check → JWT session → middleware enforces dashboard routes by role.

---

## 13. Security

**Q:** How is authentication done?

**A:** Login with credentials or Google OAuth; passwords stored as bcrypt hashes; sessions via Auth.js JWT refreshed from the database.

**Q:** How is authorisation done?

**A:** Role-based access: middleware blocks wrong dashboards; every sensitive action calls requireAuth/requireRole; course access uses hasCourseAccess.

### Other controls

- Rate limiting on login, messaging, and related actions
- Signed quiz session tokens (HMAC) to protect timing
- Paystack signature verification on webhooks
- Idempotent payment completion (no double credit)
- Audit log for sensitive actions

---

## 14. Testing

**SAY THIS:**

I verified the system with unit checks on grading, progress, and validation; integration checks on payment-to-enrolment and access rules; and user-acceptance walks through student, instructor, and admin journeys. Twenty-two mapped test cases passed.

### Example test cases

| Test | Expected | Result |
|------|----------|--------|
| Correct login | Role dashboard | Pass |
| Weak password | Rejected | Pass |
| Unreviewed course | Not in catalogue | Pass |
| Duplicate payment webhook | Credits once | Pass |
| Student opens admin URL | Redirected | Pass |
| Quiz after time limit | Rejected | Pass |

---

## 15. Challenges

- **Challenge:** New framework patterns and documentation. **Solution:** Read current docs and iterate.
- **Challenge:** Payment confirmation from both callback and webhook. **Solution:** Idempotent CompletePayment transaction.
- **Challenge:** Client-side quiz timer could be cheated. **Solution:** Server-signed attempt token and server time check.
- **Challenge:** Building alone in one academic year. **Solution:** Strict scope and incremental delivery.

---

## 16. Limitations

**Never say the system has no limitations.**

- Not load-tested at large concurrent scale
- Payments exercised mainly in test/sandbox mode
- No native mobile app (mobile browser only)
- No live classes or AI recommendation features
- Requires internet connectivity
- User-acceptance testing used a limited tester group

---

## 17. Future Improvements

- Live payment operation and reconciliation reporting
- Load and scale testing; database/hosting tuning
- Wider user study under real network conditions
- Richer assessments (short answer / coding)
- Offline/mobile resilience or dedicated mobile app
- Recommendation and richer learning analytics

---

## 18. Deployment Knowledge

**SAY THIS:**

The application is hosted on Vercel. The PostgreSQL database is managed separately and connected through environment variables. Code is pushed with Git, built by Vercel, and served as the live web app.

**Flow:** Code → Git repository → Vercel build (prisma generate + next build) → Live system + database connection.

---

## 19. Demo Preparation

### Exact demo flow (do not improvise)

1. Open public catalogue / course detail
2. Login as student → dashboard → lesson → quiz
3. Login as instructor → course editor / earnings
4. Login as admin → approval / audit log
5. Logout

### Backup if internet fails

- Screenshots in the PowerPoint
- Optional short recorded video
- Local/dev version if available

Sign into demo accounts before you enter the room. Keep tabs ready.

---

## 20. Common Examiner Questions

**Q:** Why did you choose this topic?

**A:** Because online skills learning is growing in Ghana, but local payment, content governance, and security often do not sit together in one accessible marketplace.

**Q:** What problem does your system solve?

**A:** It provides a secure multi-role marketplace with local payment, course approval before sale, automated assessment, and transparent instructor earnings.

**Q:** Why this technology / why not another?

**A:** Next.js covers UI and server logic for a small team; PostgreSQL supports money-safe transactions; Paystack supports local payment methods.

**Q:** Explain your database design.

**A:** It is relational. Users link to roles, courses, enrolments, and payments. Courses contain modules and lessons. Quizzes and attempts store assessment. Payments feed earnings and withdrawals.

**Q:** Explain your architecture.

**A:** Three tiers: browser frontend, Next.js application tier with middleware and server actions, PostgreSQL data tier, plus Paystack and other external services.

**Q:** How secure is your system?

**A:** bcrypt passwords, RBAC, rate limiting, signed quiz sessions, verified webhooks, idempotent payments, and audit logging.

**Q:** What challenges did you face?

**A:** Payment idempotency, quiz timer tampering, and scoping a full marketplace alone in one year.

**Q:** What is the limitation?

**A:** Sandbox payment testing, limited load testing, no native mobile app, and no live classrooms/AI features.

**Q:** How can it be improved?

**A:** Live payments, load testing, wider user study, richer assessments, offline/mobile support, analytics.

**Q:** How is it different from existing systems?

**A:** Unlike Udemy it emphasises local payment and pre-publication approval; unlike Coursera it stays open to independent instructors; unlike Moodle it is a marketplace with payments and payouts built in.

**Q:** How did you test it?

**A:** Unit, integration, and user-acceptance testing with 22 mapped cases covering auth, approval, payment, quizzes, and role boundaries.

**Q:** What if many users access it / can it scale?

**A:** It can scale with hosting and database capacity, but I did not prove high concurrency in this project. That is a stated limitation and future work.

**Q:** What if the database fails?

**A:** The app cannot serve dynamic data; recovery depends on managed-database backups and redeployment. Critical writes use transactions where money is involved.

**Q:** How did you collect requirements?

**A:** From the problem analysis, literature gaps, and iterative development with clear functional and non-functional requirements documented in Chapter Three.

---

## Final Defence Tips

- Arrive with the system already running and accounts signed in.
- Speak clearly; use the slides as prompts, not a script.
- If you do not know something, say what you do know and what you would check next.
- Never invent features. Point to what is in the report and demo.
- End by offering the live demonstration.
