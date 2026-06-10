# CHAPTER THREE

## PROPOSED SYSTEM DESIGN

### 3.0 Introduction

This chapter explains how the proposed e-learning marketplace was designed and built. It starts with the software development methodology, saying what was used, why it was chosen over the alternatives, and how it was applied. From there it sets out the requirements the system had to meet, both functional and non-functional, and the tools chosen to meet them. The rest of the chapter is design proper: the system architecture, the database, the way users interact with the platform, the core algorithms expressed as pseudocode, the plan for testing the system, and the ethical issues that came with handling people's data and money.

A short note on the diagrams. The figures in this chapter are presented in a renderable text form so they can be regenerated and inserted as images during final formatting. Each is labelled with a caption in line with the formatting guide.

### 3.1 Software Development Methodology

#### 3.1.1 What Methodology Was Used

The project followed an **iterative and incremental** approach drawn from Agile software development. Rather than specifying the whole system up front and building it in one long pass, the work was broken into small slices. Each slice delivered a working piece of the platform, was tested, and then fed into the next round of design. Authentication came first, then course creation, then enrollment and learning, then payments, then quizzes, and finally the admin and messaging layers.

#### 3.1.2 Why This Methodology

The obvious alternative was the Waterfall model, which marches in a straight line from requirements to design to implementation to testing. Waterfall works well when the requirements are fixed and fully understood before any code is written (Sommerville, 2016). That was not the case here. This was a one-person project on an evolving idea, where some requirements only became clear after a feature was in front of a user. For example, the need for a server-signed quiz session token did not appear in the first requirements list; it surfaced once it became obvious that a client-side timer could be tampered with.

Agile suited this reality better. Beck et al. (2001) argue that for small teams working on changing requirements, short feedback loops cut risk because mistakes show up early, while they are still cheap to fix. A heavyweight process such as the Rational Unified Process was also considered and rejected; its ceremony and documentation overhead would have swallowed time that a single developer did not have. The iterative model gave the discipline of regular, testable increments without the bureaucracy.

#### 3.1.3 How the Methodology Was Applied

Each increment moved through the same small cycle:

1. **Plan** — pick the next feature and write down what "done" means for it.
2. **Design** — sketch the data model changes, the server actions, and the screens.
3. **Build** — implement the feature end to end, from database to interface.
4. **Test** — exercise the feature manually and fix what broke.
5. **Refine** — fold lessons from this slice into the next one.

Git ran beneath the whole cycle, so every increment was just a set of commits that could be reviewed or rolled back if something went wrong. The database schema grew the same way, through Prisma migrations, which kept the data model and the code in step instead of drifting apart.

### 3.2 Requirements Analysis

#### 3.2.1 Functional Requirements

Functional requirements describe what the system must do. They are grouped here by the role they serve.

Table 3.1: Functional requirements of the proposed system

| ID | Requirement |
|----|-------------|
| FR-01 | Visitors can register as a student or apply as an instructor, and can sign in with email/user code and password or with a Google account. |
| FR-02 | The system shall verify credentials, enforce password rules, and lock out accounts that are suspended or banned. |
| FR-03 | Students can browse and search the catalogue of published courses and view course details before enrolling. |
| FR-04 | Students can enrol in free courses directly and in paid courses after a successful payment. |
| FR-05 | Enrolled students can study lessons (video, text, PDF), track their progress, and resume where they left off. |
| FR-06 | Students can attempt timed quizzes, receive an automatic score, and view their attempt history. |
| FR-07 | Students can rate and review courses, and message instructors and support. |
| FR-08 | Instructors can create courses with modules and lessons and submit them for administrative review. |
| FR-09 | Instructors can create quizzes and questions (multiple-choice and true/false). |
| FR-10 | Instructors can view earnings, request withdrawals, and reply to reviews and messages. |
| FR-11 | Administrators can approve, publish, reject, hide, or remove courses. |
| FR-12 | Administrators can approve or reject instructor applications and manage user accounts. |
| FR-13 | Administrators can set the platform commission, process withdrawals, post announcements, and view analytics. |
| FR-14 | The system shall record sensitive actions in an audit log. |

