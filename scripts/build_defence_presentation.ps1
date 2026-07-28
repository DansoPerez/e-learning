$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

# Builds a concise 14-slide, 16:9 defence deck from the current report
# screenshots. It uses PowerPoint's installed COM automation rather than an
# external Python package, so the resulting file remains editable in PowerPoint.

$projectRoot = Split-Path -Parent $PSScriptRoot
$reportDir = Join-Path $projectRoot "Project Report"
$assetDir = Join-Path $reportDir "presentation-assets"
$output = Join-Path $reportDir "E_Learning_Platform_Project_Defence.pptx"
$backup = Join-Path $reportDir "E_Learning_Platform_Project_Defence_before_redesign.pptx"

if (!(Test-Path $assetDir)) { throw "Presentation assets folder not found: $assetDir" }
if ((Test-Path $output) -and !(Test-Path $backup)) {
    Copy-Item $output $backup
}

# PowerPoint/Office colour values are BGR-packed integers.
function Color([int]$r, [int]$g, [int]$b) { return ($r + (256 * $g) + (65536 * $b)) }

$navy = Color 11 31 58
$blue = Color 9 100 218
$sky = Color 54 138 240
$paleBlue = Color 232 242 255
$ink = Color 22 35 48
$muted = Color 86 102 117
$line = Color 215 226 239
$panel = Color 248 250 252
$white = Color 255 255 255
$green = Color 20 142 102
$amber = Color 224 142 20
$red = Color 201 63 63

$slideW = 960
$slideH = 540

function Set-Fill($shape, [int]$color) {
    $shape.Fill.Visible = -1
    $shape.Fill.Solid()
    $shape.Fill.ForeColor.RGB = $color
}

function Set-Line($shape, [int]$color, [single]$weight = 1) {
    $shape.Line.Visible = -1
    $shape.Line.ForeColor.RGB = $color
    $shape.Line.Weight = $weight
}

function Add-Box($slide, [single]$x, [single]$y, [single]$w, [single]$h,
    [int]$fill, [int]$stroke = $null, [int]$shapeType = 5) {
    $shape = $slide.Shapes.AddShape($shapeType, $x, $y, $w, $h)
    Set-Fill $shape $fill
    if ($null -eq $stroke) {
        $shape.Line.Visible = 0
    } else {
        Set-Line $shape $stroke 0.8
    }
    return $shape
}

function Add-Text($slide, [string]$text, [single]$x, [single]$y,
    [single]$w, [single]$h, [single]$size = 16, [int]$color = 0,
    [bool]$bold = $false, [int]$align = 1, [string]$font = "Aptos",
    [bool]$italic = $false) {
    $shape = $slide.Shapes.AddTextbox(1, $x, $y, $w, $h)
    $tf = $shape.TextFrame
    $tf.MarginLeft = 0
    $tf.MarginRight = 0
    $tf.MarginTop = 0
    $tf.MarginBottom = 0
    $tf.WordWrap = -1
    $tf.AutoSize = 0
    $tf.VerticalAnchor = 3
    $tf.TextRange.Text = $text
    $tf.TextRange.Font.Name = $font
    $tf.TextRange.Font.Size = $size
    $tf.TextRange.Font.Bold = if ($bold) { -1 } else { 0 }
    $tf.TextRange.Font.Italic = if ($italic) { -1 } else { 0 }
    $tf.TextRange.Font.Color.RGB = $color
    $tf.TextRange.ParagraphFormat.Alignment = $align
    return $shape
}

function Add-Rule($slide, [single]$x, [single]$y, [single]$w, [int]$color = $line) {
    $shape = $slide.Shapes.AddLine($x, $y, $x + $w, $y)
    Set-Line $shape $color 0.75
    return $shape
}

function Add-Arrow($slide, [single]$x1, [single]$y1, [single]$x2, [single]$y2,
    [int]$color = $blue, [single]$weight = 1.5) {
    $shape = $slide.Shapes.AddLine($x1, $y1, $x2, $y2)
    Set-Line $shape $color $weight
    $shape.Line.EndArrowheadStyle = 3
}

