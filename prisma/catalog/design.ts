import { PDFS, yt, ytThumb, type SeedCourse } from "./types";

export const DESIGN_COURSES: SeedCourse[] = [
  {
    title: "UI/UX Design Fundamentals",
    category: "Design",
    price: 299,
    featured: true,
    thumbnailUrl: ytThumb("c9Wg6Cb_YlU"),
    description:
      "A professional UX design programme. Learn research, information architecture, wireframing, usability heuristics, accessibility and visual hierarchy — with University of Washington design guides, Stanford design-thinking readings, quizzes and a real usability redesign project.",
    modules: [
      {
        title: "Understanding the People You Design For",
        lessons: [
          {
            title: "What UX design really involves",
            durationMin: 90,
            videoUrl: yt("kbZejnPXyLM"),
            pdfUrl: PDFS.stanfordDesignThinking,
            content: `User experience design is the practice of making something useful, usable and worth using. Visual polish is the last ten percent, not the job.

The stages of a typical project:
1. Discover. Who are the users, what are they trying to achieve, and where does the current solution fail them?
2. Define. Turn observations into a clear problem statement. "Users abandon checkout because they cannot see delivery cost until step four" is a problem you can solve. "The checkout is bad" is not.
3. Ideate. Produce several distinct approaches before committing to one. The first idea is rarely the best one.
4. Prototype. Build the cheapest thing that can be tested — a sketch on paper is often enough.
5. Test. Watch real people attempt real tasks. Then repeat.

Two ideas to internalise now:
- You are not your user. Your fluency with the product makes you the worst possible judge of whether it is obvious.
- Every design decision is a hypothesis. Testing turns opinion into evidence, and it settles arguments that would otherwise be won by whoever is most senior.`,
          },
          {
            title: "Research methods that fit a small budget",
            durationMin: 40,
            content: `You do not need a research department. You need five users and a willingness to watch them struggle.

Methods, cheapest first:
- Usability testing. Give five people a realistic task, ask them to think aloud, and say nothing while they work. Five users typically expose most of the serious problems.
- Contextual interviews. Ask people to show you how they currently do the task, in their own environment, with their own tools. What people do and what they say they do are different.
- Analytics review. Where do people drop off, what do they search for, which features are never touched.
- Support tickets and reviews. A free, continuously updated list of everything that frustrates your users.
- Surveys. Useful for scale, weak for insight. Good for "how many", poor for "why".

Interviewing rules that make the difference:
- Ask about past behaviour, not future intentions. "Tell me about the last time you booked a ticket" beats "would you use this feature?"
- Never ask a leading question. "How easy was that?" contaminates the answer; "what were you thinking there?" does not.
- Embrace silence. The insight usually comes after the pause you were tempted to fill.

Deliverable for this lesson: write five task-based test questions for a product you use daily.`,
          },
          {
            title: "The ten usability heuristics",
            durationMin: 25,
            videoUrl: yt("hWc0Fd2AS3s"),
            pdfUrl: PDFS.usabilityHeuristics,
            content: `Jakob Nielsen's ten heuristics have been the standard evaluation checklist since 1994 because they keep being right.

The list:
1. Visibility of system status — always tell the user what is happening.
2. Match between the system and the real world — use the user's language, not internal jargon.
3. User control and freedom — provide an obvious exit, undo and cancel.
4. Consistency and standards — do not reinvent conventions people already know.
5. Error prevention — make dangerous mistakes hard to commit in the first place.
6. Recognition rather than recall — show options instead of requiring memory.
7. Flexibility and efficiency of use — shortcuts for experts, simple paths for novices.
8. Aesthetic and minimalist design — every extra element competes with the important ones.
9. Help users recognise, diagnose and recover from errors — say what went wrong and how to fix it.
10. Help and documentation — findable, task-focused, concise.

How to use them: pick any screen of any product, go through all ten, and write down every violation with a severity rating. This is called a heuristic evaluation, it takes an hour, and it consistently finds real problems before any user is involved.

The attached summary from Nielsen Norman Group is the canonical one-page reference.`,
          },
        ],
      },
      {
        title: "Structure, Flow and Wireframes",
        lessons: [
          {
            title: "Information architecture and user flows",
            durationMin: 45,
            content: `Before pixels, decide what goes where and how people move between things.

Information architecture is the organisation of content:
- Group content by how users think about it, not by how your organisation is structured.
- Use card sorting to find those groupings: write each piece of content on a card and ask users to group and name the piece.
- Keep navigation shallow. If something takes more than three steps to reach, it is effectively hidden.
- Label with plain words. "Resources" and "Solutions" mean nothing; "Pricing" and "Help" mean something.

A user flow is the path through a task. Draw it as boxes and arrows before designing screens:

Landing page → Search → Results list → Item detail → Add to basket → Checkout → Confirmation

For each step, ask three questions: what does the user need to know here, what could go wrong, and what is the one action I want them to take? Design the error and empty states at the same time as the happy path — this is the step most beginners skip and most real users encounter.

Deliverable: draw the complete flow for one core task in your chosen product, including at least two failure branches.`,
          },
          {
            title: "Wireframing and prototyping in Figma",
            durationMin: 150,
            videoUrl: yt("c9Wg6Cb_YlU"),
            content: `Wireframes are deliberately ugly. Greyscale boxes force conversations about structure and priority rather than colour.

Follow this complete tutorial and build the project. Along the way, note the working method:
- Low fidelity first. Sketch on paper or in simple boxes. Throw away the first three.
- Establish hierarchy before decoration. What must the eye land on first, second and third?
- Use real content, or at least realistic content. Lorem ipsum hides the fact that your beautiful card breaks with a 60-character product name.
- Design the smallest screen first. If it works at 375px it will work anywhere.
- Link the frames into a clickable prototype. A prototype people can tap teaches you more in ten minutes than a static mockup does in a week.

Deliverable: a clickable prototype of at least six connected screens covering one complete task.`,
          },
          {
            title: "Designing for accessibility",
            durationMin: 40,
            videoUrl: yt("20SHvU2PKsM"),
            content: `Roughly one in six people lives with a disability. Accessible design also helps everyone else — captions in a noisy room, high contrast in bright sunlight, large tap targets on a moving bus.

Design decisions that carry the most weight:
- Contrast. Body text needs a ratio of at least 4.5:1 against its background, large text at least 3:1. Check it with a contrast checker while choosing colours, not after.
- Never use colour alone to convey meaning. Add an icon, a label or a pattern.
- Tap targets of at least 44 by 44 pixels, with space between them.
- Visible focus states. Designers frequently remove focus outlines because they are ugly; this makes the product unusable by keyboard.
- Real text rather than text baked into images, so it can be zoomed, translated and read aloud.
- Form labels that are always visible, not placeholders that vanish when typing starts.
- Meaningful heading structure, so screen reader users can navigate by heading.

Design for motion sensitivity too: give a way to reduce animation, and never auto-play anything that flashes.

Deliverable: audit your prototype against these seven points and fix every failure.`,
          },
        ],
      },
      {
        title: "Visual Craft",
        lessons: [
          {
            title: "Typography for interfaces",
            durationMin: 25,
            videoUrl: yt("sByzHoiYFX0"),
            content: `Most of an interface is text, so typography is most of the design.

Rules that fix the majority of amateur work:
- Two typefaces maximum, and one is usually better. Use weight and size for variety instead.
- Body text at 16px minimum on the web. Anything smaller is a barrier.
- Line height around 1.5 for body text, tighter for large headings.
- Line length of 45 to 75 characters. Long lines make readers lose their place.
- Build a type scale rather than choosing sizes at random: for example 12, 14, 16, 20, 24, 32, 48.
- Align text left for long passages. Centred text is harder to read beyond a couple of lines, and justified text creates ugly rivers of white space.
- Limit weights to two or three, and use genuine bold rather than faux bold.

Hierarchy is the point of all of this. A reader should be able to scan a page and understand its structure without reading a word, purely from size, weight and spacing.`,
          },
          {
            title: "Layout, spacing and visual hierarchy",
            durationMin: 30,
            videoUrl: yt("QrNi9FmdlxY"),
            pdfUrl: PDFS.visualDesignGuide,
            content: `Four principles explain why one layout feels professional and another feels homemade.

- Proximity. Related items go close together; unrelated items get space. Most cluttered designs are a proximity problem, not a colour problem.
- Alignment. Every element should line up with something else. Invisible lines create visible order.
- Contrast. If two things are different, make them clearly different. Timid differences look like mistakes.
- Repetition. Reuse the same spacing, sizes and styles throughout. Consistency is what makes a product feel designed.

Use a spacing scale based on a single unit, usually 4 or 8 pixels: 4, 8, 12, 16, 24, 32, 48, 64. Never pick 13px because it looked right; pick from the scale.

White space is not wasted space. It is the tool that makes the important elements important.

The attached guide from the University of Washington is a compact reference on visual design and colour that works equally well for interfaces, posters and presentations.`,
          },
        ],
      },
      {
        title: "Projects and Capstone",
        lessons: [
          {
            title: "Project 1: Heuristic evaluation and redesign",
            durationMin: 180,
            content: `Choose a real product with genuine usability problems — a government service, a university portal, a local business site.

Requirements:
- Evaluate one core task against all ten usability heuristics.
- Document every issue with a screenshot, the heuristic it violates, and a severity rating from 1 to 4.
- Rank the issues by severity multiplied by frequency.
- Redesign the three worst problems as annotated before-and-after screens.
- Explain each change in one sentence linking it back to the heuristic.

Acceptance criteria:
- At least eight distinct issues identified.
- Every proposed change addresses a documented problem rather than personal taste.
- The redesign preserves what already worked; you have not rebuilt the whole product for the sake of it.`,
          },
          {
            title: "Project 2: Run a usability test with five people",
            durationMin: 240,
            content: `Watch real humans use your prototype. This is the lesson that changes designers permanently.

Requirements:
- Write a test plan: three to five realistic tasks, phrased as goals rather than instructions. Say "buy a birthday gift under 200 cedis", not "click the Gifts menu".
- Recruit five participants who are not designers and not your close friends.
- Run each session for 20 to 30 minutes. Ask them to think aloud. Do not help, do not explain, do not defend.
- Record what happened: where they hesitated, what they said, where they went wrong, and where they succeeded but slowly.
- Compile findings into a prioritised list with direct quotes.
- Iterate the prototype and note what you changed.

Acceptance criteria:
- Notes are observations, not interpretations. "Participant scrolled past the button three times" not "the button is bad".
- At least one finding genuinely surprised you.
- The report separates severity from frequency and recommends what to fix first.`,
          },
          {
            title: "Capstone: End-to-end product design case study",
            durationMin: 420,
            content: `Produce the case study that will be the centrepiece of your portfolio.

Requirements:
- A real problem, clearly stated, with evidence that it exists.
- Research: at least three interviews or a competitive analysis of three products, summarised.
- Definition: personas or job stories, and a problem statement.
- Ideation: several distinct approaches, with a reasoned explanation of the one you chose.
- Wireframes progressing to high-fidelity screens.
- A clickable prototype covering the full core journey, including empty, loading and error states.
- Accessibility checked: contrast, focus, tap targets, labels.
- A usability test with at least three participants, and documented iterations from what you learned.
- A written case study with the problem, process, decisions, outcome and what you would do next.

Acceptance criteria:
- The case study shows your thinking, not just your final screens. Employers hire the reasoning.
- Every major design decision has a stated reason.
- The failures and dead ends are included. A case study with no mistakes reads as fiction.

How to submit: publish the case study and share the link along with the prototype URL.`,
          },
        ],
      },
    ],
    quizzes: [
      {
        title: "Checkpoint 1: Users and Usability",
        durationMin: 15,
        passingScore: 70,
        questions: [
          {
            type: "MCQ",
            question:
              "Which usability heuristic is violated when a form deletes everything a user typed after a validation error?",
            options: [
              "User control and freedom",
              "Aesthetic and minimalist design",
              "Match between the system and the real world",
              "Flexibility and efficiency of use",
            ],
            correctAnswer: "User control and freedom",
          },
          {
            type: "MCQ",
            question: "Which interview question is most likely to produce reliable insight?",
            options: [
              "Tell me about the last time you booked a ticket online",
              "Would you use a feature that saved your payment details?",
              "How easy did you find that?",
              "Do you like this design?",
            ],
            correctAnswer: "Tell me about the last time you booked a ticket online",
          },
          {
            type: "MCQ",
            question: "During a usability test, what should the facilitator do when a user gets stuck?",
            options: [
              "Stay quiet and observe what the user tries next",
              "Explain where the correct button is",
              "Apologise and move on to the next task",
              "Point out that the design is still a prototype",
            ],
            correctAnswer: "Stay quiet and observe what the user tries next",
          },
          {
            type: "TRUE_FALSE",
            question:
              "Testing with about five users typically uncovers the majority of serious usability problems.",
            correctAnswer: "true",
          },
          {
            type: "TRUE_FALSE",
            question:
              "Because designers use the product constantly, they are well placed to judge whether it is intuitive for new users.",
            correctAnswer: "false",
          },
        ],
      },
      {
        title: "Final Assessment: Craft and Accessibility",
        durationMin: 20,
        passingScore: 70,
        questions: [
          {
            type: "MCQ",
            question: "What is the minimum recommended contrast ratio for normal body text?",
            options: ["4.5:1", "2:1", "3:1", "7:1"],
            correctAnswer: "4.5:1",
          },
          {
            type: "MCQ",
            question:
              "Elements that belong together should be placed close together. Which principle is this?",
            options: ["Proximity", "Alignment", "Repetition", "Contrast"],
            correctAnswer: "Proximity",
          },
          {
            type: "MCQ",
            question: "Why is a comfortable line length of 45 to 75 characters recommended?",
            options: [
              "Longer lines make readers lose their place when returning to the left margin",
              "Shorter lines use less bandwidth",
              "Search engines rank shorter lines higher",
              "It is required by accessibility law",
            ],
            correctAnswer:
              "Longer lines make readers lose their place when returning to the left margin",
          },
          {
            type: "MCQ",
            question:
              "Why should placeholder text not be used as a substitute for a form label?",
            options: [
              "It disappears once the user starts typing, removing the field's context",
              "It cannot be styled with CSS",
              "It is not supported on mobile browsers",
              "It slows down form submission",
            ],
            correctAnswer:
              "It disappears once the user starts typing, removing the field's context",
          },
          {
            type: "TRUE_FALSE",
            question:
              "Removing the focus outline from buttons improves the design without harming usability.",
            correctAnswer: "false",
          },
          {
            type: "TRUE_FALSE",
            question:
              "A consistent spacing scale, such as multiples of four or eight pixels, makes a layout feel more deliberate than choosing values ad hoc.",
            correctAnswer: "true",
          },
        ],
      },
    ],
  },

  {
    title: "Figma and Design Systems for Product Teams",
    category: "Design",
    price: 349,
    thumbnailUrl: ytThumb("jwCmIBJ8Jtc"),
    description:
      "A professional Figma programme for product teams. Master frames, auto layout, components, variants and styles, design a responsive multi-page site, then ship a reusable design system with clean developer handoff — including quizzes and portfolio projects.",
    modules: [
      {
        title: "Figma Foundations",
        lessons: [
          {
            title: "Getting productive in Figma fast",
            durationMin: 25,
            videoUrl: yt("FTFaQWZBqQ8"),
            content: `Figma is free for individuals, runs in the browser and is the industry standard. This short lesson gets you dangerous quickly.

The objects you work with:
- Frames are containers, and they are also artboards. Nest them freely.
- Shapes, text and images are the raw material.
- Groups bundle things loosely; frames bundle them with layout rules. Prefer frames.

Shortcuts that pay for themselves in a day:
F for frame, R for rectangle, T for text, V for move, K for scale, Shift+A to wrap in auto layout, Ctrl+D to duplicate, Alt while dragging to duplicate in place, Ctrl+G to group, and holding Alt while hovering to measure distance between elements.

Set up a working file: create one page for exploration, one for the current design, and one for the design system. Keeping exploration visible but separate makes your process reviewable.`,
          },
          {
            title: "The complete Figma course for UI design",
            durationMin: 180,
            videoUrl: yt("jwCmIBJ8Jtc"),
            content: `A thorough, hands-on course. Build the project as you go.

The concepts that matter most, in order of how much time they will save you:

1. Auto layout. This is the single most important feature. It makes frames behave like CSS Flexbox — items space themselves, containers resize with content, and padding stays consistent. Once you use auto layout everywhere, editing designs stops being tedious.

2. Constraints and resizing. Set how children behave when a frame changes size, so your designs respond rather than break.

3. Components. Design an element once, reuse it everywhere, change it in one place. Anything appearing more than twice should be a component.

4. Variants. Bundle the states of a component — default, hover, disabled, loading — into one component with switchable properties.

5. Styles. Save colours, text styles and effects as named styles. This is where a design system begins.

Practice as you learn: rebuild the interface of an app on your phone, screen by screen, using auto layout and components throughout.`,
          },
        ],
      },
      {
        title: "Designing Real Screens",
        lessons: [
          {
            title: "Designing a complete website from start to finish",
            durationMin: 180,
            videoUrl: yt("HZuk6Wkx_Eg"),
            content: `Watching a professional make decisions in real time is worth more than any list of tips.

As you follow along, pay attention to the order of work rather than the individual clicks:
- Content and structure first, styling second.
- The grid and spacing system established before any component is drawn.
- Type scale and colour palette decided early and then obeyed.
- Sections built as reusable blocks rather than one-off drawings.
- Responsive variants designed deliberately, not resized at the end.

Copy the process, not the visual style. Then apply the same process to a different subject — a restaurant, a clinic, a school — so you are practising the method rather than reproducing the result.`,
          },
          {
            title: "Prototyping and design handoff",
            durationMin: 45,
            videoUrl: yt("3q3FV65ZrUs"),
            content: `A design that developers cannot build accurately is an unfinished design.

Prototyping in Figma:
- Connect frames in Prototype mode. Use Smart Animate for transitions between similar frames.
- Overlays for modals, dropdowns and toasts.
- Interactive components so hover and pressed states work inside the prototype.
- Share a link and gather comments directly on the canvas.

Handoff that developers appreciate:
- Name layers meaningfully. "Rectangle 47" tells nobody anything; "card/header/title" does.
- Use styles and variables for every colour and text size, so developers get tokens rather than hex codes scattered across screens.
- Design all the states: default, hover, focus, active, disabled, loading, empty, error. Missing states are the main source of "the developer guessed" bugs.
- Annotate anything not visually obvious: what happens on submit, what the maximum character count is, what appears when the list is empty.
- Provide the responsive behaviour explicitly, at the breakpoints the team actually builds for.

A useful test: hand your file to someone who was not in the meeting and ask them to describe how the feature works. Every question they ask is a gap in your handoff.`,
          },
        ],
      },
      {
        title: "Systems That Scale",
        lessons: [
          {
            title: "Building a design system in Figma",
            durationMin: 60,
            videoUrl: yt("EK-pHkc5EL4"),
            content: `A design system is the shared vocabulary of a product: tokens, components and the rules for using them.

Build it in layers:

1. Foundations. Colour palette with semantic names (primary, surface, danger) rather than literal ones (blue, grey, red). A type scale. A spacing scale. Corner radii. Shadows. Save each as a Figma style or variable.

2. Components. Buttons, inputs, selects, checkboxes, cards, badges, avatars, modals, tables. Each with full variants for every state and size.

3. Patterns. Combinations that recur — a form layout, an empty state, a page header, a data table with filters.

4. Documentation. For each component: when to use it, when not to use it, and the rules. A button component with no guidance produces six inconsistent uses.

The discipline that makes it work: semantic naming. When a colour is called "primary" rather than "blue-600", rebranding means changing one variable instead of every screen. When a spacing token is called "space-4", designers and developers use the same word for the same thing.

Deliverable: a foundations page with your colour, type and spacing tokens, plus five fully variant-ed components.`,
          },
        ],
      },
      {
        title: "Projects and Capstone",
        lessons: [
          {
            title: "Project 1: Component library",
            durationMin: 240,
            content: `Build a reusable component library you could hand to a development team tomorrow.

Requirements:
- Foundations: at least eight semantic colour tokens, a six-step type scale, a spacing scale, and radius and shadow tokens.
- At least ten components, each built with auto layout and each with variants covering size and state.
- A button component with, at minimum: primary, secondary and ghost styles; small, medium and large sizes; and default, hover, focused, disabled and loading states.
- Every component named consistently using a slash convention.
- A documentation frame beside each component stating its purpose and usage rules.

Acceptance criteria:
- Changing a foundation token updates every component that uses it.
- No component contains a hard-coded colour or font size.
- Resizing any component keeps its padding and alignment intact.`,
          },
          {
            title: "Project 2: Responsive multi-page website design",
            durationMin: 300,
            content: `Design a complete site for a real organisation using only your own component library.

Requirements:
- At least five pages: home, a listing page, a detail page, a form page and a content page.
- Desktop, tablet and mobile versions of every page.
- Built entirely from your library components; anything new gets added to the library first.
- A clickable prototype linking the pages into at least two complete journeys.
- All states designed: loading, empty, error and success.

Acceptance criteria:
- Visual consistency holds across all pages without manual adjustment.
- Every text style and colour comes from a defined style.
- The mobile design is a deliberate design, not a squashed desktop.
- Contrast passes accessibility requirements throughout.`,
          },
          {
            title: "Capstone: Design system with documented handoff",
            durationMin: 420,
            content: `Deliver a design system and a product built on it, packaged for a real engineering team.

Requirements:
- A published Figma library, shared and versioned.
- Foundations, components, patterns and written documentation.
- A product design of at least eight screens built entirely from the system.
- A handoff document covering naming conventions, token values, responsive rules and interaction specifications.
- A contribution guide explaining how a designer proposes a new component.
- A short recorded walkthrough or a written tour explaining the system to a newcomer.

Acceptance criteria:
- A developer can extract every token value without asking you a question.
- Every component in the product screens is an instance from the library, not a detached copy.
- The documentation answers "when should I not use this?" for each major component.
- The system survives a test change: swap the primary colour and confirm the entire product updates coherently.

How to submit: share the Figma community link or a view-only file link, plus the handoff document.`,
          },
        ],
      },
    ],
    quizzes: [
      {
        title: "Checkpoint 1: Figma Craft",
        durationMin: 15,
        passingScore: 70,
        questions: [
          {
            type: "MCQ",
            question:
              "Which Figma feature makes a frame space and resize its children automatically, similar to CSS Flexbox?",
            options: ["Auto layout", "Constraints", "Grouping", "Boolean operations"],
            correctAnswer: "Auto layout",
          },
          {
            type: "MCQ",
            question: "What is the purpose of component variants?",
            options: [
              "To bundle the states and sizes of one component into a single switchable component",
              "To create a backup copy of a component",
              "To convert a component into plain shapes",
              "To apply a colour style across multiple pages",
            ],
            correctAnswer:
              "To bundle the states and sizes of one component into a single switchable component",
          },
          {
            type: "MCQ",
            question: "When should an element be turned into a component?",
            options: [
              "When it appears more than twice or is likely to change",
              "Only when the design is finished",
              "Only if it contains text",
              "Never — components make files harder to edit",
            ],
            correctAnswer: "When it appears more than twice or is likely to change",
          },
          {
            type: "TRUE_FALSE",
            question:
              "Detaching a component instance and editing it directly is the recommended way to make a one-off variation.",
            correctAnswer: "false",
          },
          {
            type: "TRUE_FALSE",
            question:
              "Meaningful layer names make developer handoff significantly easier than default names such as Rectangle 47.",
            correctAnswer: "true",
          },
        ],
      },
      {
        title: "Final Assessment: Systems and Handoff",
        durationMin: 20,
        passingScore: 70,
        questions: [
          {
            type: "MCQ",
            question: "Why are semantic colour names such as primary preferred over literal names such as blue-600?",
            options: [
              "Rebranding or theming requires changing one token instead of every screen",
              "Semantic names render faster in the browser",
              "Literal names are not supported by Figma variables",
              "Semantic names automatically pass contrast requirements",
            ],
            correctAnswer:
              "Rebranding or theming requires changing one token instead of every screen",
          },
          {
            type: "MCQ",
            question: "Which set of states is most commonly missing from handoff and causes developer guesswork?",
            options: [
              "Loading, empty and error states",
              "Desktop layouts",
              "The default state of a button",
              "The colour palette",
            ],
            correctAnswer: "Loading, empty and error states",
          },
          {
            type: "MCQ",
            question: "What belongs in the documentation for a component?",
            options: [
              "When to use it, when not to use it, and the rules for its variants",
              "The number of layers it contains",
              "The date it was created",
              "The designer's personal notes about alternative ideas",
            ],
            correctAnswer:
              "When to use it, when not to use it, and the rules for its variants",
          },
          {
            type: "TRUE_FALSE",
            question:
              "A well-built design system lets you change one foundation token and see every dependent component update.",
            correctAnswer: "true",
          },
          {
            type: "TRUE_FALSE",
            question:
              "A mobile design should simply be the desktop layout scaled down to fit a narrower screen.",
            correctAnswer: "false",
          },
        ],
      },
    ],
  },
];