#### 3.2.2 Non-Functional Requirements

Non-functional requirements describe how well the system must behave.

Table 3.2: Non-functional requirements of the proposed system

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-01 | Security | Passwords shall be stored only as salted bcrypt hashes; sensitive routes shall be protected by role. |
| NFR-02 | Security | Login, registration, password reset, and messaging shall be rate-limited to resist abuse. |
| NFR-03 | Reliability | Payment confirmation shall be idempotent so that a repeated event never pays an instructor twice. |
| NFR-04 | Usability | The interface shall be responsive and work on mobile browsers without a separate app. |
| NFR-05 | Performance | Catalogue and dashboard pages shall load common views without noticeable delay under normal use. |
| NFR-06 | Maintainability | Business logic shall be centralised in reusable services and validated with typed schemas. |
| NFR-07 | Privacy | A user's online status shall be visible only to people with a legitimate relationship to them. |
| NFR-08 | Portability | The system shall run on free hosting and a managed PostgreSQL database. |

#### 3.2.3 User Requirements and User Stories

A few representative user stories capture the requirements from the user's point of view:

- As a **student**, I want to pay for a course with a method I already use, so that I can start learning without needing an international card.
- As a **student**, I want my quiz to be graded instantly, so that I know at once whether I passed.
- As an **instructor**, I want my course reviewed before it goes live, so that buyers trust what they are paying for.
- As an **instructor**, I want to see exactly what I have earned and withdraw it, so that I trust the platform with my work.
- As an **administrator**, I want a record of who did what, so that I can investigate disputes and abuse.

### 3.3 Tools and Technologies

The tools were chosen for three reasons that kept coming up: they are free or have a usable free tier, they are current and well-documented, and they let one developer cover both the front end and the back end.

Table 3.3: Tools and technologies used

| Layer | Technology | Justification |
|-------|------------|---------------|
| Language | TypeScript | Static typing catches a large class of errors before run time, which matters for a security-sensitive app. |
| Framework | Next.js 16 (App Router) | Combines server rendering, server actions, and API routes in one framework, so a small team can build front and back together. |
| UI library | React 19 | The most widely adopted UI library, with a large ecosystem and good documentation. |
| Styling | Tailwind CSS 4 | Utility-first styling keeps the interface consistent and quick to build. |
| Database | PostgreSQL | A relational database with transactions, which are essential when money is involved. |
| ORM | Prisma 6 | Type-safe database access and migrations that keep the schema and code in step. |
| Authentication | Auth.js (next-auth v5) | Battle-tested handling of credentials and OAuth, so authentication is not hand-rolled. |
| Payments | Paystack | Supports local cards and mobile money for the target market. |
| File storage | Vercel Blob / local | Stores lesson PDFs and instructor verification photos. |
| Email | Brevo | Sends one-time codes and password-reset links. |
| Hosting | Vercel | Free tier deployment that pairs naturally with Next.js. |
| Tools | VS Code, Git, Prisma Studio | Editor, version control, and database inspection. |

### 3.4 System Architecture

The system follows a **three-tier, client–server architecture**. The presentation tier is the user's browser, which renders pages and submits forms. The application tier is the Next.js server, which holds all the business logic: server components fetch data, server actions handle mutations, API routes handle webhooks and polling, and a middleware layer guards routes by role before a request ever reaches a page. The data tier is a PostgreSQL database, reached only through the Prisma ORM. Around these sit external services that the application tier talks to over HTTPS: Paystack for payments, Brevo for email, blob storage for files, and Google for OAuth sign-in.

The whole design hangs on one rule: keep every piece of business logic on the server, and let only the server touch the database and the secret keys. The browser never sees a database credential or an API key. That is what gives the access checks teeth. A student cannot reach an instructor action by fiddling with the page, because the action runs on the server, and the server checks who is calling before it does anything.