function Add-ImageContain($slide, [string]$path, [single]$x, [single]$y,
    [single]$w, [single]$h, [int]$border = $line) {
    $image = [System.Drawing.Image]::FromFile($path)
    $ratio = $image.Width / $image.Height
    $image.Dispose()
    $boxRatio = $w / $h
    if ($ratio -gt $boxRatio) {
        $iw = $w
        $ih = $w / $ratio
        $ix = $x
        $iy = $y + (($h - $ih) / 2)
    } else {
        $ih = $h
        $iw = $h * $ratio
        $ix = $x + (($w - $iw) / 2)
        $iy = $y
    }
    $pic = $slide.Shapes.AddPicture($path, 0, -1, $ix, $iy, $iw, $ih)
    Set-Line $pic $border 0.65
}

function Add-Footer($slide, [int]$number) {
    Add-Rule $slide 42 505 876 $line | Out-Null
    Add-Text $slide "SECURE E-LEARNING MARKETPLACE  |  PROJECT DEFENCE" 42 512 450 13 7 $muted $false 1 | Out-Null
    Add-Text $slide "$number" 895 510 23 14 8 $muted $true 3 | Out-Null
}

function Add-Header($slide, [int]$number, [string]$title, [string]$subtitle = "") {
    $bar = $slide.Shapes.AddShape(1, 0, 0, $slideW, 8)
    Set-Fill $bar $blue
    $bar.Line.Visible = 0
    Add-Text $slide $title 42 28 785 36 26 $ink $true 1 | Out-Null
    if ($subtitle) {
        Add-Text $slide $subtitle 42 68 790 20 11 $muted $false 1 | Out-Null
    }
    Add-Footer $slide $number
}

function Add-CardTitle($slide, [string]$number, [string]$title, [string]$body,
    [single]$x, [single]$y, [single]$w, [single]$h, [int]$accent = $blue) {
    $card = Add-Box $slide $x $y $w $h $panel $line 5
    $accentShape = $slide.Shapes.AddShape(1, $x, $y, 6, $h)
    Set-Fill $accentShape $accent
    $accentShape.Line.Visible = 0
    Add-Text $slide $number ($x + 20) ($y + 15) 30 24 14 $accent $true 1 | Out-Null
    Add-Text $slide $title ($x + 20) ($y + 43) ($w - 38) 36 16 $ink $true 1 | Out-Null
    Add-Text $slide $body ($x + 20) ($y + 83) ($w - 38) ($h - 96) 11 $muted $false 1 | Out-Null
}

function Add-Note($slide, [string]$text) {
    try {
        $slide.NotesPage.Shapes.Placeholders(2).TextFrame.TextRange.Text = $text
    } catch {
        # Speaker notes are a convenience. The visual deck is still valid if
        # this Office build exposes a different NotesPage placeholder index.
    }
}

function New-Slide($presentation) {
    return $presentation.Slides.Add($presentation.Slides.Count + 1, 12)
}

function Add-FlowNode($slide, [string]$label, [single]$x, [single]$y, [single]$w,
    [int]$fill = $paleBlue, [int]$textColor = $blue) {
    $box = Add-Box $slide $x $y $w 38 $fill $line 5
    Add-Text $slide $label $x ($y + 9) $w 18 10 $textColor $true 2 | Out-Null
}

$ppt = New-Object -ComObject PowerPoint.Application
$ppt.Visible = -1
$presentation = $ppt.Presentations.Add()
$presentation.PageSetup.SlideWidth = $slideW
$presentation.PageSetup.SlideHeight = $slideH

