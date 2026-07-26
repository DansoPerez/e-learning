import { PDFS, yt, ytThumb, type SeedCourse } from "./types";

export const BUSINESS_COURSES: SeedCourse[] = [
  {
    title: "Startup Foundations: From Idea to First Customers",
    category: "Business",
    featured: true,
    thumbnailUrl: ytThumb("CBYhVcO4WgI", "sddefault"),
    description:
      "Learn how new businesses are actually built, taught through the material Y Combinator and Stanford use. Covers finding a real problem, talking to users, business models, building a minimum viable product, early traction and pitching — ending with a validated business case of your own.",
    modules: [
      {
        title: "Ideas Worth Pursuing",
        lessons: [
          {
            title: "How to start a startup",
            durationMin: 50,
            videoUrl: yt("CBYhVcO4WgI"),
            content: `The opening lecture of the Stanford and Y Combinator course, delivered by Sam Altman and Dustin Moskovitz.

The framework it sets out: a startup needs a great idea, a great product, a great team and great execution. All four are necessary; none is sufficient.

Points worth writing down:
- It is better to build something a small number of people love than something a large number merely like. Intense demand from a few is a signal; mild interest from many is noise.
- Growth is the definition of a startup. If the business cannot grow quickly, it may be a good business but it is not a startup, and the advice differs.
- Ideas that sound bad but are good are the most valuable, because nobody else is competing for them.
- Do not start a company because starting a company sounds appealing. The failure rate for founders motivated by the identity rather than the problem is close to total.
- Missionaries beat mercenaries. The people who care about the problem outlast the people who care about the exit.

Reflection exercise: write down three problems you have personally experienced in the last month that made you think "why is this still like this?" These are far better starting points than ideas invented at a desk.`,
          },
          {
            title: "How to get and evaluate startup ideas",
            durationMin: 45,
            videoUrl: yt("Th8JoIan4dg"),
            content: `Y Combinator's practical method for generating and testing ideas.

The best ideas usually have three properties:
- Something you personally want, so you understand the problem without research.
- Something you can build, so you can start today rather than after raising money.
- Something few people realise is worth doing, so you have time before competitors arrive.

Ways to find them:
- Notice what you complain about, and what you have already built a workaround for.
- Look for changes: a new technology, a new regulation, a new behaviour. Change creates gaps.
- Consider industries you have worked in. Domain knowledge is a genuine advantage and cannot be researched quickly.
- Ask what is hard and boring but necessary. Unglamorous problems have less competition.

Warning signs to check for:
- The tarpit idea: an idea that sounds appealing to everyone, has been tried repeatedly, and fails for a structural reason you have not yet discovered. Search for previous attempts and understand why they died.
- A solution looking for a problem.
- A market so small that even total success is not worth the years.

Deliverable: write three ideas, and for each one, name the specific person who has this problem and what they do today instead.`,
          },
          {
            title: "Before the startup: what founders get wrong",
            durationMin: 50,
            videoUrl: yt("ii1jcLg-eIQ"),
            content: `Paul Graham's counterintuitive lecture on why startup advice feels wrong to smart people.

The central argument: startups are so unlike anything else you have done that your instincts, honed by school and employment, actively mislead you.

Ideas to sit with:
- Startups are counterintuitive, so following your instincts is often exactly wrong. When advice feels strange, that is not evidence it is bad.
- You need to be an expert in your users, not in startups. Knowledge of fundraising mechanics is worth little compared with knowledge of the customer.
- Do not "game" the startup process the way one games exams. Investors, unlike examiners, care only about whether the business works.
- The best way to have startup ideas is to become the kind of person who has them: work on hard problems and get to the frontier of a field until you can see what is missing.
- Starting a company is a big commitment. If you are not sure, an alternative is to work at a fast-growing startup for a few years, which teaches more than most preparation.

Reflection exercise: which of the ideas in this lecture do you disagree with, and why? Write a paragraph. If you find yourself agreeing with everything, you are probably not engaging with it.`,
          },
        ],
      },
      {
        title: "Business Models and Validation",
        lessons: [
          {
            title: "The Business Model Canvas",
            durationMin: 15,
            videoUrl: yt("QoAOzMTLP5s"),
            pdfUrl: PDFS.businessModelCanvas,
            content: `The canvas puts an entire business on one page, which makes gaps visible and forces honesty.

Nine blocks:
- Customer segments. Who exactly, described precisely enough to find them.
- Value proposition. What job you do for them, and why it beats the alternative.
- Channels. How they discover, buy and receive the product.
- Customer relationships. Self-service, personal, community, automated.
- Revenue streams. What they pay for, how much and how often.
- Key resources. What the business must own or have access to.
- Key activities. What the business must be excellent at doing.
- Key partners. Who does the things you will not.
- Cost structure. What it costs to operate, split into fixed and variable.

How to use it well: fill it in quickly, in pencil, then mark every block that is an assumption rather than a fact. Those assumptions are your research agenda. Most failed businesses had a beautiful canvas full of untested guesses.

The attached canvas from Strategyzer is the official template. Print it and use it at A3 with sticky notes so it stays easy to change.`,
          },
          {
            title: "Working through the canvas block by block",
            durationMin: 25,
            videoUrl: yt("IP0cUBWTgpY"),
            content: `A step-by-step walkthrough of completing each block with realistic examples.

While watching, complete a canvas for your own idea. Do not aim for a perfect version; aim for a first version you can attack.

Then stress-test it with these questions:
- Could you name five real people in your customer segment and contact them this week? If not, the segment is too vague.
- Does your value proposition describe an outcome for the customer, or a feature of your product? "Get paid within 24 hours" beats "automated invoicing platform".
- Which single assumption, if wrong, kills the whole business? That is the one to test first.
- What does the customer do today instead? Every business competes with the status quo, and the status quo is free and familiar.
- If revenue is advertising or commission, how many users do you need before the numbers work? Write the actual number.

Deliverable: a completed canvas with every assumption highlighted and ranked by how fatal it would be if wrong.`,
          },
          {
            title: "The lean startup method",
            durationMin: 55,
            videoUrl: yt("fEvKo90qBns"),
            content: `Eric Ries explains how to reduce the time between having an idea and finding out whether it is any good.

The core loop is build, measure, learn — run as fast as possible, as cheaply as possible.

Key concepts:
- The minimum viable product is not a bad version of your product. It is the smallest experiment that produces validated learning. Sometimes it is a landing page, a spreadsheet operated by hand, or a service you deliver manually before automating.
- Validated learning means evidence about customer behaviour, not opinions about customer intentions.
- Vanity metrics — total registered users, page views, press coverage — feel good and predict nothing. Actionable metrics are cohort-based: of the people who joined in March, how many were still active in April?
- Pivot or persevere. Decide on a schedule, with evidence, rather than drifting.

The uncomfortable discipline: define in advance what result would cause you to abandon the idea. Founders who do not do this always find a way to interpret bad data as encouraging.

Deliverable: design the cheapest possible test of your most fatal assumption, and state the result that would make you stop.`,
          },
          {
            title: "Talking to users without fooling yourself",
            durationMin: 40,
            content: `Almost every founder does customer interviews. Most do them badly and come away confidently wrong.

The problem: people are polite. Ask "would you use this?" and they say yes, because saying no to an enthusiastic person is uncomfortable. That yes has no information in it.

Ask about the past instead of the future:
- "Tell me about the last time this problem happened."
- "What did you do about it?"
- "How long did that take, and what did it cost?"
- "What else have you tried?"
- "Who else is involved in solving this?"

Look for these signals of a real problem:
- They have already spent money or time trying to fix it.
- They can describe the last occurrence in specific detail.
- They get emotional about it.
- They have built a workaround, however ugly.

If none of those are present, the problem is not painful enough to build a business on, regardless of what they say about your idea.

Never pitch during a discovery interview. The moment you describe your solution, the conversation becomes about being nice to you.

Deliverable: interview five people in your target segment. Report what they currently do, what it costs them, and whether any of them has already paid to solve it.`,
          },
        ],
      },
      {
        title: "Traction and Telling the Story",
        lessons: [
          {
            title: "Positioning and why people care",
            durationMin: 20,
            videoUrl: yt("u4ZoJKF_VuA"),
            content: `Simon Sinek's argument is that people do not buy what you do, they buy why you do it. Whatever you make of the theory, the practical lesson about communication is sound.

Positioning in practice answers four questions:
- For whom is this? Naming the customer is a strategic choice, and refusing to choose is why most messaging is bland.
- What alternative do they use now?
- What can you do that the alternative cannot?
- Why should they believe you?

Write your positioning as a single sentence and test it on a stranger:

For [specific customer] who [specific situation], [product] is a [category] that [key benefit]. Unlike [main alternative], it [key differentiator].

Two common mistakes:
- Positioning against everyone. If your competitor is "the way things are done today", say that explicitly instead of naming no one.
- Leading with features. Customers buy outcomes. The feature is the reason to believe the outcome, not the pitch itself.

Deliverable: write your positioning statement, then read it aloud to three people who do not know your idea and ask them to explain it back to you.`,
          },
          {
            title: "How to pitch",
            durationMin: 35,
            videoUrl: yt("17XZGUX_9iM"),
            content: `Kevin Hale of Y Combinator on making a pitch that is clear rather than clever.

The structure that works:
1. What do you do? One sentence, jargon free, understandable by someone outside your industry.
2. What is the problem, and who has it?
3. What is your insight — the thing you know that others do not?
4. What have you built, and what happened when people used it?
5. What is the market and how does the business make money?
6. Who is the team and why you?
7. What are you asking for?

Rules that separate good pitches from bad:
- Legibility beats persuasion. If the listener has to work out what you mean, you have already lost them.
- Lead with traction if you have any. Numbers end debates.
- Do not hide weaknesses; investors find them and then distrust everything else you said.
- Never claim there is no competition. It means either you have not looked, or there is no market.
- Practise until you can deliver it without slides, because one day the projector will fail.

Deliverable: a five-minute pitch and a one-page summary. Deliver it to someone unfamiliar with the idea and ask them afterwards to describe the business back to you.`,
          },
        ],
      },
      {
        title: "Projects and Capstone",
        lessons: [
          {
            title: "Project 1: Problem validation report",
            durationMin: 240,
            content: `Prove the problem exists before designing anything.

Requirements:
- A written problem statement naming a specific customer and a specific painful situation.
- At least eight interviews using past-behaviour questions, with notes.
- Evidence of the current alternative: what people do today, and what it costs them in money, time or frustration.
- Desk research on at least three existing solutions, including why they are not enough.
- A clear verdict: is this problem worth solving, and what is the evidence?

Acceptance criteria:
- Interview notes quote what people said, rather than summarising your interpretation.
- At least one interview contradicted your expectations, and you have said so.
- The verdict is defensible even if it is negative. A well-evidenced "no" is a successful project.`,
          },
          {
            title: "Project 2: Minimum viable product and first test",
            durationMin: 300,
            content: `Build the smallest thing that can produce real evidence, and run it.

Requirements:
- Identify the single riskiest assumption from your canvas.
- Design an experiment that tests it, with a success criterion defined in advance.
- Build the minimum artefact: a landing page with a sign-up, a manual concierge service, a prototype, a pre-order page, or a single-feature tool.
- Get it in front of at least 30 people in your target segment.
- Record the results: how many saw it, how many acted, and what they said.
- Decide: persevere, pivot or stop, with reasoning.

Acceptance criteria:
- The success criterion was written before the results came in.
- The measurement is behaviour, such as sign-ups, payments or usage, and not opinions.
- The conclusion follows from the data even where the data was disappointing.`,
          },
          {
            title: "Capstone: Complete business case and pitch",
            durationMin: 420,
            content: `Bring the evidence together into something you could take to an investor, a grant panel or a bank.

Requirements:
- Executive summary of one page.
- Problem, evidence and target customer, drawn from your interviews.
- Solution and why it is different, with your positioning statement.
- Business model canvas, with assumptions now labelled as tested or untested.
- Market sizing with your workings shown: how many customers exist, what each is worth, and how you calculated it.
- Unit economics: what it costs to acquire a customer, what that customer is worth, and how long until you recover the cost.
- Traction to date, however small.
- A twelve-month plan with milestones and what each will cost.
- Risks, and how you will find out early if you are wrong.
- A five-minute pitch deck of no more than twelve slides.

Acceptance criteria:
- Every important number can be traced to a source or a stated assumption. No figure appears from nowhere.
- The market size is built from the bottom up, not from a headline industry figure multiplied by an optimistic percentage.
- The risks section is honest and specific.
- The pitch can be delivered in five minutes without rushing.

How to submit: share the written case and the deck, and deliver the pitch to at least two people for feedback.`,
          },
        ],
      },
    ],
    quizzes: [
      {
        title: "Checkpoint 1: Ideas and Validation",
        durationMin: 15,
        passingScore: 70,
        questions: [
          {
            type: "MCQ",
            question:
              "Which is generally the stronger early signal for a new product?",
            options: [
              "A small number of people who love it",
              "A large number of people who mildly like it",
              "Positive press coverage",
              "A large number of newsletter subscribers",
            ],
            correctAnswer: "A small number of people who love it",
          },
          {
            type: "MCQ",
            question: "Which interview question produces the most reliable evidence?",
            options: [
              "Tell me about the last time this problem happened and what you did",
              "Would you pay for a tool that fixed this?",
              "Do you think this is a good idea?",
              "How much would you be willing to pay?",
            ],
            correctAnswer:
              "Tell me about the last time this problem happened and what you did",
          },
          {
            type: "MCQ",
            question: "What is a minimum viable product?",
            options: [
              "The smallest experiment that produces validated learning",
              "A cheaper version of the finished product",
              "A product with all features but poor design",
              "A prototype shown only to investors",
            ],
            correctAnswer: "The smallest experiment that produces validated learning",
          },
          {
            type: "MCQ",
            question: "Which of these is a vanity metric?",
            options: [
              "Total registered users since launch",
              "Percentage of March signups still active in April",
              "Revenue per paying customer",
              "Weekly active users as a share of monthly active users",
            ],
            correctAnswer: "Total registered users since launch",
          },
          {
            type: "TRUE_FALSE",
            question:
              "You should define in advance the result that would cause you to abandon an idea.",
            correctAnswer: "true",
          },
          {
            type: "TRUE_FALSE",
            question:
              "Pitching your solution during a customer discovery interview improves the quality of the feedback.",
            correctAnswer: "false",
          },
        ],
      },
      {
        title: "Final Assessment: Business Model and Pitch",
        durationMin: 20,
        passingScore: 70,
        questions: [
          {
            type: "MCQ",
            question:
              "On the Business Model Canvas, which block describes how customers discover and receive the product?",
            options: ["Channels", "Key partners", "Customer relationships", "Key activities"],
            correctAnswer: "Channels",
          },
          {
            type: "MCQ",
            question: "What is the correct way to size a market for a business plan?",
            options: [
              "Build it bottom up from the number of customers and what each is worth",
              "Take the industry total and assume you will capture one percent",
              "Use the largest figure you can find in a published report",
              "Estimate based on the size of your largest competitor",
            ],
            correctAnswer:
              "Build it bottom up from the number of customers and what each is worth",
          },
          {
            type: "MCQ",
            question: "Why is claiming to have no competition a weakness in a pitch?",
            options: [
              "It suggests either poor research or no real market",
              "Investors only fund crowded markets",
              "Competition law requires naming competitors",
              "It makes the market size calculation impossible",
            ],
            correctAnswer: "It suggests either poor research or no real market",
          },
          {
            type: "MCQ",
            question:
              "A tarpit idea is best described as which of the following?",
            options: [
              "An idea that appeals to everyone, has been attempted many times, and fails for a structural reason",
              "An idea that is technically impossible to build",
              "An idea with no identifiable customer",
              "An idea that requires large amounts of capital",
            ],
            correctAnswer:
              "An idea that appeals to everyone, has been attempted many times, and fails for a structural reason",
          },
          {
            type: "TRUE_FALSE",
            question:
              "Positioning should state clearly who the product is for, even though that means excluding some people.",
            correctAnswer: "true",
          },
          {
            type: "TRUE_FALSE",
            question:
              "Assumptions on a business model canvas should be treated as facts once the canvas is complete.",
            correctAnswer: "false",
          },
        ],
      },
    ],
  },

  {
    title: "Business Finance, Accounting and Valuation",
    category: "Business",
    thumbnailUrl: ytThumb("yYX4bvQSqbo"),
    description:
      "Read the numbers that decide whether a business survives. Covers double-entry bookkeeping, the three financial statements, cash flow versus profit, pricing and unit economics, budgeting in spreadsheets, and an introduction to how businesses are valued.",
    modules: [
      {
        title: "The Language of Accounting",
        lessons: [
          {
            title: "Accounting basics: almost everything you need",
            durationMin: 60,
            videoUrl: yt("yYX4bvQSqbo"),
            content: `Accounting is a language, and like any language it becomes easy once the grammar clicks.

The grammar is one equation:

Assets = Liabilities + Equity

Everything the business controls was funded either by borrowing or by owners. The equation must always balance, which is why the system is called double entry: every transaction affects at least two accounts.

The five account types:
- Assets: cash, stock, equipment, money owed to you.
- Liabilities: loans, unpaid bills, tax owed.
- Equity: owner investment plus accumulated profit.
- Income: revenue earned.
- Expenses: costs incurred.

Debits and credits confuse everyone at first. Ignore the everyday meaning of the words. A debit increases assets and expenses; a credit increases liabilities, equity and income. That is the whole rule.

Accrual versus cash accounting matters enormously: accrual records revenue when it is earned and costs when they are incurred, regardless of when money moves. Cash accounting records when money moves. Accrual gives the truer picture of performance; cash tells you whether you can pay the wages on Friday. Serious businesses track both.`,
          },
          {
            title: "The three financial statements",
            durationMin: 45,
            content: `Three statements, three questions.

The income statement, also called the profit and loss account, answers: did we make a profit over this period?

Revenue
minus Cost of goods sold
= Gross profit
minus Operating expenses
= Operating profit
minus Interest and tax
= Net profit

Gross margin (gross profit divided by revenue) is the single most diagnostic number in most businesses. It tells you whether the model can ever work at scale.

The balance sheet answers: what do we own and owe at this exact moment? It is a photograph, not a film. Look at current assets against current liabilities to judge whether the business can meet its short-term obligations.

The cash flow statement answers: where did the money actually go? It splits movement into operating, investing and financing activities.

The relationship that catches people out: profit is an opinion, cash is a fact. A profitable business can fail this month because a large customer pays in ninety days while wages are due on the thirtieth. Growing businesses are especially vulnerable, because growth consumes cash before it produces it.

Practice task: find the published annual report of any listed company, locate all three statements, and write down its revenue, gross margin, net profit and closing cash balance.`,
          },
          {
            title: "Finance and investing fundamentals",
            durationMin: 55,
            videoUrl: yt("WEDIj9JBTC8"),
            content: `A brisk, plain-English tour of how finance works, from a practitioner.

Concepts to take away:
- The time value of money. A cedi today is worth more than a cedi next year, because it can be invested. This one idea underpins every valuation method.
- Compounding, and why time in the market matters more than timing the market.
- Risk and return move together. Anything promising high returns with no risk is either misunderstood or a fraud.
- Debt versus equity. Debt is cheaper and must be repaid; equity is expensive and permanent. The mix is one of the most consequential decisions a business makes.
- Diversification reduces risk that is specific to one company without reducing expected return.
- Interest rates influence almost everything, because they set the price of money.

Watch this for orientation rather than technique. The specific instruments matter less than developing an instinct for how the pieces relate.`,
          },
        ],
      },
      {
        title: "Running the Numbers",
        lessons: [
          {
            title: "Pricing and unit economics",
            durationMin: 45,
            content: `A business is viable when each customer is worth more than it costs to serve and acquire them. Astonishing numbers of companies never calculate this.

The numbers to know:
- Contribution margin per unit: selling price minus variable cost. This is what each sale contributes towards fixed costs.
- Break-even volume: fixed costs divided by contribution margin. The number of units you must sell before you earn anything.
- Customer acquisition cost: total sales and marketing spend divided by new customers won in the same period.
- Lifetime value: contribution margin per customer per period, multiplied by how many periods they stay.
- The ratio of lifetime value to acquisition cost. Below 1 you lose money on every customer; a common healthy target is 3 or above.
- Payback period: how many months until a customer has repaid their acquisition cost. Long paybacks are survivable only with plenty of cash.

Pricing approaches:
- Cost-plus is simple and usually leaves money on the table.
- Competitor-based is safe and turns your product into a commodity.
- Value-based prices against the outcome the customer receives, and is almost always the most profitable, but requires you to understand that outcome precisely.

The most common mistake in small business is pricing too low out of fear. A price increase flows entirely to profit, while the same increase in volume brings costs with it.

Practice task: build a unit economics model for a real or imagined business, and find the price at which it breaks even.`,
          },
          {
            title: "Budgeting and modelling in spreadsheets",
            durationMin: 120,
            videoUrl: yt("Vl0H-qTclOg"),
            content: `The spreadsheet is still the most used financial tool in the world. Being fluent in it is a genuine career advantage.

Functions that cover most business modelling: SUM, SUMIF and SUMIFS, IF, XLOOKUP or VLOOKUP, INDEX and MATCH, COUNTIF, ROUND, and the date functions. Pivot tables for summarising, and conditional formatting for spotting anomalies.

How to build a financial model that people can trust:
- Separate inputs, calculations and outputs into distinct areas or sheets. Colour inputs consistently so it is obvious what can be changed.
- Never hard-code a number inside a formula. If growth is 8 percent, put 0.08 in a labelled cell and reference it.
- One row, one formula, copied across. Inconsistent formulas within a row are the leading cause of model errors.
- Build a check row that must always equal zero, and watch it.
- Include a scenario switch for pessimistic, expected and optimistic cases. Every plan is wrong; a range is honest.

Build a twelve-month cash flow forecast:
opening cash, plus receipts, minus payments, equals closing cash — which becomes next month's opening cash. Simple, and it has saved more businesses than any other single document.

Practice task: model twelve months for a small business, then find the month with the lowest closing cash and work out what you would do about it.`,
          },
        ],
      },
      {
        title: "Valuation",
        lessons: [
          {
            title: "Introduction to valuation",
            durationMin: 75,
            videoUrl: yt("znmQ7oMiQrM"),
            content: `Aswath Damodaran of NYU is the clearest teacher of valuation alive, and his course is free.

The two philosophies:
- Intrinsic valuation asks what the business is worth based on the cash it will generate. Discounted cash flow is the standard method: forecast future free cash flows, discount them back at a rate reflecting risk, and add a terminal value.
- Relative valuation asks what similar businesses sell for, using multiples such as price to earnings, enterprise value to revenue, or enterprise value to EBITDA.

Truths worth learning early:
- A valuation is a story told with numbers. If the numbers do not correspond to a plausible narrative about the business, the valuation is arithmetic without meaning.
- Small changes in the discount rate or the growth assumption change the answer enormously. Always show a sensitivity table rather than a single figure.
- Precision is not accuracy. A valuation quoted to two decimal places is a warning sign.
- Value and price are different. Value comes from fundamentals; price comes from what someone will pay today.

For early-stage companies, none of this works cleanly — there are no cash flows to discount. Early-stage valuation is largely negotiation, benchmarked against comparable rounds, and understanding that honestly is more useful than pretending otherwise.`,
          },
        ],
      },
      {
        title: "Projects and Capstone",
        lessons: [
          {
            title: "Project 1: Read and analyse real financial statements",
            durationMin: 180,
            content: `Choose a listed company and read its annual report properly.

Requirements:
- Extract three years of revenue, gross profit, operating profit, net profit and closing cash.
- Calculate gross margin, operating margin and net margin for each year, and comment on the trend.
- Calculate the current ratio and comment on short-term solvency.
- Identify the largest expense category and how it has changed.
- Compare profit with operating cash flow and explain any large gap.
- Summarise in one page: is this business getting stronger or weaker, and what evidence supports your answer?

Acceptance criteria:
- Every figure is sourced with a page reference.
- The conclusion is supported by ratios rather than impressions.
- At least one thing you found contradicted the tone of the company's own narrative section.`,
          },
          {
            title: "Project 2: Twelve-month financial model",
            durationMin: 240,
            content: `Build a working financial model for a real or planned business.

Requirements:
- A clearly separated inputs sheet with every assumption labelled and sourced.
- Monthly revenue build from volume multiplied by price, not a single guessed total.
- Cost of sales, fixed costs and staff costs modelled separately.
- A twelve-month profit and loss projection.
- A twelve-month cash flow forecast, including payment timing, so that revenue and cash receipts differ.
- Unit economics: acquisition cost, lifetime value, contribution margin and break-even volume.
- Three scenarios switched from a single cell.
- A check row proving internal consistency.

Acceptance criteria:
- No hard-coded numbers inside formulas.
- Changing one input updates the entire model correctly.
- The model shows the month of lowest cash and the funding required to survive it.
- A reader can understand the business from the model alone.`,
          },
          {
            title: "Capstone: Investment memo",
            durationMin: 300,
            content: `Write the document an investor or lender would use to make a decision.

Requirements:
- Business overview and what it sells.
- Market context and competitive position.
- Historic or projected financials, summarised in a table.
- Unit economics and the path to profitability.
- A valuation range with the method stated and a sensitivity table.
- The funding requirement, what it will be spent on, and the milestones it buys.
- Key risks, and what would have to be true for the investment to fail.
- A clear recommendation.

Acceptance criteria:
- The valuation shows a range and the assumptions that drive it, not a single number.
- The risks section would be recognised as fair by a sceptical reader.
- Every claim about the market has a source.
- The memo is no longer than eight pages, because nobody reads more.

How to submit: share the memo and the underlying model, and be prepared to defend the three assumptions that most affect the answer.`,
          },
        ],
      },
    ],
    quizzes: [
      {
        title: "Checkpoint 1: Accounting and Statements",
        durationMin: 15,
        passingScore: 70,
        questions: [
          {
            type: "MCQ",
            question: "Which equation must always balance in double-entry bookkeeping?",
            options: [
              "Assets = Liabilities + Equity",
              "Revenue = Costs + Profit",
              "Assets = Revenue - Expenses",
              "Equity = Assets + Liabilities",
            ],
            correctAnswer: "Assets = Liabilities + Equity",
          },
          {
            type: "MCQ",
            question: "Which statement shows the financial position at a single point in time?",
            options: [
              "The balance sheet",
              "The income statement",
              "The cash flow statement",
              "The statement of changes in equity",
            ],
            correctAnswer: "The balance sheet",
          },
          {
            type: "MCQ",
            question:
              "A business is profitable on paper but cannot pay its staff this month. What is the most likely explanation?",
            options: [
              "Customers pay on long credit terms, so revenue has been earned but not received",
              "The business has recorded too many expenses",
              "The gross margin is calculated incorrectly",
              "Profit and cash are always identical, so this cannot happen",
            ],
            correctAnswer:
              "Customers pay on long credit terms, so revenue has been earned but not received",
          },
          {
            type: "TRUE_FALSE",
            question:
              "Accrual accounting records revenue when it is earned rather than when payment is received.",
            correctAnswer: "true",
          },
          {
            type: "TRUE_FALSE",
            question: "A growing business always generates more cash than a stable one.",
            correctAnswer: "false",
          },
        ],
      },
      {
        title: "Final Assessment: Economics and Valuation",
        durationMin: 20,
        passingScore: 70,
        questions: [
          {
            type: "MCQ",
            question: "How is break-even volume calculated?",
            options: [
              "Fixed costs divided by contribution margin per unit",
              "Total costs divided by selling price",
              "Revenue divided by variable cost per unit",
              "Fixed costs multiplied by gross margin",
            ],
            correctAnswer: "Fixed costs divided by contribution margin per unit",
          },
          {
            type: "MCQ",
            question:
              "A business has a customer lifetime value of 300 and an acquisition cost of 400. What does this indicate?",
            options: [
              "It loses money on each customer acquired",
              "It has a healthy ratio and should spend more on marketing",
              "Its gross margin must be negative",
              "It will break even within one year",
            ],
            correctAnswer: "It loses money on each customer acquired",
          },
          {
            type: "MCQ",
            question:
              "Which pricing approach is usually the most profitable when you understand the customer's outcome well?",
            options: ["Value-based pricing", "Cost-plus pricing", "Competitor matching", "Penetration pricing"],
            correctAnswer: "Value-based pricing",
          },
          {
            type: "MCQ",
            question: "What is a discounted cash flow valuation based on?",
            options: [
              "The present value of the cash the business is expected to generate",
              "The price paid for similar companies recently",
              "The book value of the company's assets",
              "The founder's target exit price",
            ],
            correctAnswer:
              "The present value of the cash the business is expected to generate",
          },
          {
            type: "TRUE_FALSE",
            question:
              "A financial model should keep assumptions in labelled input cells rather than hard-coded inside formulas.",
            correctAnswer: "true",
          },
          {
            type: "TRUE_FALSE",
            question:
              "Quoting a valuation as a single precise figure is more credible than presenting a range with a sensitivity table.",
            correctAnswer: "false",
          },
        ],
      },
    ],
  },

  {
    title: "SEO and Digital Marketing Foundations",
    category: "Marketing",
    featured: true,
    thumbnailUrl: ytThumb("xsVTqzratPs"),
    description:
      "Get found and get chosen. Learn how search engines rank pages, how to do keyword research, on-page and technical SEO, link building, content strategy, email and social channels, and how to measure what actually drives customers rather than vanity traffic.",
    modules: [
      {
        title: "How Search Works",
        lessons: [
          {
            title: "SEO for beginners",
            durationMin: 45,
            videoUrl: yt("DvwS7cV9GmQ"),
            pdfUrl: PDFS.seoChecklist,
            content: `Search engine optimisation is the practice of earning traffic from unpaid search results. It compounds: a page that ranks keeps working for years, unlike an advert that stops the moment you stop paying.

Three things must happen for a page to rank:
1. Crawling. A search engine's robot must be able to reach the page.
2. Indexing. The page must be stored in the index and judged worth keeping.
3. Ranking. Among all indexed pages, yours must be judged the best answer for the query.

The factors that matter most, in rough order:
- Content that genuinely answers the searcher's question better than the alternatives.
- Relevance signals: the page is clearly about the topic, using the language searchers use.
- Links from other reputable sites, which act as votes of confidence.
- Technical health: the page loads quickly, works on mobile, and is not blocked.
- User signals: people who click through stay and find what they came for.

What does not work any more: keyword stuffing, buying links in bulk, thin pages generated at scale, and hidden text. These are actively penalised.

The attached checklist is a practical starting audit for any site.`,
          },
          {
            title: "The complete SEO course",
            durationMin: 180,
            videoUrl: yt("xsVTqzratPs"),
            content: `A full course from a team that does this professionally. Work through it over several sessions.

The four pillars it covers:

1. Keyword research. Find what people actually type, and how much competition exists for it. The important insight is search intent: someone searching "running shoes" wants to browse, someone searching "best running shoes for flat feet 2026" wants advice, and someone searching "buy nike pegasus size 43" wants to purchase. Serve the intent, not just the keyword.

2. On-page SEO. One page targets one primary topic. Put the main term in the title tag, the first heading and naturally in the opening paragraph. Write a compelling meta description — it does not affect ranking directly but it affects whether people click. Use descriptive URLs, add internal links to related pages, and give images real alt text.

3. Technical SEO. Ensure fast loading, mobile usability, a valid sitemap, sensible robots directives, canonical tags to handle duplicates, and structured data where relevant. Fix broken links and redirect chains.

4. Link building. Earn links by producing something worth linking to: original data, a genuinely useful tool, or the definitive guide on a narrow subject. Then tell the people who would want it. Do not buy links.

Deliverable: a keyword map for a real site, assigning one primary keyword and intent to each of twenty pages.`,
          },
        ],
      },
      {
        title: "The Wider Marketing Mix",
        lessons: [
          {
            title: "Digital marketing channels and how they fit together",
            durationMin: 90,
            videoUrl: yt("nU-IIXBWlS4"),
            content: `SEO is one channel among several. Understanding how they combine prevents you from over-investing in one.

The main channels and what each is good for:
- Search (organic). High intent, compounding, slow to start. Best for demand capture.
- Paid search. High intent, instant, stops when the budget stops. Good for testing which messages convert before investing in content.
- Content marketing. Builds trust and feeds every other channel. Slow, durable.
- Email. The only channel you own outright. Highest return per unit of effort in most businesses, and the most neglected.
- Social. Good for awareness and community, poor for direct response in most sectors. Choose the one or two platforms your customers actually use, rather than all of them badly.
- Paid social. Excellent for demand generation to a defined audience; requires strong creative.
- Partnerships and referrals. Cheap and high trust, and consistently underused.

The funnel gives you a way to think about it: awareness, consideration, conversion, retention. Most businesses over-invest in awareness and neglect retention, even though keeping a customer costs a fraction of winning one.

Deliverable: map your own business or a chosen one against the four funnel stages, and identify the weakest stage.`,
          },
          {
            title: "Positioning and message",
            durationMin: 20,
            videoUrl: yt("u4ZoJKF_VuA"),
            content: `Marketing tactics fail when the underlying message is unclear. No amount of distribution fixes a proposition nobody understands.

Before choosing channels, settle these:
- Who exactly is this for? Naming a narrow audience feels risky and works better than addressing everyone.
- What problem does it solve, described in the customer's words rather than yours?
- What is the alternative they will use if they do not choose you, including doing nothing?
- Why should they believe you? Proof: results, numbers, testimonials, guarantees.

Then write the message in the customer's language. Read your website copy and count how many sentences are about you and how many are about them. Most sites are heavily weighted the wrong way.

A practical test of your message: show your homepage to someone for five seconds, then hide it. Ask them what the company does and who it is for. If they cannot say, no marketing budget will help.

Deliverable: rewrite one page of copy so that the first sentence is entirely about the customer's problem.`,
          },
          {
            title: "Measurement that means something",
            durationMin: 40,
            content: `Marketing without measurement is expensive guessing, and measuring the wrong things is worse than not measuring.

Set up the basics: an analytics tool on the site, a search console account, and conversion tracking for the actions that matter.

Define your conversions before looking at any data. A conversion is an action with commercial value: a purchase, a qualified enquiry, a booking, a trial start. Page views are not conversions.

Metrics worth watching:
- Conversion rate by channel, not just traffic by channel. A channel sending a tenth of the traffic but converting five times better is your best channel.
- Cost per acquisition by channel.
- Organic clicks and average position for your target keywords.
- Email list growth and, more importantly, engaged subscribers.
- Retention or repeat purchase rate.

Metrics to distrust: impressions, follower counts, bounce rate in isolation, and time on page without context. They move without telling you whether the business improved.

Attribution honesty: most customers touch several channels before buying, and every attribution model is a simplification. Use it to inform decisions, not to settle arguments to three decimal places. When in doubt, ask new customers how they found you — the answer is often more useful than the dashboard.`,
          },
        ],
      },
      {
        title: "Projects and Capstone",
        lessons: [
          {
            title: "Project 1: SEO audit of a real site",
            durationMin: 210,
            content: `Audit a real website — your own, a friend's business, or a local organisation that has given permission.

Requirements:
- Technical check: indexation, mobile usability, page speed on a sample of pages, broken links, redirect chains, sitemap and robots configuration.
- On-page check for at least ten pages: title tags, headings, meta descriptions, URL structure, internal links, image alt text.
- Content check: which pages target which keywords, where two pages compete for the same term, and where obvious topics are missing.
- Backlink overview using any free tool.
- A prioritised list of recommendations, ranked by expected impact against effort.

Acceptance criteria:
- Every recommendation states the problem, the fix and the expected benefit.
- The top five items are genuinely the highest impact, not the easiest.
- Findings are evidenced with screenshots or tool output.`,
          },
          {
            title: "Project 2: Content plan and one published piece",
            durationMin: 240,
            content: `Plan a quarter of content and produce the first piece to a publishable standard.

Requirements:
- Keyword research producing at least twenty candidate topics with search volume, difficulty and intent.
- A content map assigning each topic to a funnel stage and a page type.
- A twelve-week publishing calendar with owners and formats.
- One complete piece, written and published or delivered ready to publish: properly structured, internally linked, with images and alt text, and an optimised title and description.
- A distribution plan for that piece: who you will tell, and where it will be shared.

Acceptance criteria:
- Topics are chosen for business value as well as search volume. A high-volume term with no commercial relevance is not a good topic.
- The published piece is genuinely the best available answer to its query, or you can say precisely how it will get there.
- The distribution plan is specific: named people, named communities, not "share on social media".`,
          },
          {
            title: "Capstone: Full marketing plan with measurement",
            durationMin: 360,
            content: `Produce the marketing plan for a real business, complete enough to execute.

Requirements:
- Situation analysis: where the business is now, with data.
- Target customer definition and positioning statement.
- Objectives expressed as numbers with dates, not aspirations.
- Channel strategy: which channels, why those, and what each is responsible for in the funnel.
- A content and campaign calendar for one quarter.
- Budget allocation with expected cost per acquisition by channel.
- A measurement framework: which metric proves each objective, where it is tracked, and who reviews it.
- Risks and what you will do if a channel underperforms.

Acceptance criteria:
- Objectives are specific and measurable. "Increase brand awareness" is not an objective; "grow organic enquiries from 20 to 60 per month by 31 March" is.
- The budget adds up and is justified by expected return.
- Every channel chosen has a stated reason connected to where the customers actually are.
- The plan includes what you will stop doing, not only what you will start.

How to submit: share the plan and present the one-page summary to someone in the business for feedback.`,
          },
        ],
      },
    ],
    quizzes: [
      {
        title: "Checkpoint 1: Search Fundamentals",
        durationMin: 15,
        passingScore: 70,
        questions: [
          {
            type: "MCQ",
            question: "What are the three stages a page must pass through to appear in search results?",
            options: [
              "Crawling, indexing and ranking",
              "Writing, publishing and sharing",
              "Bidding, targeting and converting",
              "Linking, tagging and caching",
            ],
            correctAnswer: "Crawling, indexing and ranking",
          },
          {
            type: "MCQ",
            question:
              "A user searches for \"best laptop for students under 5000\". What is the search intent?",
            options: [
              "Commercial investigation — they want advice before buying",
              "Navigational — they want a specific website",
              "Transactional — they intend to purchase immediately",
              "Informational only — they have no purchase interest",
            ],
            correctAnswer: "Commercial investigation — they want advice before buying",
          },
          {
            type: "MCQ",
            question: "What is the primary purpose of a meta description?",
            options: [
              "To persuade searchers to click, since it appears in the result snippet",
              "To directly increase ranking position",
              "To tell crawlers which pages to index",
              "To define the page's canonical URL",
            ],
            correctAnswer:
              "To persuade searchers to click, since it appears in the result snippet",
          },
          {
            type: "TRUE_FALSE",
            question:
              "Repeating a keyword as many times as possible on a page is an effective modern ranking tactic.",
            correctAnswer: "false",
          },
          {
            type: "TRUE_FALSE",
            question:
              "Links from other reputable websites act as a signal of credibility in search ranking.",
            correctAnswer: "true",
          },
        ],
      },
      {
        title: "Final Assessment: Channels and Measurement",
        durationMin: 20,
        passingScore: 70,
        questions: [
          {
            type: "MCQ",
            question: "Which marketing channel does the business own outright?",
            options: [
              "Email list",
              "Social media followers",
              "Organic search rankings",
              "Paid search placements",
            ],
            correctAnswer: "Email list",
          },
          {
            type: "MCQ",
            question:
              "Channel A sends 10,000 visits converting at 0.2 percent. Channel B sends 1,000 visits converting at 4 percent. Which performs better?",
            options: [
              "Channel B, with 40 conversions against 20",
              "Channel A, because it sends ten times the traffic",
              "They perform identically",
              "It cannot be determined without follower counts",
            ],
            correctAnswer: "Channel B, with 40 conversions against 20",
          },
          {
            type: "MCQ",
            question: "Which of these is a vanity metric?",
            options: [
              "Total impressions",
              "Cost per acquisition",
              "Conversion rate by channel",
              "Repeat purchase rate",
            ],
            correctAnswer: "Total impressions",
          },
          {
            type: "MCQ",
            question: "Which objective is written correctly?",
            options: [
              "Grow organic enquiries from 20 to 60 per month by 31 March",
              "Increase brand awareness significantly",
              "Become the market leader in our sector",
              "Post more often on social media",
            ],
            correctAnswer: "Grow organic enquiries from 20 to 60 per month by 31 March",
          },
          {
            type: "TRUE_FALSE",
            question:
              "Retention is usually cheaper than acquisition, yet receives less attention in most marketing plans.",
            correctAnswer: "true",
          },
          {
            type: "TRUE_FALSE",
            question:
              "A good marketing plan only specifies what to start doing, never what to stop.",
            correctAnswer: "false",
          },
        ],
      },
    ],
  },
];
