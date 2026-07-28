$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$reportDir = Join-Path $projectRoot "Project Report"
$pptxPath = Join-Path $reportDir "E_Learning_Platform_Project_Defence.pptx"
$pdfPath = Join-Path $reportDir "E_Learning_Platform_Speaker_Notes.pdf"
$docxPath = Join-Path $reportDir "E_Learning_Platform_Speaker_Notes.docx"

$notes = @(
    [pscustomobject]@{
        Slide = 1; Title = "Title"
        Talk = "Introduce yourself, your programme, and the project title. In one sentence, describe the work as a secure web-based e-learning marketplace that connects students, instructors, and administrators."
        Transition = "I will start by explaining the problem that motivated the system."
    },
    [pscustomobject]@{
        Slide = 2; Title = "Background and Problem"
        Talk = "Present the three connected gaps: local payment is not always accessible, open platforms can have weak content governance, and weak security reduces trust. Keep the focus on the Ghanaian context rather than attacking other platforms."
        Transition = "These gaps shaped the aim and objectives of the project."
    },
    [pscustomobject]@{
        Slide = 3; Title = "Aim and Objectives"
        Talk = "Read the aim once, then summarise the objectives. Emphasise that the project covers the full marketplace journey: roles, courses, payment, learning, assessment, and administration."
        Transition = "The next slide shows how the proposed solution is organised."
    },
    [pscustomobject]@{
        Slide = 4; Title = "Proposed Solution"
        Talk = "Introduce the three roles. A student learns, an instructor creates approved content, and an administrator governs the platform. Stress that the permissions are enforced on the server, not simply hidden in the interface."
        Transition = "This is the architecture that supports those roles."
    },
    [pscustomobject]@{
        Slide = 5; Title = "System Architecture"
        Talk = "Walk from left to right: browser, Next.js application, PostgreSQL database, then external services. The important security point is that database credentials and service secrets remain on the server."
        Transition = "Two workflows are especially important for trust: course approval and payment."
    },
    [pscustomobject]@{
        Slide = 6; Title = "Key Workflows"
        Talk = "Explain that an instructor cannot publish immediately: a course moves from draft through review and approval before publication. For payment, explain idempotency plainly: callback and webhook events may both arrive, but the sale is credited only once."
        Transition = "Those workflows rely on the following controls."
    },
    [pscustomobject]@{
        Slide = 7; Title = "Security and Reliability Controls"
        Talk = "Do not read every card. Explain two examples in detail: role checks stop a student from reaching administrator functions, and idempotent payment handling stops duplicate credits. Mention bcrypt, rate limiting, signed quiz sessions, and audit logging as supporting controls."
        Transition = "I will now show the main user-facing parts of the system."
    },
    [pscustomobject]@{
        Slide = 8; Title = "Public and Authentication Experience"
        Talk = "Use the screenshots briefly. Point out the responsive mobile layout, course search and filtering, and sign-in by either generated user ID or email. The registration flow enforces password rules before an account is created."
        Transition = "After enrolment, the learner moves into the course and assessment experience."
    },
    [pscustomobject]@{
        Slide = 9; Title = "Student Learning Experience"
        Talk = "Describe the learning flow: enrol, open a course, complete lessons, take required quizzes, and see progress update. The quiz score is calculated on the server and a passed quiz contributes to course completion."
        Transition = "The instructor side controls how this learning content is created."
    },
    [pscustomobject]@{
        Slide = 10; Title = "Instructor Experience"
        Talk = "An instructor first applies and is reviewed. Once approved, the instructor can build modules and lessons, manage quizzes, see earnings, and request a withdrawal. They still cannot publish a course without administrative approval."
        Transition = "Administration provides the governance behind that workflow."
    },
    [pscustomobject]@{
        Slide = 11; Title = "Administration and Accountability"
        Talk = "Explain that the administrator manages users, instructor applications, course decisions, withdrawals, announcements, and settings. The audit log records sensitive actions so that disputes or misuse can be traced."
        Transition = "The system was then checked through structured testing."
    },
    [pscustomobject]@{
        Slide = 12; Title = "Testing and Evaluation"
        Talk = "State the three testing levels: unit, integration, and user acceptance. Say that all 22 mapped cases passed. Use only two examples: a duplicate payment event did not credit an instructor twice, and a student was blocked from an admin route."
        Transition = "The findings are positive, but the project also has clear limitations."
    },
    [pscustomobject]@{
        Slide = 13; Title = "Findings, Limitations, and Future Work"
        Talk = "Conclude that the system met its scoped objectives. Be honest: payments were tested in sandbox mode and large-scale load testing was not carried out. The next steps are live payment operation, load testing, a wider user study, offline support, and richer assessment."
        Transition = "Thank you. I am ready to answer questions and demonstrate the system."
    },
    [pscustomobject]@{
        Slide = 14; Title = "Questions and Live Demonstration"
        Talk = "Thank the panel. Offer the live demo in this order: public catalogue, student learning and quiz attempt, instructor course management, then administrator approval and audit log."
        Transition = "Keep the backup screenshots open in case the internet connection fails."
    }
)