# --- 1. Title ---
$s = New-Slide $presentation
$bg = $s.Shapes.AddShape(1, 0, 0, $slideW, $slideH)
Set-Fill $bg $navy
$bg.Line.Visible = 0
$circle1 = $s.Shapes.AddShape(9, 710, 52, 280, 280)
Set-Fill $circle1 $blue
$circle1.Fill.Transparency = 0.55
$circle1.Line.Visible = 0
$circle2 = $s.Shapes.AddShape(9, 785, 310, 180, 180)
Set-Fill $circle2 $sky
$circle2.Fill.Transparency = 0.68
$circle2.Line.Visible = 0
Add-Text $s "UNDERGRADUATE PROJECT DEFENCE" 56 74 520 22 12 $paleBlue $true 1 | Out-Null
Add-Text $s "Design and Implementation`nof a Secure E-Learning Platform" 56 116 630 112 33 $white $true 1 | Out-Null
Add-Text $s "A web-based course marketplace for students, instructors, and administrators" 56 244 570 38 16 $paleBlue $false 1 | Out-Null
Add-Rule $s 56 310 120 $sky | Out-Null
Add-Text $s "Prepared by: [Your Full Name]`nIndex Number: [Your Index Number]`nComputer Science Department | Kumasi Technical University" 56 332 450 70 12 $white $false 1 | Out-Null
Add-Text $s "2026" 56 468 150 22 11 $paleBlue $false 1 | Out-Null
Add-Note $s "Open with your name, programme and project title. Do not read the title slide. In one sentence say that the project is a secure web-based e-learning marketplace built for students, instructors and administrators."

# --- 2. Problem ---
$s = New-Slide $presentation
Add-Header $s 2 "Background and Problem" "Why a locally relevant e-learning marketplace is needed"
Add-Text $s "THE GAP" 42 112 100 18 11 $blue $true 1 | Out-Null
Add-Text $s "Online learning is growing, but existing platforms leave important needs unmet in the Ghanaian context." 42 137 830 38 21 $ink $true 1 | Out-Null
Add-CardTitle $s "01" "Local payment barrier" "Many global platforms rely on international cards, which can exclude learners who depend on local cards or mobile money." 42 214 268 174 $blue
Add-CardTitle $s "02" "Weak content governance" "Open marketplaces can allow unreviewed content to reach learners before a proper approval decision is made." 346 214 268 174 $amber
Add-CardTitle $s "03" "Trust and security concerns" "Weak account controls, unclear records, and poor payment handling discourage both learners and instructors." 650 214 268 174 $red
Add-Text $s "Design question: Can one low-cost platform combine local payment, content approval, and secure role-based access?" 42 426 850 34 15 $ink $true 1 | Out-Null
Add-Note $s "Present the three gaps clearly. Avoid criticising platforms generally; explain that the project addresses a context-specific combination of local payment, governance and security."

# --- 3. Aim/objectives ---
$s = New-Slide $presentation
Add-Header $s 3 "Aim and Objectives" "What the project set out to achieve"
$aim = Add-Box $s 42 118 336 310 $navy $null 5
Add-Text $s "AIM" 68 146 90 18 11 $paleBlue $true 1 | Out-Null
Add-Text $s "To design and implement a secure web-based e-learning marketplace." 68 184 270 92 25 $white $true 1 | Out-Null
Add-Text $s "The platform supports role-based course management, local payment, automated assessment, and transparent revenue sharing." 68 302 270 70 13 $paleBlue $false 1 | Out-Null
$objectives = @(
    "Separate student, instructor, and administrator privileges.",
    "Support course creation, review, approval, and publication.",
    "Protect accounts through secure authentication and audit logs.",
    "Enable free and paid enrolment with automatic revenue sharing.",
    "Provide timed quizzes, automatic grading, and progress tracking."
)
for ($i = 0; $i -lt $objectives.Count; $i++) {
    $y = 124 + ($i * 60)
    $chip = Add-Box $s 420 $y 32 32 $paleBlue $null 9
    Add-Text $s "$($i + 1)" 420 ($y + 8) 32 14 10 $blue $true 2 | Out-Null
    Add-Text $s $objectives[$i] 468 ($y + 4) 420 36 14 $ink $true 1 | Out-Null
}
Add-Note $s "Read the aim once. Then summarise the objectives instead of reading them word for word. The key message is that the project covers the entire marketplace journey, not only course delivery."