```
Render the following as Figure 3.1 (System Architecture):

flowchart TB
    subgraph Client[Presentation Tier - Browser]
      UI[Pages, Forms, React Components]
    end
    subgraph Server[Application Tier - Next.js Server]
      MW[Middleware: role-based route guard]
      SC[Server Components]
      SA[Server Actions]
      API[API Routes: webhook, polling, files]
      SVC[Domain Services and Validation]
    end
    subgraph Data[Data Tier]
      DB[(PostgreSQL via Prisma)]
    end
    EXT1[Paystack]
    EXT2[Brevo Email]
    EXT3[Blob Storage]
    EXT4[Google OAuth]

    UI -->|HTTPS request| MW --> SC
    UI -->|form submit| SA
    UI -->|fetch/poll| API
    SC --> SVC
    SA --> SVC
    API --> SVC
    SVC --> DB
    SA --> EXT1
    SA --> EXT2
    SA --> EXT3
    MW --> EXT4
```

Figure 3.1: System architecture of the proposed e-learning marketplace.

### 3.5 System Design

#### 3.5.1 Database Design

The data model is relational and normalised. At its centre is the **User**, which carries a role (student, instructor, or admin) and a status (active, suspended, or banned). An instructor has one **InstructorProfile** holding their application details and earnings balance. A **Course** belongs to an instructor and to an optional **Category**, and contains ordered **Modules**, each of which contains ordered **Lessons**. **Enrollment** links a user to a course and stores progress; **LessonProgress** records completion per lesson. **Payment** records each purchase and the split between instructor and platform, and feeds the **EarningsLedger** and **Withdrawal** records. **Quiz**, **Question**, and **QuizAttempt** carry assessment. **Review** and **ReviewReply**, **Conversation** and **Message**, **Notification**, **Announcement**, and **AuditLog** support the social, messaging, and governance features. Supporting tables (**EmailVerification**, **PasswordResetToken**, **RateLimitRecord**, **SystemSetting**) handle security and configuration.

A simplified entity-relationship diagram of the core entities is shown below.

```
Render the following as Figure 3.2 (Entity-Relationship Diagram):

erDiagram
    USER ||--o| INSTRUCTOR_PROFILE : has
    USER ||--o{ COURSE : teaches
    USER ||--o{ ENROLLMENT : enrols
    USER ||--o{ PAYMENT : makes
    USER ||--o{ QUIZ_ATTEMPT : attempts
    CATEGORY ||--o{ COURSE : groups
    COURSE ||--o{ MODULE : contains
    MODULE ||--o{ LESSON : contains
    COURSE ||--o{ ENROLLMENT : has
    COURSE ||--o{ PAYMENT : sold_via
    COURSE ||--o{ QUIZ : has
    QUIZ ||--o{ QUESTION : contains
    QUIZ ||--o{ QUIZ_ATTEMPT : graded_as
    COURSE ||--o{ REVIEW : receives
    ENROLLMENT ||--o{ LESSON_PROGRESS : tracks
```

Figure 3.2: Entity-relationship diagram of the core entities.

#### 3.5.2 Use Case Diagram

Three actors use the system. A **student** registers, browses and enrols in courses, learns, takes quizzes, reviews courses, and sends messages. An **instructor** does everything a student can, and also applies for approval, creates and submits courses and quizzes, views earnings, and requests withdrawals. An **administrator** governs the platform: approving instructors and courses, managing users, setting commission, processing withdrawals, posting announcements, and reading the audit log.

