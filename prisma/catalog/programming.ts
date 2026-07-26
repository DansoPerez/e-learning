import { PDFS, yt, ytThumb, type SeedCourse } from "./types";

export const PROGRAMMING_COURSES: SeedCourse[] = [
  {
    title: "Modern Web Development: HTML, CSS and JavaScript",
    category: "Programming",
    featured: true,
    thumbnailUrl: ytThumb("PkZNo7MFNFg"),
    description:
      "Build and publish real websites from scratch. You will learn semantic HTML, modern CSS layout with Flexbox and Grid, responsive design, JavaScript fundamentals, DOM scripting and fetching live data from APIs — then ship three portfolio projects with Git and free hosting.",
    modules: [
      {
        title: "How the Web Actually Works",
        lessons: [
          {
            title: "What happens when you open a website",
            durationMin: 30,
            videoUrl: yt("iYM2zFP3Zn0"),
            content: `Before writing a single line of code, you need a mental model of the machine you are programming.

When you type an address into a browser, four things happen in sequence:
- DNS translates the domain name into an IP address.
- Your browser opens a connection to that server and sends an HTTP request.
- The server replies with an HTTP response containing HTML, plus a status code such as 200 or 404.
- The browser parses the HTML, requests the CSS, images and JavaScript it references, and paints the page.

Watch the video, then open any website and press F12 to open developer tools. Go to the Network tab and reload the page. You will see every single request the browser made, its status code, and how long it took.

Things to notice in the Network tab:
- The very first request is the HTML document itself.
- Every stylesheet, font, image and script is a separate request.
- Status 200 means success, 301/302 are redirects, 404 means not found, 500 means the server broke.

By the end of this lesson you should be able to explain, out loud, the journey from typing an address to seeing pixels.`,
          },
          {
            title: "Setting up your development environment",
            durationMin: 25,
            pdfUrl: PDFS.vsCodeShortcuts,
            content: `You need three tools, and all of them are free.

1. A code editor. Install Visual Studio Code from code.visualstudio.com. Add these extensions: Live Server (instant preview in the browser), Prettier (automatic formatting) and Auto Rename Tag.

2. A modern browser with developer tools. Chrome, Edge or Firefox all work. You will live in the Elements and Console panels.

3. A project folder. Create a folder called web-projects somewhere sensible, and inside it a folder for each project. Never work from your Downloads folder.

Create your first file now. Make a folder called hello-web, add a file named index.html, and paste this in:

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Hello Web</title>
  </head>
  <body>
    <h1>It works</h1>
  </body>
</html>

Right-click the file in VS Code and choose "Open with Live Server". Your browser opens and the page appears. Edit the heading text, save, and watch it update automatically.

The attached PDF is the official VS Code keyboard shortcut reference. Learn five shortcuts this week — multi-cursor editing alone will save you hours.`,
          },
          {
            title: "HTML foundations: elements, attributes and structure",
            durationMin: 90,
            videoUrl: yt("kUMe1FH4CHE"),
            content: `HTML describes meaning and structure, not appearance. Every page is a tree of elements.

Core ideas to take from this tutorial:
- An element is usually an opening tag, content, and a closing tag: <p>text</p>. Some elements are void and have no closing tag, like <img> and <input>.
- Attributes configure an element: <a href="https://example.com">, <img src="cat.jpg" alt="A sleeping cat">.
- Every document has a head (metadata the user does not see) and a body (what is rendered).
- Nesting must be balanced. <p><strong>bold</strong></p> is valid; <p><strong>bold</p></strong> is not.

The elements you will use constantly: h1 to h6, p, a, img, ul, ol, li, div, span, header, nav, main, section, article, footer, form, input, button, table.

Practice task: rebuild the front page of a news site you like using only HTML — no styling at all. It will look plain and ugly. That is correct. You are practising structure.`,
          },
        ],
      },
      {
        title: "Writing HTML That Works for Everyone",
        lessons: [
          {
            title: "Semantic HTML and page structure",
            durationMin: 120,
            videoUrl: yt("pQN-pnXPaVg"),
            content: `A div says nothing. A nav says "this is the site navigation". Search engines, screen readers and your future self all benefit from elements that describe their own purpose.

Use the semantic element when one exists:
- header for introductory content, nav for major navigation blocks
- main for the unique content of the page (only one per page)
- article for self-contained content such as a blog post
- section for a thematic grouping, usually with a heading
- aside for tangential content, footer for closing content

Heading levels are an outline, not a font size. Use exactly one h1 per page, and never skip from h2 to h4 because you liked the size — that is what CSS is for.

Follow along and build the complete website in the video. Then audit your own page: view it in the browser, open developer tools, and check that the document outline makes sense when you read only the headings.`,
          },
          {
            title: "Forms, inputs and validation",
            durationMin: 70,
            videoUrl: yt("qz0aGYrrlhU"),
            content: `Forms are how the web collects data, and they have more built-in power than most beginners realise.

Key points:
- Every input should have a label tied to it with the for attribute matching the input id. This is not optional — it is how screen reader users and people tapping on small screens hit the right field.
- The type attribute changes both validation and the on-screen keyboard on mobile: email, tel, number, date, url, password.
- required, minlength, maxlength, min, max and pattern give you free client-side validation with no JavaScript.
- Wrap related controls in fieldset with a legend.

Never trust client-side validation for security. It is a convenience for honest users; the server must validate everything again.

Practice task: build a contact form with name, email, subject dropdown, message textarea and a submit button. Make it impossible to submit without a valid email address, using only HTML attributes.`,
          },
          {
            title: "Accessibility from the first line of code",
            durationMin: 40,
            videoUrl: yt("20SHvU2PKsM"),
            content: `Accessibility is not a feature you add at the end. It is a consequence of writing HTML properly, and it is a legal requirement in many countries.

The highest-impact habits, in order:
- Write meaningful alt text on images. If an image is purely decorative, use alt="" so screen readers skip it.
- Make sure every interactive element is reachable with the Tab key, and that you can see where focus is.
- Use real button and a elements instead of clickable divs. You get keyboard support and semantics for free.
- Keep colour contrast at 4.5:1 or better for normal text.
- Do not rely on colour alone to communicate meaning — add an icon or text label.

Test your own page right now: put your mouse away and navigate the whole page with Tab, Shift+Tab and Enter. If you cannot reach or activate something, it is broken.

This W3C introduction explains the standards behind these rules and who they serve.`,
          },
        ],
      },
      {
        title: "Styling and Layout with Modern CSS",
        lessons: [
          {
            title: "CSS fundamentals: selectors, cascade and the box model",
            durationMin: 25,
            videoUrl: yt("1PnVor36_40"),
            content: `CSS has three ideas that explain almost everything confusing about it.

1. Selectors and specificity. When two rules target the same element, the more specific one wins. An id beats a class, a class beats an element tag. When specificity ties, the rule written later wins. This is the cascade.

2. The box model. Every element is a box made of content, padding, border and margin. By default, width applies only to the content, which surprises everyone. Fix it once at the top of every stylesheet:

*, *::before, *::after { box-sizing: border-box; }

3. Inheritance. Some properties (colour, font-family, line-height) flow down to children automatically. Most (padding, border, background) do not.

After the video, open developer tools, select any element, and look at the Computed and Styles panels. You can see exactly which rule won and which were crossed out.`,
          },
          {
            title: "One-dimensional layout with Flexbox",
            durationMin: 20,
            videoUrl: yt("fYq5PXgSsbE"),
            content: `Flexbox lays items out along a single axis — a row or a column. It is the right tool for navigation bars, button groups, card footers and centring things.

The properties that do 90 percent of the work:
- display: flex on the parent turns its direct children into flex items.
- flex-direction: row or column sets the main axis.
- justify-content aligns items along the main axis (flex-start, center, space-between, space-around).
- align-items aligns items across the cross axis (stretch, center, flex-start).
- gap adds space between items without margin hacks.
- flex: 1 on a child tells it to absorb the remaining space.

The classic problem, solved: to centre anything perfectly, put display: flex; justify-content: center; align-items: center on the parent.

Practice task: build a responsive navigation bar with a logo on the left and links on the right using nothing but Flexbox.`,
          },
          {
            title: "Two-dimensional layout with CSS Grid",
            durationMin: 25,
            videoUrl: yt("9zBsdzdE4sM"),
            content: `Grid handles rows and columns at the same time. Reach for it when you are laying out a whole page or a gallery of cards.

Core properties:
- display: grid on the parent.
- grid-template-columns defines the columns. repeat(3, 1fr) makes three equal columns; the fr unit means "one share of the free space".
- grid-template-rows does the same for rows.
- gap sets the gutters.
- grid-column: span 2 makes an item straddle two columns.

The single most useful line of CSS you will learn this week is a responsive card grid with no media queries at all:

grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));

That tells the browser to fit as many columns as it can, each at least 250px wide, and share the leftover space equally.

Rule of thumb: Grid for the page skeleton, Flexbox for the contents of each region.`,
          },
          {
            title: "Responsive design and mobile-first CSS",
            durationMin: 35,
            videoUrl: yt("srvUrASNj0s"),
            content: `More than half of web traffic is on phones. Responsive design is the default, not an extra.

Start with these three:
- Put <meta name="viewport" content="width=device-width, initial-scale=1"> in the head, or mobile browsers will pretend to be desktop and shrink your page.
- Write mobile styles first, then add min-width media queries to enhance for larger screens. Small screens are the constrained case; design for them first and the layout grows naturally.
- Use relative units. rem for font sizes and spacing, percentages and fr for widths, and max-width to stop content becoming unreadably wide.

A minimal breakpoint set that covers most sites:

@media (min-width: 640px) { }
@media (min-width: 1024px) { }

Do not chase device names. Add a breakpoint at the width where your layout starts to look wrong.

Practice task: take the card grid you built with Grid and check it at 320px, 768px and 1440px using the device toolbar in developer tools.`,
          },
          {
            title: "Deep dive: the complete CSS course",
            durationMin: 180,
            videoUrl: yt("1Rs2ND1ryYc"),
            content: `This is the long-form reference lesson. Work through it over several sittings rather than in one go.

Sections worth your full attention:
- Positioning: static, relative, absolute, fixed and sticky, and what "positioning context" means.
- Custom properties (CSS variables) for theming: define once in :root, reuse everywhere, change in one place.
- Transitions and transforms for interface polish.
- Pseudo-classes such as :hover, :focus-visible, :nth-child and :not.

As you watch, keep a file called notes.css and paste in every snippet you want to remember. By the end of the course you will have built your own reference sheet, which you will use far more than any tutorial.`,
          },
        ],
      },
      {
        title: "Making Pages Interactive with JavaScript",
        lessons: [
          {
            title: "JavaScript in context",
            durationMin: 10,
            videoUrl: yt("DHjqpvDnNGE"),
            content: `A two-minute orientation before the deep dive.

JavaScript is the only programming language browsers run natively. It started as a scripting language for form validation in 1995 and now runs servers, mobile apps and build tools.

Three facts that will save you confusion later:
- JavaScript is dynamically typed. A variable can hold a number now and a string later. This is flexible and dangerous in equal measure.
- It is single-threaded but non-blocking. Slow work such as network requests is handed off and handled later through callbacks, promises and async/await.
- JavaScript and Java are unrelated. The name was a marketing decision.

Open the browser console (F12, Console tab) and type 2 + 2, then "hello".toUpperCase(). The console is a full JavaScript environment and it is the fastest place to test an idea.`,
          },
          {
            title: "Core language: variables, functions, arrays and objects",
            durationMin: 200,
            videoUrl: yt("PkZNo7MFNFg"),
            pdfUrl: PDFS.eloquentJavaScript,
            content: `This is the backbone of the course. Watch in chunks and type every example yourself — reading code teaches you far less than writing it.

What you must be comfortable with by the end:
- Declaring values with const and let, and why you should almost never use var.
- Primitive types: string, number, boolean, null, undefined.
- Functions, arrow functions, parameters, return values and scope.
- Arrays and the methods that matter: map, filter, reduce, find, forEach, includes.
- Objects, dot and bracket access, destructuring, and the spread operator.
- Conditionals, loops, and template literals with backticks.
- Truthy and falsy values, and why === is safer than ==.

The attached book, Eloquent JavaScript by Marijn Haverbeke, is a free and genuinely excellent companion. Read chapters 1 to 5 alongside this video and do the exercises at the end of each chapter.

Self-check: without looking anything up, write a function that takes an array of numbers and returns only the even ones, doubled.`,
          },
          {
            title: "The DOM: reading and changing the page",
            durationMin: 45,
            videoUrl: yt("0ik6X4DJKCc"),
            content: `The Document Object Model is the browser's live, editable representation of your HTML. JavaScript changes what users see by changing the DOM.

The pattern you will repeat forever:
1. Select an element: document.querySelector(".btn") or document.querySelectorAll("li").
2. Listen for something: element.addEventListener("click", handleClick).
3. Change something: element.textContent, element.classList.add("active"), element.setAttribute(...).

Important details:
- querySelector takes any CSS selector, which means everything you learned about selectors transfers directly.
- Prefer classList.toggle over rewriting inline styles. Keep appearance in CSS and state in classes.
- Creating elements: document.createElement("li"), set its content, then parent.append(newElement).
- The event object passed to your handler carries event.target — the exact element that was clicked.

Practice task: build a to-do list. Typing in an input and pressing Enter adds an item; clicking an item marks it done; clicking a delete button removes it. No frameworks.`,
          },
          {
            title: "Fetching live data from APIs",
            durationMin: 60,
            videoUrl: yt("WXsD0ZgxjRw"),
            content: `An API lets your page pull real data from somewhere else — weather, currency rates, films, anything.

The modern pattern:

async function loadUsers() {
  const response = await fetch("https://jsonplaceholder.typicode.com/users");
  if (!response.ok) throw new Error("Request failed: " + response.status);
  const users = await response.json();
  return users;
}

What each part means:
- fetch starts a network request and returns a promise.
- await pauses inside an async function until the promise settles.
- response.ok is false for 404 and 500 responses. fetch only rejects on network failure, so you must check the status yourself.
- response.json() parses the body, and is itself asynchronous.

Always handle three states in the interface: loading, success and error. A page that silently does nothing when a request fails feels broken.

Practice task: fetch posts from jsonplaceholder.typicode.com/posts and render the first ten as cards, showing a spinner while loading and a friendly message if the request fails.`,
          },
          {
            title: "JavaScript concepts you will meet in real codebases",
            durationMin: 30,
            videoUrl: yt("lkIFF4maKMU"),
            content: `A rapid tour of the vocabulary that appears in job adverts, code reviews and Stack Overflow answers.

Terms worth being able to define after this lesson:
- Hoisting, closures and the temporal dead zone.
- The event loop, the call stack and the task queue.
- Prototypes and prototypal inheritance.
- this, and how its value depends on how a function is called.
- Modules: import and export.
- Promises, async/await, and error handling with try/catch.
- Pure functions, immutability and side effects.

You do not need to master all of these today. Treat this as a map: when one of these terms appears in later work, you will recognise it and know what to search for.`,
          },
        ],
      },
      {
        title: "Version Control and Shipping Your Work",
        lessons: [
          {
            title: "Git and GitHub for everyday work",
            durationMin: 45,
            videoUrl: yt("SWYqp7iY_Tc"),
            pdfUrl: PDFS.gitCheatSheet,
            content: `Git is how professional developers save work, undo mistakes and collaborate. Learning it now costs a day and saves you a career of pain.

The loop you will use every day:

git status
git add .
git commit -m "Add contact form validation"
git push

The concepts underneath:
- A repository is a project folder with a full history.
- A commit is a labelled snapshot. Commit small and often, with messages that say why, not what.
- A branch is an independent line of work. Make one per feature, merge when it is done.
- A remote (usually GitHub) is a copy of the repository in the cloud.

Set up once:

git config --global user.name "Your Name"
git config --global user.email "you@example.com"

Create a repository on GitHub, push this course's projects to it, and keep pushing. A GitHub profile with real commit history is worth more than a paragraph on a CV.

The attached cheat sheet is GitHub's official one-page reference — print it.`,
          },
          {
            title: "Deploying your site for free",
            durationMin: 30,
            content: `A website that only exists on your laptop cannot be shown to anyone. Deployment turns your project into a link you can put on a CV.

Three good free options for static sites:
- GitHub Pages. Push your code, open repository Settings, choose Pages, select your branch. Your site appears at yourname.github.io/repo-name.
- Netlify. Sign in with GitHub, pick the repository, accept the defaults. Every push redeploys automatically.
- Vercel. Same workflow as Netlify, with excellent performance defaults.

Before you deploy, run through this checklist:
- Every link and image path works when the site is not on your machine. Use relative paths, and remember that servers are case-sensitive even though Windows is not.
- The page has a sensible <title> and a meta description.
- There is a favicon.
- You have tested it on a phone, not just a narrow desktop window.
- No console errors.

Deploy at least one project before moving on to the next module. Getting something live is a genuine milestone.`,
          },
        ],
      },
      {
        title: "Projects and Capstone",
        lessons: [
          {
            title: "Project 1: Personal portfolio site",
            durationMin: 240,
            content: `Build a single-page portfolio that you will actually use when applying for work.

Requirements:
- Semantic structure using header, nav, main, section and footer.
- A hero area with your name, one sentence about what you do, and a call to action.
- An About section with a short biography and a photo with proper alt text.
- A Projects section that is a responsive grid of at least three cards, each with an image, title, description and link.
- A contact form with labelled inputs and HTML validation.
- Smooth in-page navigation from the nav links to each section.

Acceptance criteria:
- The layout works at 320px, 768px and 1440px with no horizontal scrolling.
- All interactive elements are reachable and usable with the keyboard alone.
- Colour contrast passes 4.5:1 for body text.
- Lighthouse in Chrome developer tools scores 90 or above for Accessibility and Best Practices.
- The project is on GitHub and deployed to a public URL.

Stretch goals: add a dark mode toggle using CSS custom properties, and animate cards into view on scroll.`,
          },
          {
            title: "Project 2: Responsive product landing page",
            durationMin: 240,
            content: `Recreate a commercial landing page to practise layout under real constraints. Pick any product you like and rebuild its page from scratch.

Requirements:
- A sticky header that collapses to a hamburger menu below 768px.
- A hero section with a headline, supporting text, two buttons and an image.
- A features section using CSS Grid with at least six items.
- A pricing table with three tiers, where the middle tier is visually emphasised.
- A frequently asked questions section that expands and collapses when clicked.
- A footer with several link columns and social icons.

Acceptance criteria:
- Grid is used for the page-level layout and Flexbox for component-level alignment.
- The FAQ works with the keyboard and communicates its expanded state.
- No layout shift when images load — set width and height attributes on images.
- No CSS framework. Write it yourself.

Stretch goals: implement the FAQ with the native details and summary elements and compare the effort, and add a scroll-triggered progress bar.`,
          },
          {
            title: "Capstone: Data-driven web application",
            durationMin: 360,
            content: `Combine everything: structure, styling, interactivity and live data.

Build one of these, or propose your own of equivalent scope:
- A film search app using a public film API, with search, filters and a details view.
- A weather dashboard that takes a city name and shows current conditions plus a five-day forecast.
- An expense tracker that stores entries in localStorage and charts the monthly total.

Requirements:
- Data is fetched asynchronously from an API or read from localStorage.
- Loading, empty, error and success states are all handled visibly.
- At least one form with validation and useful error messages.
- The interface is fully responsive and keyboard accessible.
- Code is split into named functions with a single responsibility each. No 300-line script of tangled logic.
- The repository has a README explaining what the project does, how to run it, and what you learned.

Acceptance criteria:
- The app does not break when the API returns an error or an empty result.
- There are no uncaught errors in the console during normal use.
- At least eight commits telling the story of how it was built.
- Deployed to a public URL, linked from your portfolio.

How to submit: push to GitHub, deploy, then post the repository link and the live link in the course discussion for review.`,
          },
        ],
      },
    ],
    quizzes: [
      {
        title: "Checkpoint 1: HTML and CSS",
        durationMin: 15,
        passingScore: 70,
        questions: [
          {
            type: "MCQ",
            question: "Which HTML element should wrap the unique primary content of a page?",
            options: ["main", "div", "section", "body"],
            correctAnswer: "main",
          },
          {
            type: "MCQ",
            question:
              "What does the CSS declaration box-sizing: border-box change about an element?",
            options: [
              "Padding and border are included inside the declared width",
              "Margins collapse between adjacent elements",
              "The element is removed from normal document flow",
              "Child elements inherit the parent's width",
            ],
            correctAnswer: "Padding and border are included inside the declared width",
          },
          {
            type: "MCQ",
            question:
              "Which layout tool is designed for arranging items along a single axis, such as a navigation bar?",
            options: ["Flexbox", "CSS Grid", "Float", "Position absolute"],
            correctAnswer: "Flexbox",
          },
          {
            type: "MCQ",
            question:
              "In CSS Grid, what does the fr unit represent in grid-template-columns: 1fr 2fr?",
            options: [
              "A fraction of the remaining free space",
              "A fixed measurement in pixels",
              "A percentage of the viewport height",
              "A font-relative size like rem",
            ],
            correctAnswer: "A fraction of the remaining free space",
          },
          {
            type: "TRUE_FALSE",
            question:
              "Omitting the viewport meta tag causes most mobile browsers to render the page at a desktop width and scale it down.",
            correctAnswer: "true",
          },
          {
            type: "TRUE_FALSE",
            question:
              "HTML validation attributes such as required and pattern are sufficient security and make server-side validation unnecessary.",
            correctAnswer: "false",
          },
          {
            type: "MCQ",
            question: "What is the correct alt attribute for a purely decorative image?",
            options: [
              'alt=""',
              'alt="decorative image"',
              "The alt attribute should be omitted entirely",
              'alt="image"',
            ],
            correctAnswer: 'alt=""',
          },
        ],
      },
      {
        title: "Final Assessment: JavaScript and Shipping",
        durationMin: 20,
        passingScore: 70,
        questions: [
          {
            type: "MCQ",
            question:
              "Which array method returns a new array containing only the items that pass a test?",
            options: ["filter", "forEach", "reduce", "find"],
            correctAnswer: "filter",
          },
          {
            type: "MCQ",
            question:
              "After calling fetch, how do you detect that the server responded with a 404 status?",
            options: [
              "Check that response.ok is false or inspect response.status",
              "The fetch promise automatically rejects and throws",
              "Wrap the call in try/catch, which catches it automatically",
              "Check that response.json() returns null",
            ],
            correctAnswer: "Check that response.ok is false or inspect response.status",
          },
          {
            type: "MCQ",
            question:
              "Which method selects the first element in the document matching a CSS selector?",
            options: [
              "document.querySelector",
              "document.getElementsByClassName",
              "document.querySelectorAll",
              "document.selectElement",
            ],
            correctAnswer: "document.querySelector",
          },
          {
            type: "MCQ",
            question: "What is the purpose of a Git branch?",
            options: [
              "To develop a change in isolation before merging it into the main line of work",
              "To create a backup copy of the repository on another machine",
              "To permanently delete commit history",
              "To compress the repository so it uses less disk space",
            ],
            correctAnswer:
              "To develop a change in isolation before merging it into the main line of work",
          },
          {
            type: "TRUE_FALSE",
            question:
              "The strict equality operator === compares values without performing type coercion.",
            correctAnswer: "true",
          },
          {
            type: "TRUE_FALSE",
            question: "JavaScript and Java are two names for the same programming language.",
            correctAnswer: "false",
          },
          {
            type: "MCQ",
            question:
              "Your fetch call works locally but the deployed site shows broken images. What is the most likely cause?",
            options: [
              "Image paths differ in letter case, and the server is case-sensitive",
              "The browser cache needs clearing",
              "JavaScript is disabled on the server",
              "CSS Grid is unsupported in production",
            ],
            correctAnswer: "Image paths differ in letter case, and the server is case-sensitive",
          },
        ],
      },
    ],
  },

  {
    title: "Python Programming: From Zero to Automation",
    category: "Programming",
    featured: true,
    thumbnailUrl: ytThumb("rfscVS0vtbw"),
    description:
      "Learn Python properly, then put it to work. Covers syntax, data structures, functions, files, error handling and object-oriented programming, and finishes with automation scripts that rename files, scrape data, call APIs and generate reports you can run every day.",
    modules: [
      {
        title: "Getting Started with Python",
        lessons: [
          {
            title: "Installing Python and choosing your tools",
            durationMin: 25,
            videoUrl: yt("YYXdXT2l-Gg"),
            content: `Get the environment right once and you will never think about it again.

Steps:
1. Download Python from python.org. On Windows, tick "Add Python to PATH" during installation — this single checkbox causes most beginner problems when missed.
2. Verify the installation. Open a terminal and run: python --version
3. Install Visual Studio Code and its official Python extension.
4. Learn to run code two ways: the interactive shell (type python and experiment line by line) and script files (python my_script.py).

Virtual environments matter from day one. They keep each project's packages separate:

python -m venv .venv
.venv\\Scripts\\activate      (Windows)
source .venv/bin/activate    (macOS and Linux)

When the environment is active your prompt shows (.venv). Install packages with pip install requests and they land in this project only.

Common first errors and what they mean:
- "python is not recognised" — Python is not on your PATH; reinstall with the checkbox ticked.
- IndentationError — Python uses indentation for structure; be consistent, use four spaces.
- ModuleNotFoundError — the package is not installed in the active environment.`,
          },
          {
            title: "Python fundamentals: the complete beginner course",
            durationMin: 260,
            videoUrl: yt("rfscVS0vtbw"),
            pdfUrl: PDFS.thinkPython,
            content: `The core of the course. Work through it across a week, typing every example rather than watching passively.

What you should be able to do afterwards:
- Use variables and the built-in types: int, float, str, bool.
- Control flow with if, elif, else, and loops with for and while.
- Work with lists, tuples, dictionaries and sets, and know when each is appropriate.
- Write functions with parameters, default values and return values.
- Slice sequences, and use comprehensions such as [n * 2 for n in numbers if n % 2 == 0].
- Read and write text files with the with statement.
- Handle errors with try, except and finally.
- Import modules from the standard library.

The attached book, Think Python by Allen Downey, is free and rigorous. Use it when a concept in the video goes past too quickly — the chapter on functions and the chapter on dictionaries are especially worth reading slowly.

Self-check before moving on: write a program that reads a text file and prints the ten most common words with their counts.`,
          },
          {
            title: "Working in Jupyter notebooks",
            durationMin: 30,
            videoUrl: yt("HW29067qVWk"),
            content: `Notebooks let you run code in small cells and see results immediately, mixed with notes. They are the standard tool for exploration, teaching and data work.

Set up:

pip install notebook
jupyter notebook

Practical habits:
- Cells run in the order you execute them, not the order they appear. If results stop making sense, use Kernel then Restart and Run All.
- Keep exploration in notebooks and move stable code into .py files. Notebooks are a workshop, not a warehouse.
- Markdown cells hold your explanation. A notebook with no prose is much harder to return to in three months.

Shortcuts worth learning: Shift+Enter runs a cell, Esc then A inserts a cell above, Esc then B inserts below, Esc then M converts to markdown.`,
          },
        ],
      },
      {
        title: "Writing Better Python",
        lessons: [
          {
            title: "Intermediate Python: the tools that raise your level",
            durationMin: 180,
            videoUrl: yt("HGOBQPFzWKo"),
            content: `The gap between "can write a script" and "writes good Python" is mostly the material in this lesson.

Topics that will change how you write code:
- Comprehensions for lists, dictionaries and sets.
- Generators and the yield keyword, for working with data too large to hold in memory.
- Decorators, for wrapping behaviour around a function without editing it.
- Context managers and the with statement.
- Collections: defaultdict, Counter, namedtuple and deque.
- Lambda functions, and the map/filter pair.
- Exception handling that is specific rather than a bare except.
- Threading and multiprocessing, and why Python's global interpreter lock matters.

Advice: adopt these gradually. A Counter in the right place makes code shorter and clearer; a decorator used to look clever makes it worse.`,
          },
          {
            title: "Object-oriented programming with classes",
            durationMin: 45,
            videoUrl: yt("ZDa-Z5JzLYM"),
            content: `Classes let you bundle data and the functions that operate on that data into one unit.

The vocabulary:
- A class is a blueprint; an instance is one object built from it.
- __init__ is the initialiser, run automatically when you create an instance.
- self refers to the specific instance a method is working on.
- Instance attributes belong to one object; class attributes are shared by all instances.
- Inheritance lets a subclass reuse and extend a parent class.

A minimal example:

class Student:
    school = "Bravio"

    def __init__(self, name, grade):
        self.name = name
        self.grade = grade

    def promote(self):
        self.grade += 1
        return self.grade

When should you use a class? When you find yourself passing the same group of variables into several functions, those variables and functions probably belong together.

Practice task: model a small library. A Book has a title, author and availability. A Library holds books and can lend and return them.`,
          },
          {
            title: "A second perspective on the fundamentals",
            durationMin: 120,
            videoUrl: yt("_uQrJ0TkZlc"),
            content: `Hearing the same concepts explained differently is one of the most reliable ways to turn shaky understanding into solid understanding.

Use this lesson deliberately. Rather than watching it end to end, jump to the sections you found hardest the first time — most learners choose functions, dictionaries, or object-oriented programming.

While watching, keep a "confusions" list. Anything you cannot explain in your own words goes on the list. At the end of the lesson, work through the list one item at a time using the documentation at docs.python.org.

This habit — noticing precisely what you do not understand and then hunting it down — is the single most transferable skill in this course.`,
          },
        ],
      },
      {
        title: "Python for Real Work",
        lessons: [
          {
            title: "Calling APIs and working with JSON",
            durationMin: 60,
            videoUrl: yt("WXsD0ZgxjRw"),
            content: `Most useful automation involves talking to another service over HTTP.

Install the requests library and use this pattern:

import requests

response = requests.get("https://api.github.com/users/octocat", timeout=10)
response.raise_for_status()
data = response.json()
print(data["public_repos"])

Points that matter in production:
- Always set a timeout. Without one, a hanging server hangs your script forever.
- raise_for_status turns 4xx and 5xx responses into exceptions you can catch.
- response.json() gives you Python dictionaries and lists. Navigate them with square brackets, and use .get("key") when a field might be missing.
- Never paste an API key directly into your code. Read it from an environment variable with os.environ.
- Respect rate limits. Add a short sleep between requests in a loop.

Practice task: fetch the current exchange rate from a free currency API and print a formatted conversion table for five currencies.`,
          },
          {
            title: "Files, folders and everyday automation",
            durationMin: 50,
            content: `This is where Python starts saving you real time.

The modern way to handle paths is pathlib:

from pathlib import Path

folder = Path("reports")
for pdf in folder.glob("*.pdf"):
    print(pdf.name, pdf.stat().st_size)

Tasks worth automating first:
- Bulk renaming. Walk a folder, build a new name from a pattern, and use path.rename(new_path).
- Sorting downloads into folders by file extension.
- Merging many CSV files into one.
- Generating a weekly report from a spreadsheet and emailing it.

Two rules that will save you from disaster:
1. Always run destructive scripts in "dry run" mode first — print what would happen instead of doing it. Only when the output looks right do you let it act.
2. Test on a copy of the folder, never the original.

Useful standard library modules: pathlib, os, shutil, csv, json, datetime, argparse, logging.

Practice task: write a script that takes a folder path as a command-line argument and moves every file into a subfolder named after its extension. Include a --dry-run flag.`,
          },
          {
            title: "Errors, testing and code you can trust",
            durationMin: 40,
            content: `Code that runs once on your machine is a demo. Code others rely on needs guard rails.

Handle errors specifically:

try:
    value = int(user_input)
except ValueError:
    print("That was not a whole number.")

Catch the exception you expect. A bare except swallows typing mistakes, keyboard interrupts and genuine bugs, and turns a five-minute fix into an afternoon.

Write tests with pytest. Install it, then create test_calculations.py:

from calculations import add_tax

def test_add_tax_applies_standard_rate():
    assert add_tax(100) == 115

def test_add_tax_rejects_negative_amounts():
    with pytest.raises(ValueError):
        add_tax(-5)

Run pytest in the terminal. Green means safe to change things.

Use logging instead of print for anything that runs unattended:

import logging
logging.basicConfig(level=logging.INFO, filename="run.log")
logging.info("Processed %s files", count)

Practice task: add three tests to the file-organising script from the previous lesson, covering the normal case, an empty folder, and a file with no extension.`,
          },
        ],
      },
      {
        title: "Projects and Capstone",
        lessons: [
          {
            title: "Project 1: Command-line productivity tool",
            durationMin: 180,
            content: `Build a tool you will genuinely run.

Choose one:
- A file organiser that sorts a messy folder by type, date or size.
- A bulk image resizer using the Pillow library.
- A study timer that logs sessions to a CSV and prints a weekly summary.

Requirements:
- Accepts arguments through argparse, including --help output that explains itself.
- Has a --dry-run flag for anything destructive.
- Handles missing files, permission errors and bad input without crashing with a traceback.
- Writes activity to a log file.
- Includes a requirements.txt and a README with example commands.

Acceptance criteria:
- Running the tool with no arguments prints helpful usage rather than an error.
- At least three pytest tests pass.
- Someone else can clone the repository and run it from the README alone.`,
          },
          {
            title: "Project 2: API data collector and report generator",
            durationMin: 240,
            content: `Pull data from a public API on a schedule, store it, and turn it into a report.

Suggested subjects: currency rates, weather for several cities, air quality, public transport timetables, or GitHub repository statistics.

Requirements:
- Fetches from a public API with timeouts and error handling.
- Appends results to a CSV or SQLite database, without duplicating rows on re-runs.
- Produces a summary — for example daily minimum, maximum and average — written to a text or CSV report.
- Secrets and API keys come from environment variables, never from the source code.
- Can be run repeatedly and safely; a failed run does not corrupt stored data.

Acceptance criteria:
- Running the script twice in a row does not create duplicate records.
- If the network is unavailable, the script logs the problem and exits cleanly with a non-zero status code.
- The README explains how to obtain any required API key.

Stretch goal: schedule it with Task Scheduler on Windows or cron on macOS and Linux, and let it run unattended for a week.`,
          },
          {
            title: "Capstone: Automate a real process end to end",
            durationMin: 360,
            content: `Find a repetitive task in your own life, study or work, and eliminate it with Python.

Real examples from previous learners:
- Reading a folder of invoices, extracting totals, and producing a monthly summary spreadsheet.
- Watching a course website for new announcements and sending an email when one appears.
- Converting a lecturer's spreadsheet of marks into individual PDF result slips.
- Collecting job adverts matching keywords into a single ranked list.

Requirements:
- Solves a problem that actually exists, described in the README with a before-and-after time estimate.
- Uses at least two of: file handling, an external API, a database, a third-party library.
- Is structured as functions or classes across more than one file — not a single long script.
- Has error handling, logging and tests.
- Runs from a documented command.

Acceptance criteria:
- A person with Python installed can follow your README and run it successfully on the first attempt.
- The code has no hard-coded personal paths or credentials.
- The commit history shows incremental development, not one giant commit.

How to submit: push to GitHub and share the repository link along with a short note describing the manual process it replaced and how much time it saves per week.`,
          },
        ],
      },
    ],
    quizzes: [
      {
        title: "Checkpoint 1: Python Fundamentals",
        durationMin: 15,
        passingScore: 70,
        questions: [
          {
            type: "MCQ",
            question: "Which Python data structure stores key and value pairs?",
            options: ["dict", "list", "tuple", "set"],
            correctAnswer: "dict",
          },
          {
            type: "MCQ",
            question: "What does a virtual environment give you?",
            options: [
              "Package installations isolated to a single project",
              "Faster execution of Python code",
              "Automatic conversion of Python 2 code to Python 3",
              "A graphical interface for writing scripts",
            ],
            correctAnswer: "Package installations isolated to a single project",
          },
          {
            type: "MCQ",
            question: "Which error does Python raise when you write int('hello')?",
            options: ["ValueError", "TypeError", "SyntaxError", "KeyError"],
            correctAnswer: "ValueError",
          },
          {
            type: "MCQ",
            question:
              "What is the result of the comprehension [n * 2 for n in [1, 2, 3, 4] if n % 2 == 0]?",
            options: ["[4, 8]", "[2, 4, 6, 8]", "[1, 3]", "[2, 6]"],
            correctAnswer: "[4, 8]",
          },
          {
            type: "TRUE_FALSE",
            question: "Python uses indentation rather than braces to define code blocks.",
            correctAnswer: "true",
          },
          {
            type: "TRUE_FALSE",
            question: "Lists in Python are immutable and cannot be changed after creation.",
            correctAnswer: "false",
          },
          {
            type: "MCQ",
            question: "What is the main advantage of the with statement when opening a file?",
            options: [
              "The file is closed automatically, even if an error occurs",
              "The file is read faster",
              "The file contents are cached in memory",
              "The file is locked so no other program can read it",
            ],
            correctAnswer: "The file is closed automatically, even if an error occurs",
          },
        ],
      },
      {
        title: "Final Assessment: Automation and Good Practice",
        durationMin: 20,
        passingScore: 70,
        questions: [
          {
            type: "MCQ",
            question: "Why should every requests call include a timeout argument?",
            options: [
              "Without one, an unresponsive server can hang the script indefinitely",
              "It makes the request faster",
              "It is required by the HTTP specification",
              "It automatically retries failed requests",
            ],
            correctAnswer:
              "Without one, an unresponsive server can hang the script indefinitely",
          },
          {
            type: "MCQ",
            question: "Where should an API key live in a script you plan to publish?",
            options: [
              "In an environment variable read at runtime",
              "In a constant at the top of the main file",
              "In a comment so it is easy to find",
              "In the README so users can copy it",
            ],
            correctAnswer: "In an environment variable read at runtime",
          },
          {
            type: "MCQ",
            question: "What does the __init__ method do in a Python class?",
            options: [
              "Runs automatically when an instance is created, to set up its attributes",
              "Deletes the instance when it is no longer used",
              "Declares the class as importable by other modules",
              "Defines which attributes are private",
            ],
            correctAnswer:
              "Runs automatically when an instance is created, to set up its attributes",
          },
          {
            type: "MCQ",
            question: "Why is a bare 'except:' considered poor practice?",
            options: [
              "It hides genuine bugs and interrupts by catching every possible exception",
              "It is slower than catching a specific exception",
              "It is invalid syntax in Python 3",
              "It prevents the finally block from running",
            ],
            correctAnswer:
              "It hides genuine bugs and interrupts by catching every possible exception",
          },
          {
            type: "TRUE_FALSE",
            question:
              "A dry-run mode that prints intended changes without applying them is a sensible safeguard for destructive scripts.",
            correctAnswer: "true",
          },
          {
            type: "TRUE_FALSE",
            question:
              "Jupyter notebook cells always execute in the order they appear on screen, regardless of how you run them.",
            correctAnswer: "false",
          },
          {
            type: "MCQ",
            question:
              "Which module is the recommended modern way to work with filesystem paths in Python?",
            options: ["pathlib", "os.path", "sys", "glob"],
            correctAnswer: "pathlib",
          },
        ],
      },
    ],
  },

  {
    title: "React and Next.js: Build Production Web Apps",
    category: "Programming",
    thumbnailUrl: ytThumb("bMknfKXIFA8"),
    description:
      "Move from static pages to real applications. Learn React components, state and hooks, add type safety with TypeScript, then build a full-stack app with the Next.js App Router — routing, server components, data fetching, forms, APIs and deployment.",
    modules: [
      {
        title: "Thinking in Components",
        lessons: [
          {
            title: "Why React exists",
            durationMin: 10,
            videoUrl: yt("Tn6-PIqc4UM"),
            content: `Before the syntax, understand the problem React solves.

With plain DOM scripting, your data and your interface drift apart. You update a variable, then you must remember every place on the page that displays it and update those too. In an application with hundreds of moving pieces this becomes unmanageable, and it is where most bugs come from.

React inverts it. You describe what the interface should look like for a given state, and React works out the minimal set of DOM changes needed to get there. You stop writing "find this element and change its text" and start writing "this is what the page looks like when the cart has three items".

Three ideas underpin everything:
- Components: reusable functions that return markup.
- Props: read-only inputs passed from parent to child.
- State: data that changes over time and triggers a re-render when it does.

Prerequisite check: you should be comfortable with JavaScript functions, arrays, objects, destructuring and the map method before continuing. If any of those are shaky, revisit them first — React itself is not the hard part.`,
          },
          {
            title: "React fundamentals: components, props and state",
            durationMin: 220,
            videoUrl: yt("bMknfKXIFA8"),
            content: `The main React course. Build along with it rather than watching.

What you must understand by the end:
- JSX, and how it differs from HTML: className instead of class, camelCase event handlers, expressions inside curly braces.
- Function components and how to compose them.
- Props, including children, and why props are read-only.
- State with useState, and why you must never mutate state directly.
- Rendering lists with map, and why each item needs a stable key (never the array index if the list can reorder).
- Conditional rendering with ternaries and logical AND.
- Handling events and controlled form inputs.
- Lifting state up when two components need the same data.
- useEffect for synchronising with things outside React, and its dependency array.

The most common beginner mistake: calling setState with the current value mutated, for example items.push(newItem) then setItems(items). React compares references, sees the same array, and does not re-render. Always create a new value: setItems([...items, newItem]).`,
          },
          {
            title: "A second pass on hooks and patterns",
            durationMin: 110,
            videoUrl: yt("SqcY0GlETPk"),
            content: `Revisit the same concepts from a different teacher, with more emphasis on structure and project organisation.

Focus on:
- Component composition: when to split a component and when splitting makes things worse.
- Where state should live. The rule of thumb is the closest common ancestor of everything that needs it, and no higher.
- Custom hooks: extracting stateful logic into a reusable function whose name begins with use.
- The rules of hooks: only call them at the top level of a component or another hook, never inside conditions or loops.
- When you actually need useEffect. Most of the time you do not — deriving a value during render is simpler than storing it in state and syncing it.

Practice task: build a searchable, filterable product list. Keep the raw list in state, derive the filtered list during render, and extract the search input into its own component.`,
          },
        ],
      },
      {
        title: "Type Safety with TypeScript",
        lessons: [
          {
            title: "TypeScript for React developers",
            durationMin: 160,
            videoUrl: yt("30LWjhZzg50"),
            content: `TypeScript is JavaScript with a type checker. It catches a large class of bugs before you run the code, and it makes editors dramatically more helpful.

Concepts that matter most in React work:
- Basic annotations: string, number, boolean, arrays, and union types such as "idle" | "loading" | "error".
- Interfaces and type aliases for describing objects.
- Typing component props: type ButtonProps = { label: string; onClick: () => void; disabled?: boolean }.
- Optional properties with ?, and why optional is different from "can be null".
- Generics, at least enough to read them: Array<T>, useState<string[]>([]).
- Type narrowing with typeof and truthiness checks.
- unknown versus any, and why any defeats the entire point.

Practical advice: do not try to type everything perfectly on day one. Start by typing your props and your API responses. Those two alone deliver most of the benefit.`,
          },
        ],
      },
      {
        title: "Full-Stack Applications with Next.js",
        lessons: [
          {
            title: "Next.js fundamentals and the App Router",
            durationMin: 150,
            videoUrl: yt("ZVnjOPwW4ZA"),
            content: `Next.js is React plus the things every real application needs: routing, server rendering, data fetching, API endpoints and a build system.

The App Router model:
- Routes are folders inside app. A folder called app/courses/page.tsx serves /courses.
- Dynamic segments use square brackets: app/courses/[slug]/page.tsx.
- layout.tsx wraps every page beneath it and does not re-render on navigation.
- loading.tsx is shown automatically while a server component is fetching.
- error.tsx catches rendering errors in that segment.
- Special files are the API — the file name is the behaviour.

Server components are the default. They run on the server, can read a database directly, and send no JavaScript to the browser. Add "use client" at the top of a file only when you need state, effects or browser event handlers.

The decision you will make constantly: does this component need interactivity? If not, leave it on the server. Pushing "use client" up too high in the tree is the most common performance mistake in Next.js applications.`,
          },
          {
            title: "Building and deploying a full-stack app",
            durationMin: 240,
            videoUrl: yt("wm5gMKuwSYk"),
            content: `A complete build, from empty folder to deployed application.

Watch for how the project handles:
- Fetching data in a server component with async/await, with no useEffect in sight.
- Mutating data with server actions, and revalidating the cache afterwards.
- Route handlers in app/api for endpoints consumed by other clients.
- Loading and error states using the file conventions.
- Environment variables, and the difference between server-only variables and those prefixed with NEXT_PUBLIC_.
- Image optimisation with next/image, and why remote domains must be allow-listed.
- Metadata for search engines and social previews.

Build the project alongside the video, then change something substantial — add a feature that was not in the tutorial. Tutorials teach syntax; deviating from them teaches understanding.`,
          },
          {
            title: "Designing API routes and data flow",
            durationMin: 15,
            videoUrl: yt("-MTSQjw5DrM"),
            content: `Whether your endpoints live in Next.js route handlers or a separate service, the same design rules apply.

REST conventions worth following:
- Use nouns for resources and HTTP verbs for actions: GET /courses, POST /courses, GET /courses/123, PATCH /courses/123, DELETE /courses/123.
- Return the right status code. 200 success, 201 created, 400 bad input, 401 not authenticated, 403 not allowed, 404 missing, 500 server fault.
- Validate every input on the server, even if the form already validated it. Zod is the standard choice in TypeScript projects.
- Never return more data than the client needs, and never return password hashes or internal identifiers.
- Keep responses consistently shaped so the client can handle them predictably.

Security basics you cannot skip:
- Check authentication and authorisation inside the handler, not in the component that links to it.
- Rate-limit anything that sends email, creates accounts or costs money.
- Treat every value from the client as hostile until validated.`,
          },
          {
            title: "Deploying to production",
            durationMin: 15,
            videoUrl: yt("AiiGjB2AxqA"),
            content: `Getting a Next.js application online takes minutes; getting it online correctly takes a checklist.

The deployment flow:
1. Push the repository to GitHub.
2. Import it in your hosting provider and accept the detected framework settings.
3. Add every environment variable the app needs. Missing variables are the number one cause of a build that works locally and fails in production.
4. Deploy, then check the build logs even when it succeeds — warnings there predict tomorrow's incidents.

Pre-launch checklist:
- Run npm run build locally first. Type errors and missing imports surface at build time, not in development.
- Confirm database connection strings point at the production database, not your laptop.
- Set the canonical site URL variable so authentication redirects and generated links are correct.
- Check that remote image domains are allow-listed in the Next.js config.
- Test the deployed site on a phone on mobile data, not just office wifi.

Then set up a preview workflow: every pull request gets its own URL, so reviewers can click rather than imagine.`,
          },
        ],
      },
      {
        title: "Projects and Capstone",
        lessons: [
          {
            title: "Project 1: Interactive dashboard in React",
            durationMin: 240,
            content: `Build a client-side dashboard that demonstrates solid component design.

Requirements:
- Fetches data from a public API on load.
- Displays summary cards, a sortable table and at least one chart.
- Includes search and at least two filters that combine correctly.
- Has explicit loading, empty and error states.
- Written in TypeScript with typed props and a typed API response.
- At least one custom hook extracted from component logic.

Acceptance criteria:
- No component exceeds roughly 150 lines; larger ones are split.
- Filtered results are derived during render rather than stored in duplicate state.
- List keys are stable identifiers, not array indexes.
- The interface is usable with the keyboard and readable at 375px wide.`,
          },
          {
            title: "Project 2: Full-stack CRUD application",
            durationMin: 360,
            content: `Build a complete Next.js application with persistence and authentication.

Suggested subjects: a recipe manager, an issue tracker, a personal library, or a habit tracker.

Requirements:
- Next.js App Router with a sensible route structure and shared layout.
- A database (SQLite, Postgres or similar) accessed through an ORM.
- Full create, read, update and delete for the main resource.
- Authentication, with routes that reject unauthenticated users on the server.
- Server-side validation of every mutation with clear error messages returned to the form.
- loading.tsx and error.tsx conventions used properly.
- Deployed with environment variables configured.

Acceptance criteria:
- Visiting a protected route while signed out redirects rather than flashing private content.
- A user cannot edit or delete another user's records, even by calling the endpoint directly.
- The app builds with no TypeScript errors.
- The README documents the environment variables and how to seed the database.`,
          },
          {
            title: "Capstone: Ship something people use",
            durationMin: 480,
            content: `The final project should be something you would show an employer or genuinely put in front of users.

Scope guidance: one clear audience, one core job to be done, done well. A focused application that works flawlessly beats an ambitious one that half works.

Requirements:
- Real persistence, real authentication, real deployment.
- At least three distinct roles or states in the user journey (for example: visitor, signed-in user, owner of a record).
- Optimistic or clearly signposted feedback for every action the user takes.
- Accessible: keyboard navigable, focus visible, sensible headings, adequate contrast.
- Performance considered: server components where possible, images optimised, no unnecessary client bundles.
- Error monitoring or at least structured server logging.

Acceptance criteria:
- Lighthouse scores of 90 or above for Performance, Accessibility and Best Practices on the deployed site.
- A README with screenshots, the problem statement, the architecture and the trade-offs you made.
- At least twenty commits with meaningful messages.
- Three people who are not you have used it and given feedback, and you have acted on at least one piece of that feedback.

How to submit: share the live URL and the repository link, plus a short written reflection on what you would do differently with another month.`,
          },
        ],
      },
    ],
    quizzes: [
      {
        title: "Checkpoint 1: React and TypeScript",
        durationMin: 15,
        passingScore: 70,
        questions: [
          {
            type: "MCQ",
            question: "Why must you avoid mutating state directly in React?",
            options: [
              "React compares references, so a mutated object looks unchanged and no re-render happens",
              "Mutation causes a syntax error in strict mode",
              "Mutation permanently corrupts the component tree",
              "Mutated state cannot be passed as props",
            ],
            correctAnswer:
              "React compares references, so a mutated object looks unchanged and no re-render happens",
          },
          {
            type: "MCQ",
            question: "What should you use as the key when rendering a list of items?",
            options: [
              "A stable unique identifier from the data",
              "The array index",
              "A randomly generated value on each render",
              "The item's display text",
            ],
            correctAnswer: "A stable unique identifier from the data",
          },
          {
            type: "MCQ",
            question: "Where should shared state live when two sibling components need it?",
            options: [
              "In their closest common ancestor",
              "Duplicated in both components",
              "In a global variable outside React",
              "In the deepest child that uses it",
            ],
            correctAnswer: "In their closest common ancestor",
          },
          {
            type: "TRUE_FALSE",
            question:
              "Hooks must be called at the top level of a component and never inside conditions or loops.",
            correctAnswer: "true",
          },
          {
            type: "TRUE_FALSE",
            question:
              "Using the any type throughout a TypeScript project still provides full type-checking benefits.",
            correctAnswer: "false",
          },
          {
            type: "MCQ",
            question: "In JSX, which attribute replaces the HTML class attribute?",
            options: ["className", "class", "cssClass", "styleName"],
            correctAnswer: "className",
          },
        ],
      },
      {
        title: "Final Assessment: Next.js in Production",
        durationMin: 20,
        passingScore: 70,
        questions: [
          {
            type: "MCQ",
            question: "In the Next.js App Router, when do you need the \"use client\" directive?",
            options: [
              "When the component uses state, effects or browser event handlers",
              "In every component file",
              "Only in files inside the api folder",
              "When the component fetches data from a database",
            ],
            correctAnswer:
              "When the component uses state, effects or browser event handlers",
          },
          {
            type: "MCQ",
            question: "What does a loading.tsx file in a route segment do?",
            options: [
              "Renders automatically as a fallback while the segment's server content is being prepared",
              "Preloads all images for that route",
              "Runs before the server component to authenticate the request",
              "Defines the page's metadata",
            ],
            correctAnswer:
              "Renders automatically as a fallback while the segment's server content is being prepared",
          },
          {
            type: "MCQ",
            question:
              "Which HTTP status code should an endpoint return when a signed-in user requests a record they do not own?",
            options: ["403", "401", "404", "400"],
            correctAnswer: "403",
          },
          {
            type: "MCQ",
            question:
              "An environment variable prefixed with NEXT_PUBLIC_ has what important property?",
            options: [
              "It is exposed to the browser bundle and must never hold a secret",
              "It is only readable on the server",
              "It is encrypted before being sent to the client",
              "It is loaded only during the build and discarded at runtime",
            ],
            correctAnswer: "It is exposed to the browser bundle and must never hold a secret",
          },
          {
            type: "TRUE_FALSE",
            question:
              "Server-side validation is still required even when the form already validates input in the browser.",
            correctAnswer: "true",
          },
          {
            type: "TRUE_FALSE",
            question:
              "Marking the root layout with \"use client\" is a good default because it simplifies the component tree.",
            correctAnswer: "false",
          },
        ],
      },
    ],
  },
];