# --- 4. Solution / roles ---
$s = New-Slide $presentation
Add-Header $s 4 "Proposed Solution" "One platform, three roles, controlled access"
$roles = @(
    [pscustomobject]@{ Title = "STUDENT"; Body = "Browse approved courses`nEnrol, learn and track progress`nTake quizzes, review and message"; Color = $blue },
    [pscustomobject]@{ Title = "INSTRUCTOR"; Body = "Apply for approval`nCreate courses and assessments`nView earnings and request withdrawals"; Color = $green },
    [pscustomobject]@{ Title = "ADMINISTRATOR"; Body = "Approve instructors and courses`nManage users and withdrawals`nMonitor analytics and audit logs"; Color = $amber }
)
for ($i = 0; $i -lt $roles.Count; $i++) {
    $x = 42 + ($i * 298)
    $card = Add-Box $s $x 132 268 238 $panel $line 5
    $badge = Add-Box $s ($x + 20) 153 44 44 $roles[$i].Color $null 9
    Add-Text $s "$($i + 1)" ($x + 20) 167 44 14 13 $white $true 2 | Out-Null
    Add-Text $s $($roles[$i].Title) ($x + 20) 218 228 24 16 $ink $true 1 | Out-Null
    Add-Text $s $($roles[$i].Body) ($x + 20) 254 224 78 12 $muted $false 1 | Out-Null
}
Add-Text $s "Core journey" 42 410 110 18 11 $blue $true 1 | Out-Null
Add-FlowNode $s "Create account" 42 438 132
Add-Arrow $s 178 457 205 457 $blue
Add-FlowNode $s "Approved course" 210 438 132
Add-Arrow $s 346 457 373 457 $blue
Add-FlowNode $s "Enrol & pay" 378 438 132
Add-Arrow $s 514 457 541 457 $blue
Add-FlowNode $s "Learn & assess" 546 438 132
Add-Arrow $s 682 457 709 457 $blue
Add-FlowNode $s "Track outcome" 714 438 132
Add-Note $s "Introduce the actors before demonstrating the interface. Emphasise that role separation is enforced by the server, not just hidden in the user interface."

# --- 5. Architecture ---
$s = New-Slide $presentation
Add-Header $s 5 "System Architecture" "Three tiers, with external services isolated from the client"
Add-Text $s "Presentation tier" 72 130 200 20 12 $blue $true 2 | Out-Null
Add-Text $s "Application tier" 380 130 220 20 12 $blue $true 2 | Out-Null
Add-Text $s "Data tier" 724 130 160 20 12 $blue $true 2 | Out-Null
Add-Box $s 54 170 210 170 $panel $line 5 | Out-Null
Add-Text $s "Browser" 74 198 170 24 18 $ink $true 2 | Out-Null
Add-Text $s "Responsive React interface`nPages, forms, dashboards`nMobile and desktop access" 74 242 170 60 12 $muted $false 2 | Out-Null
Add-Box $s 330 152 290 218 $navy $null 5 | Out-Null
Add-Text $s "Next.js application" 354 178 240 26 19 $white $true 2 | Out-Null
Add-Text $s "Server Components  |  Server Actions`nAPI routes  |  Middleware`nValidation  |  Domain services" 354 228 240 66 12 $paleBlue $false 2 | Out-Null
Add-Box $s 696 170 210 170 $panel $line 5 | Out-Null
Add-Text $s "PostgreSQL" 716 198 170 24 18 $ink $true 2 | Out-Null
Add-Text $s "Prisma ORM`nUsers, courses, payments`nProgress and audit records" 716 242 170 60 12 $muted $false 2 | Out-Null
Add-Arrow $s 266 255 326 255 $blue 2
Add-Arrow $s 622 255 692 255 $blue 2
Add-Text $s "External services" 42 406 140 18 11 $blue $true 1 | Out-Null
$external = @(
    [pscustomobject]@{ Name = "Paystack"; Detail = "Payment processing"; Color = $blue },
    [pscustomobject]@{ Name = "Brevo"; Detail = "Email and verification"; Color = $green },
    [pscustomobject]@{ Name = "Blob storage"; Detail = "Files and documents"; Color = $amber },
    [pscustomobject]@{ Name = "Google"; Detail = "OAuth sign-in"; Color = $red }
)
for ($i = 0; $i -lt $external.Count; $i++) {
    $x = 42 + ($i * 218)
    Add-Box $s $x 434 194 38 $paleBlue $null 5 | Out-Null
    Add-Text $s $($external[$i].Name) ($x + 10) 443 88 14 10 $($external[$i].Color) $true 1 | Out-Null
    Add-Text $s $($external[$i].Detail) ($x + 95) 443 88 14 8 $muted $false 3 | Out-Null
}
Add-Note $s "Walk left to right. The browser never sees a database credential or secret key. Server-side actions and route checks are why a student cannot reach administrative functions by editing the browser URL."

