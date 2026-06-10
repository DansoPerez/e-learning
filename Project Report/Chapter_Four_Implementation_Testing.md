# CHAPTER FOUR

## SYSTEM IMPLEMENTATION AND TESTING

### 4.0 Introduction

This chapter shows how the design from Chapter Three turned into a working system, and how that system was checked. It starts with the environment and tools used to build it, then walks through how the code is organised, the main interfaces a user sees, and the key modules behind them. The second half deals with testing: the plan, the test cases, the results, and an overall evaluation of how well the finished system met its objectives.

A note on the figures. The interface figures referred to below are screenshots of the running system and are to be inserted during final formatting; each carries a caption beneath it, as the formatting guide requires.

### 4.1 Development Environment

The system was developed and tested in the environment summarised below.

Table 4.1: Development environment

| Item | Detail |
|------|--------|
| Operating system | Windows 10 / 11 |
| Editor | Visual Studio Code |
| Runtime | Node.js 20 |
| Language | TypeScript 5 |
| Framework | Next.js 16, React 19 |
| Database | PostgreSQL (managed, Supabase-compatible) |
| ORM and tooling | Prisma 6, Prisma Studio |
| Version control | Git |
| Payment sandbox | Paystack test mode |
| Browser | Chrome / Edge (desktop and mobile view) |

The application runs as a single Next.js project. During development it was served locally with the development server; for deployment it targets Vercel, with the database hosted separately and connected through an environment variable.

### 4.2 Structure of the Source Package

The codebase is organised by responsibility rather than by feature alone, so that logic is reused instead of repeated. The main folders are described below.

Table 4.2: Major folders and their responsibilities

| Folder | Contents and role |
|--------|-------------------|
| `app/` | Routes and pages (App Router). Holds server components for reading data and the page tree for public, auth, learning, and dashboard areas. |
| `app/actions/` | Server actions, the mutation layer. Thirteen files group actions by domain (auth, courses, quiz, payments via services, reviews, messages, admin, and so on). |
| `app/api/` | HTTP route handlers for things that need raw HTTP: the Paystack webhook, presence heartbeats, message polling, and PDF/file serving. |
| `lib/` | Domain logic and helpers: authentication guards, validations, rate limiting, notifications, presence, analytics, and small utilities. |
| `lib/services/` | Cross-cutting transactional flows that several actions share, chiefly enrolment and payment. |
| `lib/validations/` | Typed input schemas (Zod) for every form, kept separate so the same rules apply wherever data enters. |
| `components/` | Reusable React interface pieces, grouped by area (layout, forms, courses, learn, quiz, messages, admin, and so on). |
| `prisma/` | The database schema, migrations, and the seed script that creates demo accounts and sample courses. |
| `middleware.ts` | The route guard that runs before pages and enforces role-based access. |

How the folders depend on one another follows a clear direction. Pages and actions depend on `lib/` and `lib/services/`; services depend on the Prisma client and on validations; nothing in `lib/` depends on a page. This one-way flow keeps the business rules in one place and out of the interface, which is what allows the same rule, for example "does this user have access to this course," to be enforced identically whether the request came from a page, an action, or an API route.

### 4.3 System Interfaces

This section presents the main interfaces of the system and what each is for. Screenshots are inserted as figures.

#### 4.3.1 Public and Authentication Interfaces

The **landing page** introduces the platform and links to the catalogue and to sign-in. The **course catalogue** lists published courses with search, and each course has a **detail page** showing its description, curriculum outline, price, reviews, and an enrol button. The **registration** screen lets a visitor sign up as a student or apply as an instructor, and the **login** screen accepts either an email or a user code together with a password, or a Google account. **Forgot-password** and **reset-password** screens handle account recovery.

Figure 4.1: Landing page of the platform. [Insert screenshot]

Figure 4.2: Course catalogue with search. [Insert screenshot]

