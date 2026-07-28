"""Create a printable speaker-notes PDF without Office automation."""

from pathlib import Path
from textwrap import wrap


ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "Project Report" / "E_Learning_Platform_Speaker_Notes.pdf"

NOTES = [
    (
        1,
        "Title",
        "Introduce yourself, your programme, and the project title. In one sentence, describe the work as a secure web-based e-learning marketplace that connects students, instructors, and administrators.",
        "I will start by explaining the problem that motivated the system.",
    ),
    (
        2,
        "Background and Problem",
        "Present the three connected gaps: local payment is not always accessible, open platforms can have weak content governance, and weak security reduces trust. Keep the focus on the Ghanaian context rather than attacking other platforms.",
        "These gaps shaped the aim and objectives of the project.",
    ),
    (
        3,
        "Aim and Objectives",
        "Read the aim once, then summarise the objectives. Emphasise that the project covers the full marketplace journey: roles, courses, payment, learning, assessment, and administration.",
        "The next slide shows how the proposed solution is organised.",
    ),
    (
        4,
        "Proposed Solution",
        "Introduce the three roles. A student learns, an instructor creates approved content, and an administrator governs the platform. Stress that permissions are enforced on the server, not simply hidden in the interface.",
        "This is the architecture that supports those roles.",
    ),
    (
        5,
        "System Architecture",
        "Walk from left to right: browser, Next.js application, PostgreSQL database, then external services. The important security point is that database credentials and service secrets remain on the server.",
        "Two workflows are especially important for trust: course approval and payment.",
    ),
    (
        6,
        "Key Workflows",
        "Explain that an instructor cannot publish immediately: a course moves from draft through review and approval before publication. For payment, explain idempotency plainly: callback and webhook events may both arrive, but the sale is credited only once.",
        "Those workflows rely on the following controls.",
    ),
    (
        7,
        "Security and Reliability Controls",
        "Do not read every card. Explain two examples in detail: role checks stop a student from reaching administrator functions, and idempotent payment handling stops duplicate credits. Mention bcrypt, rate limiting, signed quiz sessions, and audit logging as supporting controls.",
        "I will now show the main user-facing parts of the system.",
    ),
    (
        8,
        "Public and Authentication Experience",
        "Use the screenshots briefly. Point out the responsive mobile layout, course search and filtering, and sign-in by either generated user ID or email. The registration flow enforces password rules before an account is created.",
        "After enrolment, the learner moves into the course and assessment experience.",
    ),
    (
        9,
        "Student Learning Experience",
        "Describe the learning flow: enrol, open a course, complete lessons, take required quizzes, and see progress update. The quiz score is calculated on the server and a passed quiz contributes to course completion.",
        "The instructor side controls how this learning content is created.",
    ),
    (
        10,
        "Instructor Experience",
        "An instructor first applies and is reviewed. Once approved, the instructor can build modules and lessons, manage quizzes, see earnings, and request a withdrawal. They still cannot publish a course without administrative approval.",
        "Administration provides the governance behind that workflow.",
    ),
    (
        11,
        "Administration and Accountability",
        "Explain that the administrator manages users, instructor applications, course decisions, withdrawals, announcements, and settings. The audit log records sensitive actions so that disputes or misuse can be traced.",
        "The system was then checked through structured testing.",
    ),
    (
        12,
        "Testing and Evaluation",
        "State the three testing levels: unit, integration, and user acceptance. Say that all 22 mapped cases passed. Use only two examples: a duplicate payment event did not credit an instructor twice, and a student was blocked from an admin route.",
        "The findings are positive, but the project also has clear limitations.",
    ),
    (
        13,
        "Findings, Limitations, and Future Work",
        "Conclude that the system met its scoped objectives. Be honest: payments were tested in sandbox mode and large-scale load testing was not carried out. The next steps are live payment operation, load testing, a wider user study, offline support, and richer assessment.",
        "Thank you. I am ready to answer questions and demonstrate the system.",
    ),
    (
        14,
        "Questions and Live Demonstration",
        "Thank the panel. Offer the live demo in this order: public catalogue, student learning and quiz attempt, instructor course management, then administrator approval and audit log.",
        "Keep the backup screenshots open in case the internet connection fails.",
    ),
]


def esc(value: str) -> str:
    return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def text(font: str, size: int, x: int, y: int, value: str) -> str:
    return f"BT /{font} {size} Tf {x} {y} Td ({esc(value)}) Tj ET"