# --- 6. Workflows ---
$s = New-Slide $presentation
Add-Header $s 6 "Key Workflows" "The controls that protect course quality and payment processing"
Add-Text $s "Course approval workflow" 42 116 250 20 15 $ink $true 1 | Out-Null
$workflow = @("Draft", "Pending review", "Approved", "Published")
for ($i = 0; $i -lt $workflow.Count; $i++) {
    $x = 42 + ($i * 206)
    Add-FlowNode $s $workflow[$i] $x 150 164 $paleBlue $blue
    if ($i -lt ($workflow.Count - 1)) { Add-Arrow $s ($x + 164) 169 ($x + 202) 169 $blue }
}
Add-Text $s "Rejected courses return to the instructor with a reason. Hidden courses are removed from the catalogue while enrolled learners keep access." 42 207 840 34 12 $muted $false 1 | Out-Null
Add-Rule $s 42 270 876 $line | Out-Null
Add-Text $s "Paid enrolment workflow" 42 294 250 20 15 $ink $true 1 | Out-Null
$payFlow = @("Student enrols", "Payment pending", "Paystack verifies", "Enrol + credit")
for ($i = 0; $i -lt $payFlow.Count; $i++) {
    $x = 42 + ($i * 206)
    Add-FlowNode $s $payFlow[$i] $x 328 164 $paleBlue $blue
    if ($i -lt ($payFlow.Count - 1)) { Add-Arrow $s ($x + 164) 347 ($x + 202) 347 $blue }
}
$callout = Add-Box $s 42 400 876 55 $paleBlue $null 5
Add-Text $s "Reliability safeguard: browser callback and Paystack webhook use the same idempotent completion process, so a payment cannot be credited twice." 62 417 830 22 13 $ink $true 1 | Out-Null
Add-Note $s "This slide is important. Explain that approval prevents unreviewed content from reaching customers. Then explain idempotency in plain language: even if two payment confirmations arrive, the system processes the sale only once."

# --- 7. Security ---
$s = New-Slide $presentation
Add-Header $s 7 "Security and Reliability Controls" "Controls implemented to protect users, content, and payments"
Add-CardTitle $s "01" "Role-based access" "Middleware and server-side role checks." 42 126 270 130 $blue
Add-CardTitle $s "02" "Password protection" "bcrypt hashing and password rules." 339 126 270 130 $green
Add-CardTitle $s "03" "Rate limiting" "Database-backed protection against abuse." 636 126 270 130 $amber
Add-CardTitle $s "04" "Signed quiz sessions" "Server-controlled attempt start time." 42 288 270 130 $red
Add-CardTitle $s "05" "Payment verification" "Verified transaction and idempotent processing." 339 288 270 130 $blue
Add-CardTitle $s "06" "Audit trail" "Sensitive actions recorded for accountability." 636 288 270 130 $green
Add-Text $s "Security is a design requirement rather than a later add-on." 42 456 780 22 14 $ink $true 1 | Out-Null
Add-Note $s "Do not rush this slide. Pick two controls to explain in detail if the panel asks: role checks protect areas by user type, and idempotent payment processing prevents duplicate crediting."