```
Render the following as Figure 3.3 (Use Case Diagram):

flowchart LR
    Student((Student))
    Instructor((Instructor))
    Admin((Administrator))

    Student --- UC1[Register / Login]
    Student --- UC2[Browse & Enrol]
    Student --- UC3[Learn & Track Progress]
    Student --- UC4[Take Quiz]
    Student --- UC5[Review & Message]

    Instructor --- UC1
    Instructor --- UC6[Apply for Approval]
    Instructor --- UC7[Create / Submit Course]
    Instructor --- UC8[Manage Quizzes]
    Instructor --- UC9[View Earnings / Withdraw]

    Admin --- UC10[Approve Instructor / Course]
    Admin --- UC11[Manage Users]
    Admin --- UC12[Set Commission / Process Withdrawals]
    Admin --- UC13[Announcements / Audit Log]
```

Figure 3.3: Use case diagram of the proposed system.

#### 3.5.3 Activity Diagram: Course Approval Workflow

The course lifecycle is the platform's main governance gate. An instructor creates a course in **DRAFT** and works on it freely. When ready, they submit it, moving it to **PENDING**. An administrator reviews it and either rejects it with a reason (**REJECTED**, which the instructor can address and resubmit) or approves it (**APPROVED**). An approved course is then published (**PUBLISHED**) and becomes visible and purchasable. A published course can later be hidden (**HIDDEN**) without destroying the access of students already enrolled.

```
Render the following as Figure 3.4 (Activity Diagram - Course Approval):

flowchart TD
    A[Instructor creates course - DRAFT] --> B[Add modules, lessons, quizzes]
    B --> C{Submit for review?}
    C -- No --> B
    C -- Yes --> D[Status: PENDING]
    D --> E{Admin decision}
    E -- Reject --> F[Status: REJECTED + reason]
    F --> B
    E -- Approve --> G[Status: APPROVED]
    G --> H[Admin publishes]
    H --> I[Status: PUBLISHED - visible & purchasable]
    I --> J{Hide?}
    J -- Yes --> K[Status: HIDDEN - enrolled keep access]
    K --> I
```

Figure 3.4: Activity diagram of the course approval workflow.

#### 3.5.4 Sequence Diagram: Paid Enrolment and Payment

When a student enrols in a paid course, the system creates a pending payment, sends the student to Paystack to pay, and only grants access once payment is confirmed. Confirmation can arrive two ways, through the browser callback and through a server-to-server webhook, and the design treats both as the same idempotent operation so that access is granted exactly once.

```
Render the following as Figure 3.5 (Sequence Diagram - Paid Enrolment):

sequenceDiagram
    actor Student
    participant App as Next.js Server
    participant DB as PostgreSQL
    participant PS as Paystack

    Student->>App: Enrol in paid course
    App->>DB: Create Payment (PENDING), compute split
    App->>PS: Initialize transaction
    PS-->>App: authorization_url
    App-->>Student: Redirect to Paystack
    Student->>PS: Complete payment
    PS-->>App: Callback / Webhook (reference)
    App->>PS: Verify transaction (server-side)
    App->>DB: Mark Payment SUCCESS (only if PENDING)
    App->>DB: Create Enrollment + credit instructor
    App-->>Student: Redirect to course player
```

Figure 3.5: Sequence diagram of the paid enrolment and payment flow.

### 3.6 Algorithm Descriptions

This section sets out the logic behind the parts of the system where correctness matters most. The algorithms are given as pseudocode.

#### 3.6.1 Automatic Quiz Grading

When a student submits a quiz, the server re-checks access, verifies that the attempt token is genuine and within the time limit, then compares each answer against the stored key and computes a percentage.

```
ALGORITHM GradeQuizAttempt(quizId, answers, token, user)
  quiz <- load quiz with questions
  IF NOT hasCourseAccess(user, quiz.course) THEN return AccessDenied
  IF NOT quiz.isEnabled THEN return Disabled
  startedAt <- verifyToken(token, user, quizId)
  IF startedAt is invalid THEN return InvalidSession
  IF quiz.durationMin > 0 AND elapsed(startedAt) > limit + grace THEN
     return TimeExceeded
  correct <- 0
  FOR each question q in quiz.questions DO
     IF normalize(answers[q.id]) == normalize(q.correctAnswer) THEN
        correct <- correct + 1
  score <- round(correct / count(questions) * 100)
  passed <- score >= quiz.passingScore
  save QuizAttempt(user, quiz, score, passed, answers, startedAt, now)
  updateCourseProgress(user, quiz.course)
  return (score, passed)
```