Figure 4.3: Registration screen (student / instructor). [Insert screenshot]

Figure 4.4: Login screen. [Insert screenshot]

#### 4.3.2 Student Interfaces

The **student dashboard** shows enrolled courses, a continue-learning shortcut, and announcements. The **learning player** presents a lesson's video, text, or PDF alongside the course outline, marks lessons complete, and remembers where the student stopped. The **quiz screen** presents questions one set at a time, runs the timer, and shows the score on submission. Students also have **messages** and a **profile** screen.

Figure 4.5: Student dashboard. [Insert screenshot]

Figure 4.6: Lesson player with progress tracking. [Insert screenshot]

Figure 4.7: Quiz attempt and automatic result. [Insert screenshot]

#### 4.3.3 Instructor Interfaces

Depending on approval state, an instructor sees either the **application** screen, a **pending** notice, or the full dashboard. The full dashboard includes a **course editor** for building modules, lessons, and quizzes; an **analytics** view of enrolments and earnings; a **withdrawals** screen; and **messages**.

Figure 4.8: Instructor application form. [Insert screenshot]

Figure 4.9: Course editor (modules, lessons, quizzes). [Insert screenshot]

Figure 4.10: Instructor earnings and withdrawal screen. [Insert screenshot]

#### 4.3.4 Administrator Interfaces

The **admin command centre** surfaces platform statistics and quick links. Dedicated screens manage **users**, **instructor applications**, **courses** (approve, publish, reject, hide), **reviews**, **quizzes**, **announcements**, **withdrawals**, **settings** (the commission), **analytics**, and the **audit log**.

Figure 4.11: Admin command centre. [Insert screenshot]

Figure 4.12: Course moderation screen (approve / publish / reject). [Insert screenshot]

Figure 4.13: Audit log. [Insert screenshot]

### 4.4 Explanation of Major Code Modules

**Authentication module.** This is built on Auth.js with a JWT session strategy, and it accepts both a credentials provider and Google sign-in. On each request the session is refreshed against the database, so if someone's role changes or their account is suspended, it bites immediately rather than at the next login. Passwords are hashed with bcrypt at a cost factor of 12. The module leans on `middleware.ts`, which quietly turns users away from areas their role has no business entering.

**Course and content module.** Server actions in `courses.ts` create and edit courses, modules, and lessons, with all input passed through Zod schemas first. Lessons accept video (parsed from YouTube, Vimeo, or a direct file link), text, or an uploaded PDF, the latter stored outside the database and served only after an access check. Submitting a course moves it into the review queue.

**Enrolment and access module.** The single function `hasCourseAccess` is the gatekeeper for every protected resource. It resolves, in order, admin override, course ownership, complimentary all-access, an existing enrolment on a free or paid-and-settled course, and finally the normal published-course rules. Centralising this means access can never be granted by one screen but forgotten by another.

**Payment module.** The payment service computes the instructor/platform split, opens a Paystack transaction, and, on confirmation, runs the idempotent completion described in Chapter Three. Both the browser callback and the server webhook funnel into the same completion routine, and the webhook itself is authenticated by verifying Paystack's signature before anything is trusted.

**Assessment module.** Quiz creation and grading live in `quiz.ts`, supported by a signed session token that binds an attempt to a user, a quiz, and a start time. Grading is automatic for multiple-choice and true/false questions, and a pass updates the student's course progress.

**Governance modules.** Admin actions, audit logging, notifications, announcements, messaging with presence, and analytics round out the system, each guarded by the appropriate role or admin tier.

### 4.5 Testing of the Implemented System

#### 4.5.1 Test Plan

Testing followed the three-level plan set out in Chapter Three: unit tests on isolated logic, integration tests against a real database, and user-acceptance tests on the running system using the three demo roles. Each requirement from Section 3.2 was mapped to at least one test. The goal was twofold: confirm the system does what it should (functional correctness) and confirm it refuses what it should (validation and security).