# --- 8. Public / auth interfaces ---
$s = New-Slide $presentation
Add-Header $s 8 "Public and Authentication Experience" "The first screens seen by a visitor, shown on a mobile browser"
Add-Box $s 42 110 270 354 $panel $line 5 | Out-Null
Add-ImageContain $s (Join-Path $assetDir "image1.png") 58 124 238 280
Add-Text $s "Landing page" 58 416 238 20 13 $ink $true 2 | Out-Null
Add-Text $s "Clear entry points to explore, teach, and join." 58 438 238 24 10 $muted $false 2 | Out-Null
Add-Box $s 340 110 270 354 $panel $line 5 | Out-Null
Add-ImageContain $s (Join-Path $assetDir "image2.png") 356 124 238 280
Add-Text $s "Course catalogue" 356 416 238 20 13 $ink $true 2 | Out-Null
Add-Text $s "Search, category filtering, and published course cards." 356 438 238 24 10 $muted $false 2 | Out-Null
Add-Box $s 638 110 280 354 $panel $line 5 | Out-Null
Add-ImageContain $s (Join-Path $assetDir "image4.png") 666 124 224 280
Add-Text $s "Sign-in" 654 416 248 20 13 $ink $true 2 | Out-Null
Add-Text $s "Users may sign in with a user ID or email address." 654 438 248 24 10 $muted $false 2 | Out-Null
Add-Note $s "Use this slide briefly. It establishes that the interface is responsive. Mention that the user ID option is useful where users may not remember the email address they registered with."

# --- 9. Learning ---
$s = New-Slide $presentation
Add-Header $s 9 "Student Learning Experience" "Course progress and timed automatic assessment"
Add-Box $s 42 112 354 300 $panel $line 5 | Out-Null
Add-ImageContain $s (Join-Path $assetDir "image5.png") 60 126 318 226
Add-Text $s "Student dashboard" 60 364 318 20 13 $ink $true 2 | Out-Null
Add-Text $s "Enrolled courses, current progress, and a continue-learning route." 60 387 318 25 10 $muted $false 2 | Out-Null
Add-Box $s 420 112 354 300 $panel $line 5 | Out-Null
Add-ImageContain $s (Join-Path $assetDir "image6.png") 438 126 318 226
Add-Text $s "Timed quiz" 438 364 318 20 13 $ink $true 2 | Out-Null
Add-Text $s "Automatic marking, pass score, and an attempt protected by a signed token." 438 387 318 25 10 $muted $false 2 | Out-Null
Add-Box $s 800 112 118 300 $navy $null 5 | Out-Null
Add-Text $s "PROGRESS" 815 139 88 16 10 $paleBlue $true 2 | Out-Null
Add-Text $s "Lessons" 815 196 88 20 12 $white $true 2 | Out-Null
Add-Text $s "+" 815 234 88 18 18 $sky $true 2 | Out-Null
Add-Text $s "Passed`nquizzes" 815 270 88 40 12 $white $true 2 | Out-Null
Add-Text $s "=" 815 330 88 18 18 $sky $true 2 | Out-Null
Add-Text $s "Course`ncompletion" 815 366 88 42 12 $white $true 2 | Out-Null
Add-Note $s "Explain how a student moves through the system: enrol, open a course, complete lessons, take required quizzes, and see progress update. The quiz result is calculated on the server and a passed quiz contributes to course completion."