# Ensure Slide 12 has a matching speaker note inside the PowerPoint.
$ppt = New-Object -ComObject PowerPoint.Application
$ppt.Visible = -1
$presentation = $ppt.Presentations.Open($pptxPath, $false, $false, $false)
$slide12Note = "$($notes[11].Talk) $($notes[11].Transition)"
$presentation.Slides.Item(12).NotesPage.Shapes.Placeholders(2).TextFrame.TextRange.Text = $slide12Note
$presentation.Save()
$presentation.Close()
$ppt.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($presentation) | Out-Null
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt) | Out-Null

# Build a matching, printable PDF with the complete notes.
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$document = $word.Documents.Add()
$selection = $word.Selection
$selection.PageSetup.TopMargin = 54
$selection.PageSetup.BottomMargin = 54
$selection.PageSetup.LeftMargin = 54
$selection.PageSetup.RightMargin = 54

function Add-Paragraph([string]$text, [int]$size, [bool]$bold, [int]$spaceAfter = 6) {
    $selection.Font.Name = "Aptos"
    $selection.Font.Size = $size
    $selection.Font.Bold = if ($bold) { 1 } else { 0 }
    $selection.ParagraphFormat.SpaceAfter = $spaceAfter
    $selection.TypeText($text)
    $selection.TypeParagraph()
}

Add-Paragraph "E-Learning Platform Project Defence" 20 $true 4
Add-Paragraph "Speaker Notes and Presentation Guide" 12 $false 12
Add-Paragraph "Use these as prompts, not a script to read word-for-word. Aim to spend about 8-10 minutes on slides and reserve 3-5 minutes for the live demonstration and questions." 10 $false 16

foreach ($item in $notes) {
    Add-Paragraph "Slide $($item.Slide): $($item.Title)" 14 $true 4
    Add-Paragraph "What to say: $($item.Talk)" 10 $false 4
    Add-Paragraph "Transition: $($item.Transition)" 9 $false 12
}

Add-Paragraph "Live Demo Checklist" 14 $true 4
Add-Paragraph "1. Open the course catalogue.  2. Use the student account to show a lesson, progress, and a quiz.  3. Use the instructor account to show course management.  4. Use the administrator account to show approval actions and the audit log." 10 $false 4
Add-Paragraph "Before the defence: sign in to the demo accounts, keep the system running, test the internet connection, and have the slide screenshots available as a fallback." 10 $false 12

if (Test-Path $docxPath) { Remove-Item $docxPath -Force }
if (Test-Path $pdfPath) { Remove-Item $pdfPath -Force }
$document.SaveAs($docxPath, 16)
$document.ExportAsFixedFormat($pdfPath, 17)
$document.Close()
$word.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($document) | Out-Null
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
[GC]::Collect()
[GC]::WaitForPendingFinalizers()

Write-Output "Created: $pdfPath"