def lines(value: str, width: int = 86) -> list[str]:
    return [line for paragraph in value.splitlines() for line in wrap(paragraph, width) or [""]]


def note_block(slide: int, title: str, talk: str, transition: str, top: int) -> list[str]:
    commands = [
        "0.035 0.39 0.85 rg",
        f"50 {top - 8} 495 1 re f",
        "0.10 0.14 0.19 rg",
        text("F2", 15, 50, top - 34, f"Slide {slide}: {title}"),
    ]
    y = top - 58
    commands.append("0.30 0.36 0.42 rg")
    commands.append(text("F2", 9, 50, y, "WHAT TO SAY"))
    y -= 16
    commands.append("0.12 0.15 0.19 rg")
    for line in lines(talk):
        commands.append(text("F1", 10, 50, y, line))
        y -= 14
    y -= 4
    commands.append("0.30 0.36 0.42 rg")
    commands.append(text("F2", 9, 50, y, "TRANSITION"))
    y -= 16
    commands.append("0.12 0.15 0.19 rg")
    for line in lines(transition):
        commands.append(text("F1", 10, 50, y, line))
        y -= 14
    return commands


def make_pages() -> list[bytes]:
    pages: list[bytes] = []
    first = [
        "0.04 0.12 0.24 rg",
        "0 0 595 842 re f",
        "0.90 0.95 1 rg",
        text("F2", 25, 52, 730, "E-Learning Platform Project Defence"),
        text("F1", 15, 52, 702, "Speaker Notes and Presentation Guide"),
        "0.20 0.55 0.95 rg",
        "52 680 125 3 re f",
        "0.90 0.95 1 rg",
    ]
    intro = (
        "Use these prompts to rehearse; do not read them word-for-word. "
        "Aim to spend about 8-10 minutes on slides and reserve 3-5 minutes "
        "for your live demonstration and questions."
    )
    y = 638
    for line in lines(intro, 75):
        first.append(text("F1", 13, 52, y, line))
        y -= 20
    first.extend(
        [
            text("F2", 14, 52, 514, "Suggested live-demo order"),
            text("F1", 12, 52, 486, "1. Public catalogue and course details"),
            text("F1", 12, 52, 462, "2. Student lesson, progress, and quiz attempt"),
            text("F1", 12, 52, 438, "3. Instructor course management"),
            text("F1", 12, 52, 414, "4. Administrator approval screen and audit log"),
            text("F2", 14, 52, 350, "Before the defence"),
            text("F1", 12, 52, 322, "Sign in to demo accounts, test the internet, and keep"),
            text("F1", 12, 52, 298, "the system running. The slide screenshots are your fallback."),
            text("F1", 9, 52, 56, "Prepared for the project defence presentation"),
        ]
    )
    pages.append(("\n".join(first) + "\n").encode("latin-1"))

    for index in range(0, len(NOTES), 2):
        commands = [
            "0.98 0.99 1 rg",
            "0 0 595 842 re f",
            "0.04 0.12 0.24 rg",
            text("F2", 13, 50, 804, "E-Learning Platform Project Defence - Speaker Notes"),
        ]
        first_note = NOTES[index]
        commands.extend(note_block(*first_note, top=755))
        if index + 1 < len(NOTES):
            second_note = NOTES[index + 1]
            commands.extend(note_block(*second_note, top=395))
        commands.extend(
            [
                "0.04 0.12 0.24 rg",
                text("F1", 8, 50, 32, "Use this as a rehearsal guide; speak naturally and answer from your system."),
            ]
        )
        pages.append(("\n".join(commands) + "\n").encode("latin-1"))
    return pages


def build_pdf(pages: list[bytes]) -> bytes:
    objects: list[bytes] = []
    objects.append(b"<< /Type /Catalog /Pages 2 0 R >>")
    kids = " ".join(f"{4 + i * 2} 0 R" for i in range(len(pages)))
    objects.append(f"<< /Type /Pages /Kids [{kids}] /Count {len(pages)} >>".encode())
    objects.append(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    objects.append(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")

    for index, stream in enumerate(pages):
        page_id = 5 + index * 2
        objects.append(
            (
                f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] "
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


OUTPUT.write_bytes(build_pdf(make_pages()))
print(f"Created {OUTPUT}")