# --- 10. Instructor ---
$s = New-Slide $presentation
Add-Header $s 10 "Instructor Experience" "From application to course management and earnings"
Add-Box $s 42 112 256 310 $panel $line 5 | Out-Null
Add-ImageContain $s (Join-Path $assetDir "image7.png") 58 126 224 230
Add-Text $s "Instructor application" 58 369 224 20 13 $ink $true 2 | Out-Null
Add-Text $s "Application details are reviewed before instructor tools become available." 58 391 224 30 10 $muted $false 2 | Out-Null
Add-Box $s 324 112 256 310 $panel $line 5 | Out-Null
Add-ImageContain $s (Join-Path $assetDir "image8.png") 340 126 224 230
Add-Text $s "Instructor dashboard" 340 369 224 20 13 $ink $true 2 | Out-Null
Add-Text $s "Courses, learners, earnings, and withdrawal information in one view." 340 391 224 30 10 $muted $false 2 | Out-Null
Add-Box $s 606 112 312 310 $panel $line 5 | Out-Null
Add-ImageContain $s (Join-Path $assetDir "image9.png") 654 126 216 230
Add-Text $s "Course editor" 622 369 280 20 13 $ink $true 2 | Out-Null
Add-Text $s "Build modules, add lessons, create quizzes, then submit the course for review." 622 391 280 30 10 $muted $false 2 | Out-Null
Add-Text $s "Instructor access is enabled only after administrative approval." 42 452 790 22 14 $ink $true 1 | Out-Null
Add-Note $s "The instructor cannot publish straight to learners. Explain the approval state first, then show that the approved instructor gets content tools, earnings information and a withdrawal process."

# --- 11. Admin ---
$s = New-Slide $presentation
Add-Header $s 11 "Administration and Accountability" "Governance, moderation, and traceability"
Add-Box $s 42 112 420 314 $panel $line 5 | Out-Null
Add-ImageContain $s (Join-Path $assetDir "image10.png") 58 126 388 238
Add-Text $s "Admin command centre" 58 378 388 20 13 $ink $true 2 | Out-Null
Add-Text $s "Manage users, instructors, course approvals, withdrawals, announcements, and settings." 58 401 388 24 10 $muted $false 2 | Out-Null
Add-Box $s 500 112 418 314 $panel $line 5 | Out-Null
Add-ImageContain $s (Join-Path $assetDir "image11.png") 516 126 386 238
Add-Text $s "Audit log" 516 378 386 20 13 $ink $true 2 | Out-Null
Add-Text $s "Sensitive actions are recorded to support accountability and investigation." 516 401 386 24 10 $muted $false 2 | Out-Null
Add-Box $s 42 454 876 34 $paleBlue $null 5 | Out-Null
Add-Text $s "Administrative controls complete the trust model: instructor verification + course review + traceable actions." 58 463 842 16 11 $ink $true 2 | Out-Null
Add-Note $s "This is the other side of the platform. Highlight that administration is not just a dashboard; it is how the platform enforces trust, approves content and keeps an audit trail of sensitive decisions."

