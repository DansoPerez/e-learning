"""Create a printable project-defence preparation PDF."""

from pathlib import Path
from textwrap import wrap

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "Project Report" / "E_Learning_Platform_Defence_Preparation.pdf"

# Page geometry (A4, 72 dpi points)
W, H = 595, 842
LEFT, RIGHT = 48, 547
TOP, BOTTOM = 800, 52
LINE = 13


def esc(s: str) -> str:
    return s.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def text(font: str, size: int, x: float, y: float, value: str) -> str:
    return f"BT /{font} {size} Tf {x:.1f} {y:.1f} Td ({esc(value)}) Tj ET"


def wrap_lines(value: str, width: int) -> list[str]:
    out: list[str] = []
    for paragraph in value.split("\n"):
        if not paragraph.strip():
            out.append("")
            continue
        out.extend(wrap(paragraph, width) or [""])
    return out


class PdfBuilder:
    def __init__(self) -> None:
        self.pages: list[list[str]] = []
        self.cmds: list[str] = []
        self.y = TOP
        self._new_page()

    def _new_page(self) -> None:
        self.cmds = [
            "0.98 0.99 1 rg",
            f"0 0 {W} {H} re f",
            "0.04 0.12 0.24 rg",
            text("F2", 9, LEFT, H - 28, "SECURE E-LEARNING PLATFORM  |  DEFENCE PREPARATION GUIDE"),
            "0.035 0.39 0.85 rg",
            f"{LEFT} {H - 36} {RIGHT - LEFT} 1.2 re f",
        ]
        self.y = TOP

    def flush(self) -> None:
        self.cmds.extend(
            [
                "0.45 0.52 0.58 rg",
                text(
                    "F1",
                    8,
                    LEFT,
                    28,
                    "Rehearse aloud. Answer from understanding, not memorised scripts.",
                ),
            ]
        )
        self.pages.append(self.cmds)
        self.cmds = []

    def ensure(self, need: float) -> None:
        if self.y - need < BOTTOM:
            self.flush()
            self._new_page()

    def heading(self, title: str) -> None:
        self.ensure(48)
        self.y -= 8
        self.cmds.append("0.04 0.12 0.24 rg")
        self.cmds.append(text("F2", 14, LEFT, self.y, title))
        self.y -= 6
        self.cmds.append("0.035 0.39 0.85 rg")
        self.cmds.append(f"{LEFT} {self.y} {RIGHT - LEFT} 1 re f")
        self.y -= 18

    def subhead(self, title: str) -> None:
        self.ensure(28)
        self.cmds.append("0.035 0.39 0.85 rg")
        self.cmds.append(text("F2", 11, LEFT, self.y, title))
        self.y -= 16

    def body(self, value: str, width: int = 92) -> None:
        for line in wrap_lines(value, width):
            self.ensure(LINE + 2)
            self.cmds.append("0.12 0.15 0.19 rg")
            self.cmds.append(text("F1", 10, LEFT, self.y, line if line else " "))
            self.y -= LINE

    def bullet(self, value: str, width: int = 88) -> None:
        lines = wrap_lines(value, width)
        for i, line in enumerate(lines):
            self.ensure(LINE + 2)
            prefix = "- " if i == 0 else "  "
            self.cmds.append("0.12 0.15 0.19 rg")
            self.cmds.append(text("F1", 10, LEFT, self.y, prefix + line))
            self.y -= LINE

    def say(self, value: str, width: int = 86) -> None:
        self.ensure(24)
        self.cmds.append("0.20 0.45 0.20 rg")
        self.cmds.append(text("F2", 9, LEFT, self.y, "SAY THIS:"))
        self.y -= 14
        for line in wrap_lines(value, width):
            self.ensure(LINE + 2)
            self.cmds.append("0.10 0.18 0.12 rg")
            self.cmds.append(text("F1", 10, LEFT + 8, self.y, line))
            self.y -= LINE
        self.y -= 4

    def q(self, question: str, answer: str) -> None:
        self.ensure(40)
        self.cmds.append("0.55 0.30 0.10 rg")
        self.cmds.append(text("F2", 9, LEFT, self.y, "Q:"))
        for i, line in enumerate(wrap_lines(question, 88)):
            self.ensure(LINE + 2)
            self.cmds.append("0.55 0.30 0.10 rg")
            self.cmds.append(text("F1", 10, LEFT + 16 if i == 0 else LEFT + 16, self.y, line))
            self.y -= LINE
        self.cmds.append("0.10 0.28 0.50 rg")
        self.cmds.append(text("F2", 9, LEFT, self.y, "A:"))
        self.y -= 0
        for i, line in enumerate(wrap_lines(answer, 88)):
            self.ensure(LINE + 2)
            x = LEFT + 16
            self.cmds.append("0.12 0.15 0.19 rg")
            self.cmds.append(text("F1", 10, x, self.y, line))
            self.y -= LINE
        self.y -= 6