#### 3.6.2 Idempotent Payment Completion

Payment completion runs inside a database transaction. The flip from PENDING to SUCCESS uses a conditional update, so if two confirmations race, only the first does any work.

```
ALGORITHM CompletePayment(reference)
  payment <- load by reference
  IF payment.status == SUCCESS THEN return        // already done
  BEGIN TRANSACTION
     updated <- UPDATE payment SET status=SUCCESS
                WHERE id = payment.id AND status = PENDING
     IF updated.count == 0 THEN return             // a duplicate event
     UPSERT enrollment(payment.user, payment.course)
     IF instructor is APPROVED AND not earningsFrozen THEN
        instructor.balance <- instructor.balance + payment.instructorShare
        INSERT EarningsLedger(SALE, instructorShare)
  COMMIT
```

#### 3.6.3 Course Progress Calculation

Progress counts both lessons and required quizzes as units of work, and completion means every unit is done.

```
ALGORITHM CalculateProgress(user, course)
  lessons <- all lessons in course
  quizzes <- enabled quizzes in course that have >= 1 question
  total <- count(lessons) + count(quizzes)
  IF total == 0 THEN return 0%
  doneLessons <- count(completed LessonProgress for user in lessons)
  donePassed  <- count(distinct quizzes user has passed)
  percent <- min(100, round((doneLessons + donePassed) / total * 100))
  return percent
```

#### 3.6.4 Fixed-Window Rate Limiting

To resist brute-force and spam, sensitive actions are throttled with a fixed-window counter held in the database, which works even across multiple server instances.

```
ALGORITHM CheckRateLimit(key, maxAttempts, windowMs)
  record <- load by key
  IF record is null OR record.resetAt <= now THEN
     upsert record { count: 1, resetAt: now + windowMs }
     return Allowed
  IF record.count >= maxAttempts THEN
     return Blocked(retryAfter = record.resetAt - now)
  record.count <- record.count + 1
  return Allowed
```

### 3.7 Validation and Testing Plan

Testing was planned at three levels. **Unit testing** targeted the pure logic pieces in isolation, things such as the grading calculation, the progress calculation, the revenue-split arithmetic, and the input validation schemas. **Integration testing** checked that pieces worked together against a real database, for example that a confirmed payment really did create an enrollment and credit the right instructor, and that a hidden course still let an already-enrolled student in. **User (acceptance) testing** put the running system in front of testers using the three demo accounts, walking through the real journeys, registering, enrolling, learning, taking a quiz, paying, reviewing, and the admin approval path, to confirm the system met its requirements and was usable. Input validation was checked throughout by feeding the forms bad data and confirming the system rejected it with a clear message rather than failing. The detailed test cases and their results are reported in Chapter Four.

### 3.8 Ethical Considerations

Because the platform handles personal data and money, several ethical issues were taken seriously in the design.

**Data privacy.** Only the data needed to run the service is collected: name, email, a hashed password, and, for instructors, their stated qualifications and a verification photo. Passwords are never stored in readable form. A user's online presence is shielded so that it is visible only to people with a real connection to them, such as a conversation partner or an instructor whose course they are enrolled in, rather than to anyone who asks.

**Consent.** Instructors choose to submit their details and verification photo as part of applying, and the role they are signing up for is made plain at registration. Payments are only ever started by a deliberate action from the user.

**Security.** The controls described above, password hashing, role-based access, rate limiting, signed quiz sessions, idempotent payments, and a full audit trail, exist to protect users from each other and from outsiders. The audit log in particular means that sensitive actions can be traced, which both deters abuse and supports the fair resolution of disputes.