# --- 12. Testing ---
$s = New-Slide $presentation
Add-Header $s 12 "Testing and Evaluation" "Evidence that the essential user journeys and safeguards work"
$stats = @(
    [pscustomobject]@{ Value = "22"; Label = "mapped test cases"; Color = $blue },
    [pscustomobject]@{ Value = "3"; Label = "testing levels"; Color = $green },
    [pscustomobject]@{ Value = "100%"; Label = "listed cases passed"; Color = $amber }
)
for ($i = 0; $i -lt $stats.Count; $i++) {
    $x = 42 + ($i * 184)
    Add-Box $s $x 120 160 110 $panel $line 5 | Out-Null
    Add-Text $s $($stats[$i].Value) $x 142 160 34 27 $($stats[$i].Color) $true 2 | Out-Null
    Add-Text $s $($stats[$i].Label) $x 184 160 18 10 $muted $false 2 | Out-Null
}
Add-Text $s "Testing levels" 620 124 260 18 13 $ink $true 1 | Out-Null
Add-Text $s "Unit  |  isolated calculations and validation`nIntegration  |  database, payment, and enrolment flows`nUser acceptance  |  real student, instructor, and admin journeys" 620 156 278 70 11 $muted $false 1 | Out-Null
Add-Rule $s 42 260 876 $line | Out-Null
Add-Text $s "Examples verified" 42 284 190 18 13 $ink $true 1 | Out-Null
$checks = @(
    "Weak passwords are rejected",
    "Suspended users cannot sign in",
    "Unreviewed courses stay out of the catalogue",
    "Duplicate payment confirmation credits once only",
    "Forged or late quiz attempts are rejected",
    "A student cannot open an admin route"
)
for ($i = 0; $i -lt $checks.Count; $i++) {
    $col = $i % 2
    $row = [math]::Floor($i / 2)
    $x = 42 + ($col * 440)
    $y = 322 + ($row * 48)
    $chip = Add-Box $s $x $y 20 20 $green $null 9
    Add-Text $s "OK" $x ($y + 4) 20 12 7 $white $true 2 | Out-Null
    Add-Text $s $checks[$i] ($x + 30) ($y + 2) 390 20 12 $ink $false 1 | Out-Null
}
Add-Note $s "Do not claim that every possible risk has been eliminated. Say the mapped cases passed, and give two examples: duplicate payment events credit once only, and a student is redirected when attempting an admin route."

# --- 13. Findings / limits / future ---
$s = New-Slide $presentation
Add-Header $s 13 "Findings, Limitations, and Future Work" "What the project proved, and what remains outside its present scope"
Add-CardTitle $s "ACHIEVED" "Working marketplace" "A multi-role platform with controlled course publication, free/paid enrolment, learning tools, quizzes, and traceable administration." 42 126 268 260 $green
Add-CardTitle $s "LIMIT" "Not production scale" "Payments were tested in a sandbox, and heavy-load performance was not measured on production infrastructure." 346 126 268 260 $amber
Add-CardTitle $s "NEXT" "Real-world extension" "Live payment operation, load testing, a wider user study, offline support, and richer assessment types." 650 126 268 260 $blue
Add-Text $s "Conclusion: a small team can build a secure and locally relevant e-learning marketplace using modern, low-cost tools." 42 425 820 36 17 $ink $true 1 | Out-Null
Add-Note $s "Give a balanced conclusion. The system meets its scope and passes the mapped tests, but it has not been proven at production scale. Future work should take it from a tested project artefact to wider real-world deployment."

# --- 14. Thank you ---
$s = New-Slide $presentation
$bg = $s.Shapes.AddShape(1, 0, 0, $slideW, $slideH)
Set-Fill $bg $navy
$bg.Line.Visible = 0
$circle = $s.Shapes.AddShape(9, 720, 80, 250, 250)
Set-Fill $circle $blue
$circle.Fill.Transparency = 0.62
$circle.Line.Visible = 0
Add-Text $s "THANK YOU" 56 150 560 58 42 $white $true 1 | Out-Null
Add-Text $s "Questions and live demonstration" 56 226 520 32 19 $paleBlue $false 1 | Out-Null
Add-Rule $s 56 286 120 $sky | Out-Null
Add-Text $s "The system is ready to demonstrate:`n- student learning and quiz attempt`n- instructor course management`n- administrator approval and audit trail" 56 324 450 100 14 $white $false 1 | Out-Null
Add-Text $s "Secure E-Learning Marketplace  |  Project Defence" 56 486 420 18 9 $paleBlue $false 1 | Out-Null
Add-Note $s "Thank the panel, then offer the live demo. Keep separate browser tabs ready for the student, instructor, and administrator accounts. If the network is unavailable, use the screenshots in this deck as the fallback evidence."

if (Test-Path $output) { Remove-Item $output -Force }
$presentation.SaveAs($output, 24)
$presentation.Close()
$ppt.Quit()

[System.Runtime.Interopservices.Marshal]::ReleaseComObject($presentation) | Out-Null
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt) | Out-Null
[GC]::Collect()
[GC]::WaitForPendingFinalizers()

Write-Output "Created: $output"