def build_content(b: PdfBuilder) -> None:
    # Cover-ish intro
    b.ensure(80)
    b.cmds.append("0.04 0.12 0.24 rg")
    b.cmds.append(text("F2", 20, LEFT, b.y, "Project Defence Preparation Guide"))
    b.y -= 24
    b.cmds.append("0.25 0.32 0.40 rg")
    b.cmds.append(
        text(
            "F1",
            11,
            LEFT,
            b.y,
            "Secure Web-Based E-Learning Marketplace",
        )
    )
    b.y -= 18
    b.body(
        "This guide gives ready answers for your defence. Practise speaking them "
        "in your own words. Do not claim features you did not build."
    )
    b.y -= 6

    # 1
    b.heading("1. Understand Your Project Completely")
    b.subhead("30-second explanation (memorise this)")
    b.say(
        "My project is a web-based e-learning marketplace developed to solve the "
        "problem of limited local payment support, weak content governance, and "
        "weak account security on many existing platforms. The system allows "
        "students to enrol and learn, instructors to create and sell approved "
        "courses, and administrators to manage users, content, payments, and "
        "audit records. It was developed using Next.js, React, TypeScript, "
        "PostgreSQL, Prisma, Auth.js, and Paystack, and aims to improve access, "
        "trust, and transparent revenue sharing."
    )
    b.subhead("Know these facts")
    b.bullet("Title: Design and Implementation of a Secure Web-Based E-Learning Marketplace")
    b.bullet("Why chosen: Growing demand for online skills training in Ghana, plus gaps in local payment, content review, and security.")
    b.bullet("Problem solved: Combines local payment, role-based access, course approval, quizzes, and transparent earnings in one platform.")
    b.bullet("Who benefits: Students, instructors, administrators, and institutions seeking affordable digital-skills platforms.")
    b.bullet("Why important: Improves access, trust, and accountability for online learning and course sales.")
    b.bullet("What makes it different: Local payment (Paystack), enforced course approval, RBAC, audit logs, idempotent payments, auto-graded quizzes.")

    # 2
    b.heading("2. Problem Domain Knowledge")
    b.subhead("Problems in traditional / existing approaches")
    b.bullet("Limited access to learning materials outside classrooms")
    b.bullet("High cost of physical training and travel")
    b.bullet("Difficulty tracking student progress")
    b.bullet("Inflexible schedules")
    b.bullet("Weak instructor-student interaction online")
    b.bullet("Global platforms that assume international cards")
    b.bullet("Open marketplaces with little pre-publication review")
    b.bullet("Small local systems that skip payment security and audit trails")
    b.subhead("Before this system")
    b.body(
        "Problems were handled with manual processes, institutional LMS tools "
        "such as Moodle (closed to one institution), global marketplaces such as "
        "Udemy/Coursera (payment and access barriers), or student-built demos "
        "without robust payment and security."
    )
    b.subhead("Problems with existing methods")
    b.bullet("Inefficient: separate tools for content, payment, and tracking")
    b.bullet("Expensive or inaccessible for local card / mobile-money users")
    b.bullet("Time-consuming manual moderation or reconciliation")
    b.bullet("Difficult to manage roles, trust, and payouts together")

    # 3
    b.heading("3. Aim and Objectives (memorise)")
    b.subhead("Main Aim")
    b.say(
        "To design and implement a secure, web-based e-learning marketplace that "
        "supports role-based course management, local online payment, automated "
        "assessment, and transparent revenue sharing."
    )
    b.subhead("Specific Objectives")
    b.bullet("1. Design a role-based access model for students, instructors, and administrators.")
    b.bullet("2. Develop a course management and approval workflow before publication.")
    b.bullet("3. Implement secure authentication and account protection (hashing, rate limiting, audit trail).")
    b.bullet("4. Integrate local payment for free/paid enrolment with automatic revenue sharing.")
    b.bullet("5. Build automated timed quizzes, grading, and progress tracking.")
    b.bullet("6. Evaluate the system through unit, integration, and user testing.")

    # 4
    b.heading("4. Scope of the System")
    b.subhead("Included")
    b.bullet("Registration / login (email or user code, Google OAuth optional)")
    b.bullet("Student, instructor, and admin dashboards")
    b.bullet("Instructor application and approval")
    b.bullet("Course modules, lessons (video/text/PDF), quizzes")
    b.bullet("Admin course approval / publish / reject / hide")
    b.bullet("Free and paid enrolment (Paystack)")
    b.bullet("Progress tracking, reviews, messaging, notifications")
    b.bullet("Earnings, withdrawals, commission settings, audit logs")
    b.subhead("Excluded (say this clearly)")
    b.bullet("Native mobile applications")
    b.bullet("Live video classrooms / real-time teaching")
    b.bullet("AI recommendations or AI content generation")
    b.bullet("Own video streaming infrastructure (videos are embedded)")
    b.bullet("Production-scale load testing / live-money volume proof")
    b.body("Never claim features you did not build.")

    # 5
    b.heading("5. Users and Roles")
    b.subhead("Student")
    b.bullet("Who: Learners seeking skills online")
    b.bullet("Can: Register, browse catalogue, enrol (free/paid), learn, take quizzes, review, message")
    b.bullet("Cannot: Access instructor tools or admin pages")
    b.subhead("Instructor")
    b.bullet("Who: Content creators (must apply and be approved)")
    b.bullet("Can: Create courses/modules/lessons/quizzes, submit for review, view earnings, withdraw, message")
    b.bullet("Cannot: Publish without admin approval")
    b.subhead("Administrator")
    b.bullet("Who: Platform governors")
    b.bullet("Can: Approve instructors/courses, manage users, process withdrawals, announcements, analytics, audit logs, commission")
    b.bullet("Cannot: Be overridden by student/instructor role checks")

    # 6
    b.heading("6. System Requirements")
    b.subhead("Functional requirements (what it does)")
    b.bullet("Authenticate and authorise users by role")
    b.bullet("Create/update courses, modules, lessons, quizzes")
    b.bullet("Approve/publish/reject/hide courses")
    b.bullet("Enrol students; process payments and splits")
    b.bullet("Track progress; auto-grade quizzes")
    b.bullet("Record reviews, messages, notifications, audit events")
    b.subhead("Non-functional requirements (quality)")
    b.bullet("Security: bcrypt passwords, RBAC, rate limiting, signed quiz sessions")
    b.bullet("Reliability: idempotent payment completion")
    b.bullet("Usability: responsive web UI on mobile browsers")
    b.bullet("Maintainability: typed schemas, shared services")
    b.bullet("Privacy: presence visible only to related users")

    # 7
    b.heading("7. System Architecture")
    b.say(
        "The system uses a three-tier architecture. The frontend is a React interface "
        "in the browser. The backend is a Next.js server with Server Actions, API "
        "routes, and middleware. The database is PostgreSQL accessed through Prisma. "
        "External services include Paystack, email, blob storage, and Google OAuth."
    )
    b.subhead("Data flow")
    b.body(
        "User -> Frontend (pages/forms) -> Middleware/role check -> Server Action "
        "or API -> Validation and domain services -> PostgreSQL -> Response back "
        "to the user. Secrets never leave the server."
    )
    b.q(
        "What technology did you use for the frontend, and why?",
        "React with Next.js for component-based UI, server rendering, and one codebase for interface and server logic.",
    )

    # 8
    b.heading("8. Technology Stack")
    b.bullet("TypeScript: catches many errors before runtime")
    b.bullet("Next.js 16 / React 19: full-stack web app (UI + server)")
    b.bullet("Tailwind CSS: consistent, fast styling")
    b.bullet("PostgreSQL: relational data and transactions for money")
    b.bullet("Prisma: type-safe ORM and migrations")
    b.bullet("Auth.js (next-auth): credentials and Google sign-in")
    b.bullet("bcryptjs: password hashing")
    b.bullet("Paystack: local cards and mobile money")
    b.bullet("Zod: input validation")
    b.bullet("Vercel: hosting; managed PostgreSQL for data")
    b.q(
        "Why not another technology?",
        "Next.js let one developer cover frontend and backend. PostgreSQL was chosen because enrolment and payment must succeed or fail together. Paystack fits the local payment context better than card-only gateways.",
    )

    # 9
    b.heading("9. Database Knowledge")
    b.body("Database type: Relational (PostgreSQL).")
    b.subhead("Core tables (know these)")
    b.bullet("User: id, name, email, passwordHash, role, status, userCode")
    b.bullet("InstructorProfile: bio, expertise, status, balance")
    b.bullet("Course / Module / Lesson: structured content")
    b.bullet("Enrollment / LessonProgress: access and progress")
    b.bullet("Payment / EarningsLedger / Withdrawal: money flow")
    b.bullet("Quiz / Question / QuizAttempt: assessment")
    b.bullet("Review, Conversation/Message, Notification, Announcement, AuditLog")
    b.subhead("Relationships")
    b.bullet("One instructor -> many courses (one-to-many)")
    b.bullet("One course -> many modules -> many lessons")
    b.bullet("Many users <-> many courses via Enrollment (many-to-many)")
    b.bullet("One quiz -> many questions; many attempts")
    b.subhead("CRUD examples")
    b.bullet("Create: register user, create course, create payment")
    b.bullet("Read: catalogue, dashboards, analytics")
    b.bullet("Update: progress, course status, password, balance")
    b.bullet("Delete: soft-delete messages/reviews; hard-delete where allowed")

    # 10
    b.heading("10. System Design")
    b.subhead("Use cases (actors and actions)")
    b.bullet("Student: register/login, browse/enrol, learn, quiz, review, message")
    b.bullet("Instructor: apply, create/submit course, manage quizzes, withdraw")
    b.bullet("Admin: approve instructor/course, manage users, withdrawals, audit")
    b.subhead("Activity: login")
    b.body("Enter credentials -> validate -> check ACTIVE status -> create session/JWT -> redirect to role dashboard.")
    b.subhead("Activity: course approval")
    b.body("Draft -> Pending -> Approved -> Published (or Rejected/Hidden).")
    b.subhead("ER idea")
    b.body(
        "User links to InstructorProfile, Courses, Enrollments, Payments, and "
        "QuizAttempts. Course links to Modules, Quizzes, and Reviews."
    )

    # 11
    b.heading("11. Development Methodology")
    b.say(
        "I used an iterative Agile approach. Work was broken into increments: "
        "authentication, courses, enrolment and learning, payments, quizzes, then "
        "admin and messaging. Each increment was designed, built, tested, and refined."
    )
    b.bullet("Why Agile: requirements evolved; Waterfall would have delayed feedback.")
    b.bullet("Phases per increment: Plan -> Design -> Build -> Test -> Refine")
    b.bullet("Git version control; Prisma migrations kept schema and code aligned")

    # 12
    b.heading("12. Programming Knowledge")
    b.subhead("Frontend")
    b.bullet("Pages under app/; reusable components; forms via server actions")
    b.subhead("Backend")
    b.bullet("Server Actions in app/actions/; API routes for webhooks/polling/files")
    b.bullet("Business logic in lib/ and lib/services/")
    b.subhead("Authentication flow")
    b.body(
        "User enters email/user code and password -> loginSchema validates -> "
        "bcrypt compare -> ACTIVE check -> JWT session -> middleware enforces "
        "dashboard routes by role."
    )

    # 13
    b.heading("13. Security")
    b.q("How is authentication done?", "Login with credentials or Google OAuth; passwords stored as bcrypt hashes; sessions via Auth.js JWT refreshed from the database.")
    b.q("How is authorisation done?", "Role-based access: middleware blocks wrong dashboards; every sensitive action calls requireAuth/requireRole; course access uses hasCourseAccess.")
    b.bullet("Rate limiting on login, messaging, and related actions")
    b.bullet("Signed quiz session tokens (HMAC) to protect timing")
    b.bullet("Paystack signature verification on webhooks")
    b.bullet("Idempotent payment completion (no double credit)")
    b.bullet("Audit log for sensitive actions")

    # 14
    b.heading("14. Testing")
    b.say(
        "I verified the system with unit checks on grading, progress, and "
        "validation; integration checks on payment-to-enrolment and access rules; "
        "and user-acceptance walks through student, instructor, and admin journeys. "
        "Twenty-two mapped test cases passed."
    )
    b.subhead("Example test cases")
    b.bullet("Correct login -> role dashboard | Pass")
    b.bullet("Weak password rejected | Pass")
    b.bullet("Unreviewed course not in catalogue | Pass")
    b.bullet("Duplicate payment webhook credits once | Pass")
    b.bullet("Student opens admin URL -> redirected | Pass")
    b.bullet("Quiz after time limit rejected | Pass")

    # 15
    b.heading("15. Challenges")
    b.bullet("Challenge: New framework patterns and documentation. Solution: Read current docs and iterate.")
    b.bullet("Challenge: Payment confirmation from both callback and webhook. Solution: Idempotent CompletePayment transaction.")
    b.bullet("Challenge: Client-side quiz timer could be cheated. Solution: Server-signed attempt token and server time check.")
    b.bullet("Challenge: Building alone in one academic year. Solution: Strict scope and incremental delivery.")

    # 16
    b.heading("16. Limitations")
    b.body("Never say the system has no limitations.")
    b.bullet("Not load-tested at large concurrent scale")
    b.bullet("Payments exercised mainly in test/sandbox mode")
    b.bullet("No native mobile app (mobile browser only)")
    b.bullet("No live classes or AI recommendation features")
    b.bullet("Requires internet connectivity")
    b.bullet("User-acceptance testing used a limited tester group")

    # 17
    b.heading("17. Future Improvements")
    b.bullet("Live payment operation and reconciliation reporting")
    b.bullet("Load and scale testing; database/hosting tuning")
    b.bullet("Wider user study under real network conditions")
    b.bullet("Richer assessments (short answer / coding)")
    b.bullet("Offline/mobile resilience or dedicated mobile app")
    b.bullet("Recommendation and richer learning analytics")

    # 18
    b.heading("18. Deployment Knowledge")
    b.say(
        "The application is hosted on Vercel. The PostgreSQL database is managed "
        "separately and connected through environment variables. Code is pushed "
        "with Git, built by Vercel, and served as the live web app."
    )
    b.body("Code -> Git repository -> Vercel build (prisma generate + next build) -> Live system + database connection.")

    # 19
    b.heading("19. Demo Preparation")
    b.subhead("Exact demo flow (do not improvise)")
    b.bullet("1. Open public catalogue / course detail")
    b.bullet("2. Login as student -> dashboard -> lesson -> quiz")
    b.bullet("3. Login as instructor -> course editor / earnings")
    b.bullet("4. Login as admin -> approval / audit log")
    b.bullet("5. Logout")
    b.subhead("Backup if internet fails")
    b.bullet("Screenshots in the PowerPoint")
    b.bullet("Optional short recorded video")
    b.bullet("Local/dev version if available")
    b.body("Sign into demo accounts before you enter the room. Keep tabs ready.")

    # 20
    b.heading("20. Common Examiner Questions")
    b.q("Why did you choose this topic?", "Because online skills learning is growing in Ghana, but local payment, content governance, and security often do not sit together in one accessible marketplace.")
    b.q("What problem does your system solve?", "It provides a secure multi-role marketplace with local payment, course approval before sale, automated assessment, and transparent instructor earnings.")
    b.q("Why this technology / why not another?", "Next.js covers UI and server logic for a small team; PostgreSQL supports money-safe transactions; Paystack supports local payment methods.")
    b.q("Explain your database design.", "It is relational. Users link to roles, courses, enrolments, and payments. Courses contain modules and lessons. Quizzes and attempts store assessment. Payments feed earnings and withdrawals.")
    b.q("Explain your architecture.", "Three tiers: browser frontend, Next.js application tier with middleware and server actions, PostgreSQL data tier, plus Paystack and other external services.")
    b.q("How secure is your system?", "bcrypt passwords, RBAC, rate limiting, signed quiz sessions, verified webhooks, idempotent payments, and audit logging.")
    b.q("What challenges did you face?", "Payment idempotency, quiz timer tampering, and scoping a full marketplace alone in one year.")
    b.q("What is the limitation?", "Sandbox payment testing, limited load testing, no native mobile app, and no live classrooms/AI features.")
    b.q("How can it be improved?", "Live payments, load testing, wider user study, richer assessments, offline/mobile support, analytics.")
    b.q("How is it different from existing systems?", "Unlike Udemy it emphasises local payment and pre-publication approval; unlike Coursera it stays open to independent instructors; unlike Moodle it is a marketplace with payments and payouts built in.")
    b.q("How did you test it?", "Unit, integration, and user-acceptance testing with 22 mapped cases covering auth, approval, payment, quizzes, and role boundaries.")
    b.q("What if many users access it / can it scale?", "It can scale with hosting and database capacity, but I did not prove high concurrency in this project. That is a stated limitation and future work.")
    b.q("What if the database fails?", "The app cannot serve dynamic data; recovery depends on managed-database backups and redeployment. Critical writes use transactions where money is involved.")
    b.q("How did you collect requirements?", "From the problem analysis, literature gaps, and iterative development with clear functional and non-functional requirements documented in Chapter Three.")

    b.y -= 8
    b.heading("Final Defence Tips")
    b.bullet("Arrive with the system already running and accounts signed in.")
    b.bullet("Speak clearly; use the slides as prompts, not a script.")
    b.bullet("If you do not know something, say what you do know and what you would check next.")
    b.bullet("Never invent features. Point to what is in the report and demo.")
    b.bullet("End by offering the live demonstration.")


