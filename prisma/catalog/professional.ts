import { PDFS, yt, ytThumb, type SeedCourse } from "./types";

export const PROFESSIONAL_COURSES: SeedCourse[] = [
  {
    title: "Cybersecurity Essentials for Work and Everyday Life",
    category: "Other",
    price: 299,
    thumbnailUrl: ytThumb("bPVaOlJ6ln0"),
    description:
      "A professional cybersecurity programme for professionals and teams. Learn how attacks work, password and MFA hygiene, encryption, phishing defence and incident response — with NIST framework readings, quizzes and a security-assessment capstone.",
    modules: [
      {
        title: "Threats and How They Work",
        lessons: [
          {
            title: "What cybersecurity is",
            durationMin: 15,
            videoUrl: yt("inWWhr5tnEA"),
            content: `Security is the practice of protecting three things, known as the CIA triad:
- Confidentiality: only the right people can read the data.
- Integrity: the data has not been altered without authorisation.
- Availability: the systems work when they are needed.

Almost every attack targets one of these three. Ransomware attacks availability and confidentiality; a fraudulent bank transfer attacks integrity.

Who attacks, and why it matters for defence:
- Opportunistic criminals running automated attacks at scale. This is most of what you will face, and basic hygiene defeats it.
- Targeted criminals pursuing a specific organisation for money.
- Insiders, whether malicious or simply careless. Careless insiders cause far more incidents than malicious ones.
- State actors, relevant to a small number of organisations.

The uncomfortable truth that shapes everything else in this course: the overwhelming majority of successful breaches begin with a person, not a machine. Someone clicks a link, reuses a password, or is persuaded to authorise a payment. Technical controls matter, but human process matters more.

Reflection: list the five accounts whose compromise would damage you most. That list is your priority order for everything that follows.`,
          },
          {
            title: "How computer security works",
            durationMin: 15,
            videoUrl: yt("bPVaOlJ6ln0"),
            content: `Crash Course explains the underlying computer science in a way that makes the rest of the field navigable.

Concepts introduced here:
- Authentication, in three forms: something you know (a password), something you have (a phone or a key), something you are (a fingerprint). Combining two of these is what "two-factor" means.
- Access control and the principle of least privilege: every account gets the minimum permission needed for its job, and no more. This single principle limits the damage of most breaches.
- Isolation and sandboxing: separating programs so a compromise in one does not spread.
- Security bugs and exploits: buffer overflows, injection attacks, and why input validation matters everywhere.
- The threat model: you cannot defend against everything, so decide what you are protecting and from whom. Security decisions made without a threat model are usually theatre.

An idea to carry through the course: there is no such thing as secure, only secure enough against a defined adversary at an acceptable cost. Perfect security means turning the computer off, and a business that cannot operate is also a business that has failed.`,
          },
          {
            title: "Phishing and how it succeeds",
            durationMin: 15,
            videoUrl: yt("Y7zNlEMDmI4"),
            content: `Phishing remains the most common way organisations are compromised because it attacks judgement rather than technology.

The signals to check, in the order that catches the most:
- Urgency and threat. "Your account will be closed in 24 hours" exists to stop you thinking. Any message creating panic deserves more scrutiny, not less.
- The actual sender address, not the display name. Display names are trivially faked.
- Link destinations. Hover before clicking and read the domain from right to left: in secure-bank.example.com, the real domain is example.com.
- Unexpected attachments, especially ones asking you to enable macros.
- Requests to change payment details or make an urgent transfer.
- Slight misspellings of familiar domains, and lookalike characters.

Variants worth knowing by name: spear phishing targets you specifically using real details; whaling targets executives; smishing arrives by text message; vishing arrives by phone, increasingly with cloned voices.

The one rule that defeats nearly all of it: never authenticate or pay from a link you were sent. Navigate to the site yourself, or call back on a number you already had. This costs thirty seconds and prevents most losses.

If you have clicked: change the password from a different device, revoke active sessions, enable two-factor authentication, and tell your IT team immediately. Delay causes more damage than the original mistake.`,
          },
          {
            title: "Social engineering in practice",
            durationMin: 20,
            videoUrl: yt("lc7scxvKQOo"),
            content: `Social engineering is manipulation of people to bypass technical controls. It works because the techniques exploit normal, healthy social instincts.

The levers used against you:
- Authority. People comply with someone who appears senior or official.
- Urgency. Time pressure suppresses careful thought.
- Familiarity and liking. Attackers research you first; a caller who mentions your manager's name by their nickname sounds legitimate.
- Reciprocity. A small favour first, then a request.
- Social proof. "Everyone in your department has already done this."
- Fear of embarrassment. Refusing an apparently reasonable request feels rude, and attackers rely on that.

Common scenarios: the fake IT support call asking you to install remote access software; the new supplier emailing updated bank details; the delivery driver following someone through a secure door; the recruiter offering a role and asking for identity documents.

Defences that work at an organisational level:
- A verification procedure for payment changes, involving a call to a known number. Make it a rule so nobody has to be personally awkward.
- Permission to say no. If staff fear consequences for challenging a senior-sounding request, they will not challenge it.
- Report-without-blame culture. People hide mistakes when they are punished, and hidden incidents grow.

Practical exercise: write the exact sentence you would say to decline an unverified request from someone claiming to be your chief executive. Having the words ready is what makes it possible in the moment.`,
          },
        ],
      },
      {
        title: "Defences That Actually Work",
        lessons: [
          {
            title: "Passwords and password managers",
            durationMin: 15,
            videoUrl: yt("3NjQ9b3pgIg"),
            pdfUrl: PDFS.nistPasswords,
            content: `Most password advice from the last two decades was wrong, and current standards say so explicitly.

What the evidence supports:
- Length beats complexity. A long passphrase of four random words is stronger and easier to remember than P@ssw0rd!23.
- Forced periodic expiry makes security worse. People make small predictable changes, so passwords become guessable. Change a password when there is reason to believe it was exposed.
- Reuse is the real danger. When one site is breached, attackers try that email and password everywhere else. This is called credential stuffing and it is automated and cheap.
- Screening against lists of known breached passwords is far more effective than composition rules.

The practical answer is a password manager. It generates a unique random password for every site, stores them encrypted, and fills them in for you. You remember one strong master passphrase.

The common objection — putting everything in one place feels risky — is worth answering honestly. The realistic alternative is reuse across dozens of sites, which is worse by a wide margin. Choose a reputable manager, protect it with a long passphrase and two-factor authentication, and keep a recovery method offline.

Check your exposure at haveibeenpwned.com. If an account appears, change that password and anywhere you reused it.

The attached NIST publication is the current authoritative standard on digital identity and authentication.`,
          },
          {
            title: "Two-factor authentication",
            durationMin: 10,
            videoUrl: yt("hGRii5f_uSc"),
            content: `Two-factor authentication is the single highest-value security action available to an individual. Even a stolen password is usually not enough to get in.

The methods, weakest to strongest:
- SMS codes. Better than nothing, but vulnerable to SIM swapping, where an attacker persuades a mobile operator to move your number.
- Authenticator apps generating time-based codes. Good, free, and not vulnerable to SIM swapping.
- Push approvals. Convenient, but vulnerable to fatigue attacks where an attacker sends repeated prompts until someone taps accept. Never approve a prompt you did not trigger.
- Hardware security keys and passkeys. Strongest, because they verify the site's identity too and therefore cannot be phished.

Where to enable it first: email, then banking and payments, then your password manager, then cloud storage, then social accounts. Email comes first because it can reset everything else.

Save your recovery codes when you set it up. Store them somewhere that is not your phone — printed, or in your password manager if you have a separate recovery path. People lock themselves out permanently by skipping this step.

Passkeys are steadily replacing passwords entirely. They use a key stored on your device and unlocked biometrically, cannot be reused across sites, and cannot be phished. Adopt them wherever offered.`,
          },
          {
            title: "Encryption and safe networks",
            durationMin: 15,
            videoUrl: yt("6-JjHa-qLPk"),
            content: `Encryption converts data into a form that is useless without the key. It protects data in two situations.

In transit: HTTPS encrypts traffic between your browser and a website. The padlock means the connection is encrypted, and nothing more — it does not mean the site is honest. Criminals use HTTPS too.

At rest: full-disk encryption protects data if a device is stolen. Turn on BitLocker on Windows, FileVault on macOS, and device encryption on phones. It is a single setting and it turns a stolen laptop from a data breach into a hardware loss.

Public key cryptography, explained in this video, is the mechanism behind both. Each party has a public key that anyone may hold and a private key that never leaves them. Anything encrypted with one can only be decrypted with the other, which enables both secrecy and digital signatures without ever sharing a secret in advance.

End-to-end encryption means only the participants can read the content, and the service provider cannot. Signal and WhatsApp use it for messages; most email does not.

Public wifi: modern HTTPS protects most of your traffic, so a coffee shop network is far less dangerous than it once was. The remaining risks are fake hotspots with plausible names and unpatched devices. A reputable VPN adds protection on untrusted networks, but a VPN provider can see what your internet provider would have seen, so it moves trust rather than eliminating it.`,
          },
          {
            title: "Networks, devices and everyday hygiene",
            durationMin: 90,
            videoUrl: yt("qiQR5rTSshw"),
            content: `Understanding how networks operate makes security advice make sense rather than being a list of rules.

From this networking course, focus on: IP addressing, DNS, ports and protocols, firewalls, NAT, and the difference between a switch and a router. These explain what a firewall rule actually does and why an open port matters.

Practical hygiene that prevents the great majority of incidents:
- Apply updates promptly. Most successful attacks exploit vulnerabilities that were patched months earlier. Enable automatic updates on the operating system, browser and applications.
- Change default router credentials, use WPA3 or WPA2, and keep firmware updated.
- Run reputable antivirus, and keep the built-in firewall on.
- Back up using the 3-2-1 rule: three copies, on two different media, one kept offsite or offline. Ransomware encrypts connected backups too, so at least one copy must be disconnected.
- Test a restore. An untested backup is a hope, not a backup.
- Uninstall software you do not use. Every installed application is a potential entry point.
- Lock your screen when you walk away.
- Separate accounts: do not use an administrator account for daily work.

For an organisation, the equivalent controls are inventory, patching, least privilege, logging and an incident plan. The attached NIST Cybersecurity Framework organises these into a structure you can assess yourself against.`,
          },
        ],
      },
      {
        title: "Responding and Improving",
        lessons: [
          {
            title: "Building a security programme",
            durationMin: 60,
            videoUrl: yt("U_P23SqJaDc"),
            pdfUrl: PDFS.nistCsf,
            content: `Individual habits protect you. An organisation needs a programme, and the NIST Cybersecurity Framework is the most widely used way to structure one.

Its five functions:
- Identify. Know what you have: devices, software, data, suppliers and the risks to each. You cannot protect an asset you do not know exists, and unknown assets are where breaches start.
- Protect. Access control, training, data security, maintenance and protective technology.
- Detect. Monitoring and logging so that an intrusion is noticed. The average breach goes undetected for months.
- Respond. A plan describing who does what, who is called, and who speaks publicly.
- Recover. Restoring service and learning from the incident.

An incident response plan needs, at minimum: a named decision-maker, a contact list that is available when systems are down, defined steps for containment, legal and regulatory notification requirements with their deadlines, and a communication template.

The step organisations skip is rehearsal. Run a tabletop exercise: gather the team, describe a scenario, and walk through the response for an hour. Every rehearsal finds something broken, and finding it during a rehearsal is enormously cheaper.

After any incident, run a blameless review. The question is what in the system allowed this, not who is at fault. Cultures that punish individuals stop hearing about incidents, which does not mean the incidents stopped.`,
          },
        ],
      },
      {
        title: "Projects and Capstone",
        lessons: [
          {
            title: "Project 1: Personal security audit and hardening",
            durationMin: 150,
            content: `Secure your own digital life properly. This is the project with the highest immediate return in the whole catalogue.

Requirements:
- Inventory every account that matters, ranked by the damage its compromise would cause.
- Check every associated email address against a breach notification service and record the findings.
- Install a password manager and migrate at least your top twenty accounts to unique generated passwords.
- Enable two-factor authentication on email, banking, the password manager and cloud storage, using an authenticator app or a hardware key rather than SMS where possible.
- Store recovery codes safely and document where.
- Turn on full-disk encryption on every device you own.
- Set up backups following the 3-2-1 rule, and perform a test restore of at least one file.
- Review and revoke third-party application access on your main accounts.

Acceptance criteria:
- No password is reused across any two accounts on the list.
- The test restore actually succeeded, and you say how you verified it.
- A written before-and-after summary identifies the single largest risk you removed.`,
          },
          {
            title: "Project 2: Phishing analysis and awareness material",
            durationMin: 180,
            content: `Study real attacks and produce training that a non-technical colleague would understand.

Requirements:
- Collect at least five genuine phishing messages from your own spam folder, with personal details redacted.
- Analyse each one: the pretext used, the psychological lever, the technical indicators, and what would have happened if the target complied.
- Identify which one you consider most dangerous, and explain why.
- Produce a one-page awareness guide for non-technical staff, using your real examples.
- Design a short verification procedure for payment detail changes that a small organisation could adopt.

Acceptance criteria:
- The analysis names specific indicators in each message, not general advice.
- The one-page guide uses plain language with no unexplained jargon.
- The verification procedure is realistic — it must be something a busy finance team would actually follow.`,
          },
          {
            title: "Capstone: Security assessment and improvement plan",
            durationMin: 300,
            content: `Assess a real organisation — a small business, a student society, a department — with their permission, and deliver a plan.

Requirements:
- An asset inventory: devices, systems, data types and who has access.
- An assessment against the five NIST framework functions, with a maturity rating and evidence for each.
- A risk register: threat, likelihood, impact, current control and residual risk.
- A prioritised improvement plan separating quick wins from longer projects, with rough costs.
- A draft incident response plan with named roles and a contact list.
- A tabletop exercise scenario the organisation can run.
- An executive summary of one page written for a non-technical decision-maker.

Acceptance criteria:
- Recommendations are proportionate to the organisation's actual risk and budget. Recommending enterprise tooling to a five-person charity is a failed assessment.
- The top three priorities are justified by the risk register rather than by what is easiest.
- The incident plan works even if email and file storage are unavailable.
- Nothing in the report identifies real credentials, and any sensitive findings are handled responsibly.

How to submit: share the redacted report and note which recommendation the organisation actually adopted.`,
          },
        ],
      },
    ],
    quizzes: [
      {
        title: "Checkpoint 1: Threats and Attacks",
        durationMin: 15,
        passingScore: 70,
        questions: [
          {
            type: "MCQ",
            question: "What are the three elements of the CIA triad?",
            options: [
              "Confidentiality, integrity and availability",
              "Control, identification and authentication",
              "Cryptography, isolation and auditing",
              "Compliance, insurance and assurance",
            ],
            correctAnswer: "Confidentiality, integrity and availability",
          },
          {
            type: "MCQ",
            question:
              "You receive an email from your bank warning that your account closes in 24 hours unless you log in via the link. What is the safest response?",
            options: [
              "Ignore the link and navigate to the bank's site yourself or call a number you already had",
              "Click the link but check the padlock icon before entering details",
              "Reply to the email asking whether it is genuine",
              "Forward it to colleagues to ask their opinion",
            ],
            correctAnswer:
              "Ignore the link and navigate to the bank's site yourself or call a number you already had",
          },
          {
            type: "MCQ",
            question: "In the URL secure-bank.example.com, what is the actual domain?",
            options: ["example.com", "secure-bank.com", "secure-bank.example", "bank.example"],
            correctAnswer: "example.com",
          },
          {
            type: "MCQ",
            question: "What does the principle of least privilege mean?",
            options: [
              "Each account has only the permissions needed for its role",
              "Only senior staff receive administrator accounts",
              "Users must request access in writing",
              "Permissions are reviewed once a year",
            ],
            correctAnswer: "Each account has only the permissions needed for its role",
          },
          {
            type: "TRUE_FALSE",
            question:
              "The padlock icon in a browser confirms that the website is legitimate and trustworthy.",
            correctAnswer: "false",
          },
          {
            type: "TRUE_FALSE",
            question:
              "Most successful breaches begin with a person being deceived rather than with a purely technical exploit.",
            correctAnswer: "true",
          },
        ],
      },
      {
        title: "Final Assessment: Defences and Response",
        durationMin: 20,
        passingScore: 70,
        questions: [
          {
            type: "MCQ",
            question: "Which password practice is best supported by current guidance?",
            options: [
              "A long unique passphrase for each site, stored in a password manager",
              "A complex password changed every 30 days",
              "One very strong password reused across trusted sites",
              "A short password with symbols substituted for letters",
            ],
            correctAnswer:
              "A long unique passphrase for each site, stored in a password manager",
          },
          {
            type: "MCQ",
            question: "Why are SMS codes the weakest common form of two-factor authentication?",
            options: [
              "They are vulnerable to SIM swapping attacks",
              "They expire too quickly to be useful",
              "They require an internet connection",
              "They cannot be used on modern smartphones",
            ],
            correctAnswer: "They are vulnerable to SIM swapping attacks",
          },
          {
            type: "MCQ",
            question: "What does the 3-2-1 backup rule require?",
            options: [
              "Three copies, on two types of media, with one kept offsite or offline",
              "Three backups every two days, kept for one year",
              "Three drives in two locations, tested once",
              "Two copies onsite and one in the cloud, synced continuously",
            ],
            correctAnswer:
              "Three copies, on two types of media, with one kept offsite or offline",
          },
          {
            type: "MCQ",
            question:
              "Which NIST Cybersecurity Framework function covers monitoring and logging so intrusions are noticed?",
            options: ["Detect", "Identify", "Protect", "Recover"],
            correctAnswer: "Detect",
          },
          {
            type: "TRUE_FALSE",
            question:
              "A backup that has never been restored from cannot be relied upon.",
            correctAnswer: "true",
          },
          {
            type: "TRUE_FALSE",
            question:
              "Punishing staff who report their own security mistakes improves an organisation's overall security posture.",
            correctAnswer: "false",
          },
        ],
      },
    ],
  },

  {
    title: "Agile Project Management with Scrum and Kanban",
    category: "Other",
    price: 279,
    thumbnailUrl: ytThumb("502ILHjX9EE"),
    description:
      "A professional agile delivery programme. Deliver projects that finish: project lifecycle, estimation and risk, Scrum roles and events, Kanban and flow metrics, and continuous delivery — with the official Scrum Guide, quizzes and an end-to-end capstone.",
    modules: [
      {
        title: "Project Management Foundations",
        lessons: [
          {
            title: "The project management framework",
            durationMin: 70,
            videoUrl: yt("ZKOL-rZ79gs"),
            content: `Before choosing a methodology, understand what all projects have in common.

A project is temporary, produces a unique result, and has constraints. The classic triangle is scope, time and cost, with quality in the middle. Change one and something else must move — a fact that most difficult conversations in project management come down to.

The lifecycle: initiating, planning, executing, monitoring and controlling, and closing. Even the most fluid agile team does all five; they simply do them repeatedly in small cycles rather than once in sequence.

Artefacts worth understanding regardless of methodology:
- The business case: why this project, and what happens if we do nothing.
- The scope statement, and explicitly what is out of scope. Undocumented exclusions become arguments.
- The work breakdown structure: the deliverables decomposed until each piece is estimable.
- The schedule, with dependencies and the critical path — the sequence that determines the earliest possible finish.
- The risk register.
- The stakeholder map: who is affected, who decides, who must merely be informed.

Predictive (waterfall) approaches suit projects where requirements are genuinely stable and change is expensive — construction, regulated manufacturing. Adaptive (agile) approaches suit projects where requirements are discovered through building — most software and most new products. The failure mode is applying one where the other belongs, usually because of organisational habit rather than analysis.`,
          },
          {
            title: "Estimation, risk and stakeholders",
            durationMin: 45,
            content: `Three areas where projects most often go wrong, and they compound each other.

Estimation. People are systematically optimistic, a bias so reliable it has a name: the planning fallacy. Practices that help:
- Estimate in ranges, not single numbers. "Five to eight days" is honest; "six days" is fiction presented as fact.
- Use relative sizing rather than absolute hours. Comparing two tasks is something humans do well; predicting durations is something we do badly.
- Estimate as a group, with the people who will do the work. Planning poker exists because it surfaces hidden disagreements about scope.
- Use historical data. What did the last five similar tasks actually take, rather than what did we hope?
- Never negotiate an estimate downwards. You can negotiate scope; changing the number does not change reality.

Risk. Maintain a register with, for each risk: description, likelihood, impact, response and owner. The four responses are avoid, mitigate, transfer and accept. An accepted risk still needs an owner and a trigger. Review the register at a regular cadence, or it becomes a document written once and never read.

Stakeholders. Map them by influence and interest. Manage the high-influence, high-interest group closely; keep the high-influence, low-interest group satisfied; inform the rest. The most common failure is discovering a powerful stakeholder late, after decisions they care about have been made.

Communication plan: who needs what information, how often, in what format. Write it down. Most project conflict is really a communication failure with a different label.`,
          },
        ],
      },
      {
        title: "Scrum",
        lessons: [
          {
            title: "Scrum in five minutes",
            durationMin: 10,
            videoUrl: yt("2Vt7Ik8Ublw"),
            pdfUrl: PDFS.scrumGuide,
            content: `A rapid orientation before the detail.

Scrum is a framework for delivering value in short cycles called sprints, usually one to four weeks.

Three accountabilities:
- Product Owner: decides what gets built and in what order, and is accountable for the value delivered.
- Scrum Master: ensures the team understands and applies Scrum, and removes impediments.
- Developers: the people who do the work. In Scrum the term covers everyone building the increment, not only programmers.

Five events:
- Sprint Planning: what will we deliver, and how?
- Daily Scrum: a fifteen-minute team synchronisation, for the team, not a status report to a manager.
- Sprint Review: show working output to stakeholders and gather feedback.
- Sprint Retrospective: how do we improve how we work?
- The Sprint itself, which contains the others.

Three artefacts: the Product Backlog, the Sprint Backlog and the Increment, each with a commitment attached — the Product Goal, the Sprint Goal and the Definition of Done.

The attached Scrum Guide is the authoritative definition and runs to only thirteen pages. Read it in full; almost nobody does, and most arguments about Scrum are settled by it.`,
          },
          {
            title: "Product ownership and the backlog",
            durationMin: 15,
            videoUrl: yt("502ILHjX9EE"),
            content: `Henrik Kniberg's animation is the clearest explanation of product ownership available anywhere.

The essential ideas:
- The backlog is an ordered list, not a wish list. Ordering is the Product Owner's central act, and it means deciding what does not get built now.
- Value versus effort. Do the high-value, low-effort work first, and be suspicious of high-effort work whose value nobody can articulate.
- Building the wrong thing efficiently is the most expensive outcome available. Speed does not rescue a bad decision about what to build.
- Communicate in slices that deliver value end to end, rather than in technical layers. A thin working feature teaches you something; a completed database layer teaches you nothing about whether users want it.
- Manage stakeholder expectations with real data on delivery rate rather than with promises.

Write backlog items as user stories: as a [type of user], I want [capability], so that [benefit]. The "so that" is the part that matters, and it is the part most often left off. Without it, nobody can judge whether the story is worth doing or whether a cheaper solution would serve.

Good stories follow INVEST: independent, negotiable, valuable, estimable, small, testable. Every story needs acceptance criteria written before work starts — that is what makes "done" a fact rather than an opinion.`,
          },
          {
            title: "Running the events well",
            durationMin: 10,
            videoUrl: yt("9TycLR0TqFA"),
            content: `Scrum is easy to describe and difficult to do well. Most teams adopt the ceremonies and miss the point.

Sprint Planning. Start from a Sprint Goal, a single sentence describing why this sprint matters. Without one, a sprint is just a list of tickets and there is nothing to protect when priorities are challenged mid-sprint.

Daily Scrum. Fifteen minutes, standing, focused on progress towards the Sprint Goal and on impediments. Warning signs that it has degenerated: it runs long, people report to the Scrum Master rather than to each other, and problems are described but never picked up afterwards.

Sprint Review. Demonstrate working output, not slides. Invite real stakeholders and take their feedback into the backlog. A review with no stakeholders present is a team meeting with extra steps.

Retrospective. The event teams cut first and should cut last, because it is the only one that improves the others. Make it safe, focus on the system rather than individuals, and leave with at most two concrete actions with owners. A retrospective that produces no change teaches the team that speaking up is pointless.

Anti-patterns to watch for: a Scrum Master acting as a task allocator, sprints whose scope is set by someone outside the team, a Definition of Done that omits testing, and carrying unfinished work across sprints indefinitely.`,
          },
        ],
      },
      {
        title: "Kanban, Flow and Delivery",
        lessons: [
          {
            title: "Kanban and managing flow",
            durationMin: 15,
            videoUrl: yt("iVaFVa7HYj4"),
            content: `Kanban optimises flow rather than iteration. It suits work that arrives continuously and unpredictably — support, operations, maintenance — and it can be adopted without reorganising anything.

The practices:
- Visualise the work. A board with columns for each real stage, and a card for each item. Make the actual process visible, including the queues nobody admits exist.
- Limit work in progress. This is the mechanism that makes Kanban work, and the one teams resist. Starting less finishes more, because switching between many items wastes capacity and everything sits partly done.
- Manage flow. Watch where cards accumulate. A queue in front of a column is a bottleneck, and improving anything other than the bottleneck improves nothing.
- Make policies explicit. What does "ready" mean? What does "done" mean for this column? Unwritten rules are applied inconsistently.
- Improve collaboratively, using measurement rather than opinion.

The metrics that matter:
- Lead time: from request to delivery, which is what the customer experiences.
- Cycle time: from starting work to finishing it.
- Throughput: items completed per week.
- Work in progress, and its relationship to the others.

Little's Law connects them: average lead time equals work in progress divided by throughput. The practical implication is direct — if you want things to finish sooner, reduce the number of things in progress. This is arithmetic, not preference.

Scrum or Kanban? Scrum suits product development with a cadence and a goal. Kanban suits continuous, interrupt-driven work. Many teams run a hybrid, and that is legitimate as long as it is deliberate rather than a way to avoid the discipline of either.`,
          },
          {
            title: "Continuous delivery and the feedback loop",
            durationMin: 10,
            videoUrl: yt("scEDHsr3APg"),
            content: `Agile planning without a fast delivery pipeline produces two-week sprints that release once a quarter. The technical practices are what make the process real.

Continuous integration: everyone merges work into the shared main branch frequently, and an automated build and test suite runs on every change. Problems surface within minutes, when they are cheap and the author still remembers the context.

Continuous delivery: every change that passes the pipeline is deployable. Releasing becomes a business decision rather than a technical event.

Why this matters for project management:
- Small, frequent releases carry far less risk than large ones. Most catastrophic deployments are large deployments.
- Feedback arrives while the work is still fresh and cheap to change.
- The pipeline becomes the definition of done, enforced automatically rather than by reminder.
- Lead time falls dramatically, which changes what the team can commit to.

Metrics worth tracking, drawn from the DORA research: deployment frequency, lead time for changes, change failure rate, and time to restore service. High-performing teams do better on all four simultaneously, which refutes the intuition that speed and stability trade off against each other.

Feature flags separate deploying code from releasing functionality, letting you ship continuously while controlling what users see. This is what makes frequent deployment compatible with coordinated launches.`,
          },
        ],
      },
      {
        title: "Projects and Capstone",
        lessons: [
          {
            title: "Project 1: Backlog and sprint plan",
            durationMin: 180,
            content: `Take a real initiative — a student society event, a small business system, a personal product — and plan it properly.

Requirements:
- A product goal in one sentence, and a definition of the users.
- A product backlog of at least 25 items written as user stories with the "so that" clause included.
- Acceptance criteria for the top ten items.
- Relative estimates using story points, produced with at least one other person.
- An ordered backlog, with the ordering rationale written down.
- A sprint goal and a sprint backlog for the first two-week sprint.
- A definition of done that includes quality criteria, not just "the code works".

Acceptance criteria:
- Stories are vertical slices delivering user value, not technical layers.
- The ordering can be defended in terms of value and risk.
- At least three items are explicitly marked as out of scope for now.`,
          },
          {
            title: "Project 2: Run a Kanban board with real metrics",
            durationMin: 240,
            content: `Manage four weeks of real work through a Kanban system and measure it.

Requirements:
- A board reflecting your actual workflow, including any waiting stages.
- Explicit work-in-progress limits for each active column, with the reasoning.
- Written policies for what it means to enter and leave each column.
- Daily updates for at least four weeks.
- Recorded start and finish dates for every item so cycle time can be calculated.
- A cumulative flow diagram or a simple chart of throughput over time.
- A weekly review noting where work accumulated and what you changed.

Acceptance criteria:
- Work-in-progress limits were genuinely enforced, and you can describe a moment when the limit stopped you starting something.
- You identified at least one bottleneck with evidence rather than intuition.
- The final report compares cycle time in week one against week four and explains the change, including if it got worse.`,
          },
          {
            title: "Capstone: Deliver a project end to end",
            durationMin: 420,
            content: `Run a real project from initiation to closure using the approach you judge appropriate, and justify that judgement.

Requirements:
- A project charter: objective, scope, out of scope, success criteria, stakeholders and constraints.
- A justification for your chosen approach — predictive, Scrum, Kanban or hybrid — argued from the characteristics of the work.
- A risk register maintained throughout, with evidence it was reviewed rather than written once.
- A stakeholder map and a communication plan, both actually used.
- Delivery in increments with demonstrable output at each stage.
- Retrospectives held at least three times, with recorded actions and evidence that they were carried out.
- Metrics appropriate to the approach: velocity, cycle time or schedule variance.
- A closure report covering what was delivered, what changed, what went wrong and what you learned.

Acceptance criteria:
- Something real was delivered and used by someone other than you.
- The scope changed at least once and the change is documented, along with what was traded away for it.
- The retrospective actions produced visible changes in how the project ran.
- The closure report is honest about failures. A project report with no problems is not a report.

How to submit: share the charter, the board or backlog history, the risk register and the closure report.`,
          },
        ],
      },
    ],
    quizzes: [
      {
        title: "Checkpoint 1: Foundations and Scrum",
        durationMin: 15,
        passingScore: 70,
        questions: [
          {
            type: "MCQ",
            question: "Who is accountable for ordering the product backlog in Scrum?",
            options: ["The Product Owner", "The Scrum Master", "The Developers", "The project sponsor"],
            correctAnswer: "The Product Owner",
          },
          {
            type: "MCQ",
            question: "What is the purpose of the Sprint Retrospective?",
            options: [
              "To inspect and improve how the team works",
              "To demonstrate the increment to stakeholders",
              "To plan the work for the next sprint",
              "To report progress to management",
            ],
            correctAnswer: "To inspect and improve how the team works",
          },
          {
            type: "MCQ",
            question: "Which user story is best formed?",
            options: [
              "As a course tutor, I want to export attendance to CSV, so that I can submit records to the registry",
              "As a user, I want the export feature",
              "Build a CSV export function for attendance",
              "As a developer, I want to refactor the attendance module",
            ],
            correctAnswer:
              "As a course tutor, I want to export attendance to CSV, so that I can submit records to the registry",
          },
          {
            type: "MCQ",
            question: "What is the critical path in a schedule?",
            options: [
              "The sequence of dependent tasks that determines the earliest possible finish",
              "The list of tasks assigned to the most senior staff",
              "The tasks with the highest risk ratings",
              "The most expensive tasks in the budget",
            ],
            correctAnswer:
              "The sequence of dependent tasks that determines the earliest possible finish",
          },
          {
            type: "TRUE_FALSE",
            question:
              "The Daily Scrum is a status report delivered by the team to the Scrum Master.",
            correctAnswer: "false",
          },
          {
            type: "TRUE_FALSE",
            question:
              "Estimating in ranges is more honest than committing to a single-number estimate.",
            correctAnswer: "true",
          },
        ],
      },
      {
        title: "Final Assessment: Flow and Delivery",
        durationMin: 20,
        passingScore: 70,
        questions: [
          {
            type: "MCQ",
            question: "Why do Kanban teams limit work in progress?",
            options: [
              "Starting less finishes more, because switching and queuing waste capacity",
              "It reduces the number of people needed on the team",
              "It makes the board easier to read",
              "It allows more accurate long-term estimates",
            ],
            correctAnswer:
              "Starting less finishes more, because switching and queuing waste capacity",
          },
          {
            type: "MCQ",
            question:
              "According to Little's Law, what is the most direct way to reduce average lead time?",
            options: [
              "Reduce the amount of work in progress",
              "Increase the size of the team",
              "Extend the length of each sprint",
              "Add more columns to the board",
            ],
            correctAnswer: "Reduce the amount of work in progress",
          },
          {
            type: "MCQ",
            question: "What does continuous delivery mean?",
            options: [
              "Every change that passes the pipeline is in a deployable state",
              "Code is deployed to production automatically without any testing",
              "The team releases on a fixed quarterly schedule",
              "Developers work without branches of any kind",
            ],
            correctAnswer: "Every change that passes the pipeline is in a deployable state",
          },
          {
            type: "MCQ",
            question:
              "Which pairing of work type and method is most appropriate?",
            options: [
              "Continuous, interrupt-driven support work suits Kanban",
              "Continuous, interrupt-driven support work suits fixed two-week sprints",
              "Exploratory product development suits a detailed waterfall plan",
              "Regulated construction work suits an emergent backlog",
            ],
            correctAnswer: "Continuous, interrupt-driven support work suits Kanban",
          },
          {
            type: "TRUE_FALSE",
            question:
              "Research on delivery performance shows that speed and stability tend to improve together rather than trading off.",
            correctAnswer: "true",
          },
          {
            type: "TRUE_FALSE",
            question:
              "A user story is complete without acceptance criteria as long as the team discussed it verbally.",
            correctAnswer: "false",
          },
        ],
      },
    ],
  },
];