#### 4.5.2 Test Cases and Results

The principal test cases and their outcomes are shown below.

Table 4.3: Functional test cases and results

| TC | Test case | Input / action | Expected result | Status |
|----|-----------|----------------|-----------------|--------|
| TC-01 | Student registration | Valid details | Account created, user code issued, signed in | Pass |
| TC-02 | Weak password rejected | Password "12345" | Rejected with validation message | Pass |
| TC-03 | Login with user code | Valid code + password | Signed in and routed to dashboard | Pass |
| TC-04 | Suspended account login | Suspended user | Login blocked | Pass |
| TC-05 | Instructor application | Valid bio, photo | Application set to PENDING; admins notified | Pass |
| TC-06 | Admin approves instructor | Approve action | Status APPROVED; instructor gains tools | Pass |
| TC-07 | Create and submit course | Course + modules | Status moves DRAFT → PENDING | Pass |
| TC-08 | Admin approves & publishes | Approve, publish | Status PUBLISHED; course visible | Pass |
| TC-09 | Unreviewed course hidden | DRAFT/PENDING course | Not shown in public catalogue | Pass |
| TC-10 | Free enrolment | Enrol in free course | Enrolment created; learning unlocked | Pass |
| TC-11 | Paid enrolment | Pay via Paystack (test) | Payment SUCCESS; enrolment + instructor credited | Pass |
| TC-12 | Duplicate payment event | Webhook fired twice | Instructor credited once only | Pass |
| TC-13 | Quiz auto-grading | Submit answers | Correct percentage and pass/fail returned | Pass |
| TC-14 | Quiz time limit | Submit after limit | Late submission rejected | Pass |
| TC-15 | Tampered quiz token | Forged attempt token | Attempt rejected | Pass |
| TC-16 | Progress tracking | Complete lessons + quiz | Progress percent updates; course marked complete | Pass |
| TC-17 | Withdrawal request | Amount within balance | Balance reduced; withdrawal PENDING | Pass |
| TC-18 | Over-withdrawal blocked | Amount > balance | Request rejected | Pass |
| TC-19 | Role boundary | Student opens admin URL | Redirected away | Pass |
| TC-20 | Rate limit | Repeated failed logins | Further attempts throttled | Pass |
| TC-21 | Review once per course | Second review by same user | Existing review updated, not duplicated | Pass |
| TC-22 | Audit trail | Sensitive admin action | Entry recorded in audit log | Pass |

All listed cases passed. Defects found during development, most notably an early version where a client-side quiz timer could be bypassed and a race condition that could have credited an instructor twice, were fixed by introducing the signed session token and the idempotent payment transaction respectively, and the corresponding cases (TC-12, TC-14, TC-15) then passed.

#### 4.5.3 System Performance Results

Performance was assessed informally under normal single-user and small multi-user conditions, since the project ran on free-tier infrastructure rather than a production cluster. Common pages, the catalogue, course details, the dashboards, and the lesson player, loaded quickly, and server actions returned without noticeable delay. Server-side rendering meant pages arrived ready to read rather than blank-then-filled. Heavy-load and high-concurrency behaviour was not measured and is noted as a limitation in Chapter Five.

### 4.6 Evaluation of the System

Measured against the objectives in Chapter One, the implemented system performed well. The role-based access model cleanly separated the three roles and held up when deliberately probed (TC-19). The course approval workflow kept unreviewed content away from buyers (TC-07 to TC-09). The security controls, hashed passwords, rate limiting, signed quiz sessions, idempotent payments, and the audit trail, all behaved as designed (TC-02, TC-12, TC-15, TC-20, TC-22). Local payment, automated grading, and transparent revenue sharing each worked end to end in the test environment (TC-11, TC-13, TC-17). The main shortfall was the lack of large-scale load testing, which the budget and timeframe did not allow. On the whole, the system met its functional and security requirements and stood up to the journeys real users would take.