def build_pdf(pages: list[list[str]]) -> bytes:
    objects: list[bytes] = []
    objects.append(b"<< /Type /Catalog /Pages 2 0 R >>")
    kids = " ".join(f"{4 + i * 2} 0 R" for i in range(len(pages)))
    objects.append(f"<< /Type /Pages /Kids [{kids}] /Count {len(pages)} >>".encode())
    objects.append(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    objects.append(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")

    for index, commands in enumerate(pages):
        stream = ("\n".join(commands) + "\n").encode("latin-1", errors="replace")
        page_id = 5 + index * 2
        objects.append(
            (
                f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {W} {H}] "
                f"/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> "
                f"/Contents {page_id} 0 R >>"
            ).encode()
        )
        objects.append(f"<< /Length {len(stream)} >>\nstream\n".encode() + stream + b"endstream")

    result = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = [0]
    for object_id, payload in enumerate(objects, start=1):
        offsets.append(len(result))
        result.extend(f"{object_id} 0 obj\n".encode())
        result.extend(payload)
        result.extend(b"\nendobj\n")
    xref = len(result)
    result.extend(f"xref\n0 {len(objects) + 1}\n".encode())
    result.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        result.extend(f"{offset:010d} 00000 n \n".encode())
    result.extend(
        (
            f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\n"
            f"startxref\n{xref}\n%%EOF\n"
        ).encode()
    )
    return bytes(result)


def main() -> None:
    builder = PdfBuilder()
    build_content(builder)
    builder.flush()
    OUTPUT.write_bytes(build_pdf(builder.pages))
    print(f"Created {OUTPUT} ({len(builder.pages)} pages)")


if __name__ == "__main__":
    main()
