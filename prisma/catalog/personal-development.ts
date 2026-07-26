import { PDFS, yt, ytThumb, type SeedCourse } from "./types";

export const PERSONAL_DEVELOPMENT_COURSES: SeedCourse[] = [
  {
    title: "Focus, Habits and Learning How to Learn",
    category: "Personal Development",
    thumbnailUrl: ytThumb("O96fE1E-rf8"),
    description:
      "Evidence-based techniques for learning faster and finishing what you start. Covers how memory actually works, spaced repetition and active recall, defeating procrastination, habit design, deep work, sleep and energy — applied to a subject you are learning right now.",
    modules: [
      {
        title: "How Learning Works",
        lessons: [
          {
            title: "Learning how to learn",
            durationMin: 20,
            videoUrl: yt("O96fE1E-rf8"),
            content: `Barbara Oakley failed mathematics at school and later became an engineering professor. Her explanation of how learning works is the foundation of this course.

The central idea is two modes of thinking:
- Focused mode: deliberate, narrow concentration on something you already partly understand.
- Diffuse mode: relaxed, wide-ranging background processing that makes new connections.

Both are necessary, and you cannot be in both at once. This is why the solution to a problem arrives in the shower. When you are stuck, the productive move is often to stop, walk away, and let diffuse mode work — not to grind harder.

Other findings that change how you should study:
- Understanding is not the same as being able to do it. Watching a solution feels like learning and mostly is not.
- Chunking: as you practise, related pieces of information merge into a single retrievable unit. Experts are not faster thinkers; they hold bigger chunks.
- Einstellung: an existing idea in your head blocks a better one. Sometimes you must deliberately abandon your first approach.
- Illusions of competence: rereading and highlighting feel productive and produce almost no retention.

Reflection: name one subject where you have been rereading notes and mistaking familiarity for knowledge.`,
          },
          {
            title: "Study less, study smart",
            durationMin: 60,
            videoUrl: yt("IlU-zDU6aQ0"),
            content: `Marty Lobdell's lecture has been watched millions of times because it fixes the most common study mistakes in one sitting.

The practical rules:
- Study in blocks of 25 to 30 minutes, then take a real five-minute break. Attention degrades sharply after about half an hour, and everything studied after that point is largely wasted time.
- Reward yourself at the end of each block. The reward is not indulgence; it is what makes the habit stick.
- Have a dedicated place for studying, used for nothing else. Your environment becomes a cue.
- Distinguish facts from concepts. Facts need repetition; concepts need to be understood once, properly. Most students memorise concepts and try to understand facts, which is exactly backwards.
- Teach it to someone. If you cannot explain it in plain language, you do not yet understand it. This is the single most reliable test of comprehension available to you.
- Take notes in your own words, and expand them within 24 hours while the lecture is still recoverable in memory.
- Use SQ3R for textbooks: survey, question, read, recite, review.

Deliverable: restructure your next study session into 25-minute blocks with defined breaks and one taught explanation at the end.`,
          },
          {
            title: "Spaced repetition and active recall",
            durationMin: 20,
            videoUrl: yt("Z-zNHHpXoMM"),
            content: `Two techniques account for most of the difference between students who remember and students who cram and forget.

Active recall: retrieving information from memory rather than reviewing it. Close the book and write down everything you know. The struggle to retrieve is what builds the memory — reviewing while looking at the answer does almost nothing.

Spaced repetition: reviewing at increasing intervals, timed to just before you would forget. Review after one day, then three, then a week, then two weeks, then a month. Each successful retrieval makes the memory more durable.

Together these are more effective than any amount of rereading, and they take less total time.

How to apply them:
- Turn your notes into questions rather than statements. "The three stages of memory are..." becomes "What are the three stages of memory?"
- Use flashcards for facts, and self-generated exam questions for concepts.
- Anki and similar tools schedule the intervals for you, which removes the decision from the process.
- Interleave subjects rather than blocking them. Mixing topics feels harder and produces better retention and transfer.

Warning: these techniques feel worse than rereading. That is precisely why they work — the effort is the mechanism. Do not judge a study method by how comfortable it feels.`,
          },
          {
            title: "Sleep, energy and consolidation",
            durationMin: 20,
            videoUrl: yt("5MuIMqhT8DM"),
            content: `Sleep is not lost study time. It is the part of studying where memories are consolidated into long-term storage.

What the research shows:
- Sleep before learning prepares the brain to absorb new information; sleep after learning saves it.
- A single night of restricted sleep reduces the ability to form new memories by a large margin.
- The all-nighter is the worst possible strategy: you learn less during it and consolidate almost nothing afterwards.
- Short naps can improve afternoon learning capacity.

Practical adjustments that matter more than any study technique:
- Keep a consistent sleep and wake time, including at weekends.
- Avoid caffeine within eight hours of bedtime; its half-life is longer than most people assume.
- Get daylight in the morning, which anchors your body clock.
- Keep the room cool and dark.
- Do not study in bed. The association undermines both activities.

If you are sleeping five hours a night and looking for a productivity technique, the technique is sleep. Nothing in this course will compensate for chronic deprivation.`,
          },
        ],
      },
      {
        title: "Getting Started and Keeping Going",
        lessons: [
          {
            title: "Understanding procrastination",
            durationMin: 15,
            videoUrl: yt("arj7oStGLkU"),
            content: `Tim Urban's talk is funny and unusually accurate about the mechanism of procrastination.

Procrastination is not a time-management problem. It is an emotion-management problem. You avoid the task because starting it produces an unpleasant feeling — boredom, anxiety, uncertainty, or fear of doing it badly — and avoidance relieves that feeling immediately. The relief reinforces the avoidance.

This explains why "just be disciplined" fails and why these work better:
- Shrink the task until starting is trivially easy. Not "write the essay" but "open the document and write one bad sentence".
- Name the feeling. Which specific discomfort is this? Often it is not laziness but not knowing what the first step is.
- Reduce ambiguity. Vague tasks are avoided far more than difficult ones. "Prepare presentation" is vague; "list the six section headings" is not.
- Use implementation intentions: "at 9am on Tuesday, at my desk, I will write the introduction." Specifying when and where roughly doubles follow-through in the research.
- Remove the friction of starting: materials laid out, tabs closed, phone in another room.

Urban's point about deadlines is important too: tasks with no deadline are the ones that quietly never happen, and those are usually the important ones. Give them artificial deadlines with someone else involved.`,
          },
          {
            title: "Habit design",
            durationMin: 20,
            videoUrl: yt("PZ7lDrwYdZc"),
            content: `Motivation is unreliable. Habits are what make behaviour survive bad days.

The loop: cue, craving, response, reward. To build a habit, make it obvious, attractive, easy and satisfying. To break one, invert each: invisible, unattractive, difficult, unsatisfying.

Techniques that work in practice:
- Habit stacking. Attach the new behaviour to an existing one: "after I pour my morning coffee, I will review five flashcards."
- The two-minute rule. Scale the habit down until it takes two minutes. The goal at first is to establish the identity of being someone who does this, not to achieve the outcome.
- Environment design beats willpower. Put the guitar in the living room and the phone in a drawer. Most self-control is really environment control.
- Never miss twice. One missed day is an accident; two is the start of a new pattern.
- Track it visibly. A simple calendar with crosses is enough, and breaking the chain becomes its own deterrent.

Focus on the system rather than the goal. "Read 30 books this year" is a goal you can fail; "read 20 pages after breakfast" is a system that produces the goal as a by-product.

Deliverable: design one study habit using habit stacking and the two-minute rule, and track it for two weeks.`,
          },
          {
            title: "Attention, deep work and digital distraction",
            durationMin: 15,
            videoUrl: yt("3E7hkPZ-HTk"),
            content: `The ability to concentrate without interruption is becoming rare, which is exactly why it is becoming valuable.

The costs of fragmented attention:
- Attention residue. After switching tasks, part of your mind remains on the previous one for several minutes. Frequent switching means never being fully present on anything.
- The mere presence of a phone on the desk measurably reduces available cognitive capacity, even when it is face down and silent.
- Constant novelty trains impatience with the slow, difficult work that produces real understanding.

Practices that restore concentration:
- Schedule deep work blocks of 60 to 90 minutes with no notifications, no browser tabs beyond the task, and the phone in another room.
- Batch shallow work — email, messages, admin — into defined windows rather than letting it interleave with everything.
- Practise being bored. If you reach for your phone every time you queue, you are training the impulse you are trying to break.
- Keep a distraction list beside you. When a thought intrudes, write it down and return to the task instead of chasing it.

You do not need to quit social media, as this talk suggests, but you should decide deliberately how it fits your life rather than letting it decide for you.`,
          },
          {
            title: "Time management and priorities",
            durationMin: 70,
            videoUrl: yt("oTugjssqOT0"),
            content: `Randy Pausch's lecture on time management is practical, warm and stands up decades later.

The principles that matter most:
- Time is the only resource you cannot get more of. Treat it with at least the seriousness you treat money.
- Distinguish important from urgent. Urgent things announce themselves; important things wait quietly and then become emergencies. Spend deliberate time on important-but-not-urgent work or it will never happen.
- Do the ugliest thing first. The dread costs more than the task.
- Plan the week, then the day. A day planned the night before starts an hour ahead.
- Learn to say no, kindly and clearly. Every yes is a no to something else, usually to your own priorities.
- Delegate properly: give the whole task and the authority to do it, not a fragment with instructions.
- Keep a to-do list you actually trust, with items small enough to act on.
- Review what you did against what you planned. Without review you repeat the same misjudgements about how long things take.

Deliverable: track how you spend your time for three days in 30-minute blocks. Almost everyone is surprised, and the surprise is where the improvement lives.`,
          },
        ],
      },
      {
        title: "Mindset and Persistence",
        lessons: [
          {
            title: "Growth mindset and effort",
            durationMin: 15,
            videoUrl: yt("_X0mgOOSpLU"),
            content: `Carol Dweck's research distinguishes two beliefs about ability.

A fixed mindset treats ability as a trait you either have or do not. Under this belief, difficulty is evidence of inadequacy, so challenge feels threatening and failure feels final.

A growth mindset treats ability as something developed through effort and good strategy. Difficulty is evidence that learning is happening, so challenge is attractive and failure is information.

The practical difference shows up in behaviour: what you do when something is hard, whether you seek feedback or avoid it, and whether you choose tasks that stretch you or tasks that confirm you.

How to shift it:
- Add "yet". "I cannot do this" becomes "I cannot do this yet."
- Praise process rather than talent, in yourself and others. "You worked through that carefully" teaches something; "you're so clever" teaches that ability is fixed and must be protected.
- Treat errors as diagnostic. What exactly did I misunderstand?
- Be honest about strategy. Effort without a good method is not virtue, it is stubbornness. If something is not working after real effort, change the approach.

One caution: growth mindset is not the belief that anyone can do anything with enough positivity. It is the observation that improvement is possible and that treating ability as fixed reliably makes people improve less.`,
          },
          {
            title: "Grit and finishing long projects",
            durationMin: 10,
            videoUrl: yt("H14bBuluwB8"),
            content: `Angela Duckworth's research found that the strongest predictor of achievement across many fields was not talent or intelligence but grit: passion and perseverance for long-term goals.

What grit looks like in practice:
- Working on something that stays interesting to you for years, not weeks.
- Continuing after setbacks that would justify quitting.
- Deliberate practice: repeatedly working at the edge of your ability on the specific thing you are worst at, with feedback. This is uncomfortable, which is why most practice is not deliberate.

How to build it:
- Connect the work to a purpose beyond yourself. Interest sustains you for a while; purpose sustains you longer.
- Cultivate hope in the specific sense of believing your effort can change the outcome.
- Join a culture of people who take the thing seriously. Environment shapes persistence more than resolve does.

An honest caveat: persistence at the wrong thing is a cost, not a virtue. Grit is valuable when the goal is right. Reviewing whether the goal is still right is a separate skill, and quitting a bad path quickly is also a strength.

Reflection: name one long-term goal you have held for more than a year, and one you abandoned. What was different?`,
          },
        ],
      },
      {
        title: "Projects and Practice",
        lessons: [
          {
            title: "Project 1: Two-week learning experiment",
            durationMin: 180,
            content: `Apply the techniques to something you are genuinely learning and measure the difference.

Requirements:
- Choose a real subject with an upcoming test of competence: an exam, a certification, a skill demonstration.
- Baseline: record how you currently study, for how long, and score yourself on a short self-test.
- For two weeks, replace rereading with active recall and spaced repetition. Study in timed blocks. Teach at least three concepts aloud to someone.
- Keep a daily log: what you studied, for how long, which technique, and how well recall went.
- Re-test at the end with an equivalent test.

Acceptance criteria:
- The log is complete for all fourteen days, including the days it went badly.
- The comparison reports both time spent and results, so efficiency can be judged rather than just outcomes.
- You identify which single technique made the largest difference for you specifically.`,
          },
          {
            title: "Project 2: Build one keystone habit",
            durationMin: 120,
            content: `Design, run and evaluate a habit over thirty days.

Requirements:
- Choose one habit connected to something you care about. One, not five.
- Write it as an implementation intention: after [existing habit], I will [new habit], in [location].
- Scale it to a two-minute version for the first week.
- Redesign your environment to make it easier, and to make the competing behaviour harder. Document what you changed.
- Track completion daily on a visible chart.
- Apply the never-miss-twice rule and record every recovery.

Acceptance criteria:
- Thirty days of honest tracking, including failures.
- A written analysis of what triggered the missed days and what you changed in response.
- A judgement on whether the habit is now automatic, and what would happen if you stopped tracking.`,
          },
          {
            title: "Capstone: Personal learning and productivity system",
            durationMin: 240,
            content: `Assemble everything into a system you will still be using in a year.

Requirements:
- A written description of your system covering: how you capture tasks and ideas, how you plan a week and a day, how you study, how you review, and how you rest.
- Your defined deep work blocks and how you protect them.
- Your note-taking method and where notes live.
- Your spaced repetition setup, with the tool and the schedule.
- Your habit stack for the morning and the evening.
- A weekly review checklist.
- The rules you have set for phone and notifications.

Acceptance criteria:
- The system is simple enough that you followed it for at least three consecutive weeks. Elaborate systems that nobody follows are worthless.
- Every element is justified by something from the course rather than copied from a productivity influencer.
- You have documented at least two things you tried and abandoned, with the reason.
- Includes a plan for what you will do when the system breaks down, because it will.

How to submit: share the written system and a two-week log showing it in use.`,
          },
        ],
      },
    ],
    quizzes: [
      {
        title: "Checkpoint 1: How Learning Works",
        durationMin: 15,
        passingScore: 70,
        questions: [
          {
            type: "MCQ",
            question: "Which study technique produces the strongest long-term retention?",
            options: [
              "Active recall combined with spaced repetition",
              "Rereading notes several times",
              "Highlighting key passages in a textbook",
              "Listening to recorded lectures repeatedly",
            ],
            correctAnswer: "Active recall combined with spaced repetition",
          },
          {
            type: "MCQ",
            question: "What is an illusion of competence?",
            options: [
              "Mistaking familiarity with material for the ability to recall and use it",
              "Believing a subject is harder than it really is",
              "Overestimating how long a task will take",
              "Forgetting material shortly after an exam",
            ],
            correctAnswer:
              "Mistaking familiarity with material for the ability to recall and use it",
          },
          {
            type: "MCQ",
            question: "Why is sleep important for learning?",
            options: [
              "Memories are consolidated into long-term storage during sleep",
              "It gives the eyes time to rest after reading",
              "It resets motivation levels for the next day",
              "It has no effect on learning, only on mood",
            ],
            correctAnswer: "Memories are consolidated into long-term storage during sleep",
          },
          {
            type: "TRUE_FALSE",
            question:
              "Being unable to solve a problem after sustained focus is often a good reason to step away and let diffuse thinking work.",
            correctAnswer: "true",
          },
          {
            type: "TRUE_FALSE",
            question:
              "A study technique that feels effortless and comfortable is generally the most effective one.",
            correctAnswer: "false",
          },
        ],
      },
      {
        title: "Final Assessment: Habits, Focus and Mindset",
        durationMin: 20,
        passingScore: 70,
        questions: [
          {
            type: "MCQ",
            question: "Procrastination is best understood as which kind of problem?",
            options: [
              "An emotion-management problem, where avoidance relieves discomfort",
              "A time-management problem caused by poor scheduling",
              "A lack of intelligence or ability",
              "A permanent personality trait",
            ],
            correctAnswer:
              "An emotion-management problem, where avoidance relieves discomfort",
          },
          {
            type: "MCQ",
            question: "What is an implementation intention?",
            options: [
              "A plan specifying exactly when, where and how you will perform an action",
              "A written statement of your long-term goals",
              "A reward you promise yourself after completing work",
              "A list of reasons why a habit matters to you",
            ],
            correctAnswer:
              "A plan specifying exactly when, where and how you will perform an action",
          },
          {
            type: "MCQ",
            question: "What is attention residue?",
            options: [
              "Part of your attention remaining on a previous task after switching",
              "Fatigue that accumulates over a long working day",
              "The distraction caused by background noise",
              "Information forgotten between study sessions",
            ],
            correctAnswer: "Part of your attention remaining on a previous task after switching",
          },
          {
            type: "MCQ",
            question: "Which is the better application of habit stacking?",
            options: [
              "After I pour my morning coffee, I will review five flashcards",
              "I will study more this term",
              "I will review flashcards whenever I have free time",
              "I will aim to build a strong study routine",
            ],
            correctAnswer: "After I pour my morning coffee, I will review five flashcards",
          },
          {
            type: "TRUE_FALSE",
            question:
              "Deliberate practice means repeatedly working at the edge of your ability on your weakest points, with feedback.",
            correctAnswer: "true",
          },
          {
            type: "TRUE_FALSE",
            question:
              "A growth mindset means believing that anyone can achieve anything purely through positive thinking.",
            correctAnswer: "false",
          },
        ],
      },
    ],
  },

  {
    title: "Public Speaking and Persuasive Communication",
    category: "Personal Development",
    featured: true,
    thumbnailUrl: ytThumb("eIho2S0ZahI"),
    description:
      "Speak so that people listen, remember and act. Learn vocal technique, talk structure, slide design, managing nerves and reading a room — then apply the same skills to interviews and job applications, finishing with a recorded talk you are proud of.",
    modules: [
      {
        title: "The Fundamentals of Being Heard",
        lessons: [
          {
            title: "How to speak so that people want to listen",
            durationMin: 15,
            videoUrl: yt("eIho2S0ZahI"),
            content: `Julian Treasure's talk covers both what undermines a speaker and what strengthens one.

Seven habits to avoid: gossip, judging, negativity, complaining, excuses, exaggeration and dogmatism. Each one gives the listener a reason to discount you.

Four foundations worth standing on, which spell HAIL: honesty, authenticity, integrity and love, meaning genuine goodwill towards the audience.

Then the toolbox — the physical instrument you speak with:
- Register. Speaking from the chest rather than the nose or throat carries authority. Most nervous speakers rise in pitch; consciously dropping it helps.
- Timbre. Warmth in the voice is trainable through breathing and posture.
- Prosody. Meaning carried by melody. Speaking in a monotone or with the same rising inflection on every sentence drains the content of significance.
- Pace. Slow down for emphasis. Silence is an instrument, not a failure — a two-second pause before a key point does more than any adjective.
- Pitch and volume, used deliberately for contrast.

Practise: record yourself reading a paragraph twice, once normally and once consciously slower, lower and with deliberate pauses. The difference is usually startling.`,
          },
          {
            title: "How to speak: the complete lecture",
            durationMin: 65,
            videoUrl: yt("Unzc731iCUY"),
            content: `Patrick Winston delivered this lecture at MIT every year for decades. It is the most complete practical guide to speaking available free.

Take these away:
- Start with a promise, not a joke. Tell the audience what they will know by the end that they do not know now.
- Use cycling: say the important thing three times, in different ways. Audiences drift, and repetition is how you catch them when they return.
- Build a verbal fence around your idea so it is not confused with a similar one.
- Use verbal punctuation — landmarks that let a lost listener rejoin. "So that is the first of three problems."
- Ask a question, and be willing to wait for the answer.
- Time and place matter: mid-morning, in a well-lit room, well populated.
- Blackboard or slides? For teaching, a board is often better because its speed matches thought. Slides suit exposition and job talks.
- On slides: fewer words, larger type, no logos on every slide, no laser pointer waving.
- How to open a job talk: within five minutes, show your vision and what you have done about it.
- How to finish: not "thank you", which is weak, and not a question slide left up for twenty minutes. Salute the audience and end on your contribution.

Watch it once for the content, then again while sketching how you would restructure a talk you have already given.`,
          },
          {
            title: "Managing nerves and physical presence",
            durationMin: 20,
            videoUrl: yt("Ks-_Mh1QhMc"),
            content: `Nerves are not a sign that something is wrong. Adrenaline sharpens attention; the aim is to manage it rather than eliminate it.

What reliably helps:
- Preparation. Most anxiety is uncertainty about the material. Knowing your first two minutes cold removes the moment of highest risk.
- Rehearse aloud, standing, at full volume. Rehearsing in your head is a different activity and does not transfer.
- Arrive early and occupy the space. Stand where you will stand. Familiarity reduces threat.
- Slow exhalation. Breathe out for longer than you breathe in; this dampens the physical stress response within a minute.
- Reframe the sensation. The physiology of excitement and anxiety is nearly identical. Telling yourself "I am excited" measurably outperforms trying to calm down.
- Focus on the audience rather than yourself. Nerves are self-directed attention; service is other-directed.

On posture and presence: whatever you make of the specific research claims in this talk, the practical advice holds. Stand with your weight balanced, keep your hands visible and free, move deliberately rather than pacing, and make real eye contact with individuals for a few seconds each rather than sweeping the room.

Practise: deliver your opening two minutes standing, three times, recording each one.`,
          },
        ],
      },
      {
        title: "Structure and Story",
        lessons: [
          {
            title: "The structure behind great talks",
            durationMin: 20,
            videoUrl: yt("1nYFpuc2Umk"),
            content: `Nancy Duarte analysed many of history's most effective speeches and found a shared shape.

The pattern alternates between what is and what could be. The speaker describes the current situation, then a better future, then returns to the present gap, then to the possibility again. Each oscillation builds tension and the desire to close the gap. The talk ends not at the future state but at the new normal — what life is like once the change has happened.

Practical structure for almost any talk:
1. Open with the situation the audience recognises.
2. Introduce the tension: why the present is unacceptable or the opportunity is being missed.
3. Alternate: here is what is, here is what could be, repeated with increasing specificity.
4. Provide the path: what has to happen.
5. Close on the new normal, and a clear call to action.

Two rules that improve almost every talk:
- The audience is the hero, not you. You are the guide.
- One idea per talk. A talk with five key messages has none.

Deliverable: outline a ten-minute talk using this structure on a subject you know well.`,
          },
          {
            title: "Slides that help rather than compete",
            durationMin: 35,
            content: `Slides exist to help the audience understand. Most slides are speaker notes projected at people, which is the one thing they must never be.

Rules that fix the majority of presentations:
- One idea per slide. If it needs two, make two slides. Slides are free.
- Six words is a good target for a headline, and often the whole slide.
- Type at 30 point minimum. If the text does not fit, you have too much text, not a font problem.
- Images should carry meaning, not decorate. Stock photographs of people shaking hands communicate nothing.
- Charts: one message per chart, stated in the title. "Revenue grew 40 percent in Q3" is a title; "Q3 Revenue" is a label.
- Remove the template clutter: repeated logos, page numbers nobody reads, decorative lines.
- Never read your slides aloud. The audience reads faster than you speak and will resent you for it.
- Use a black slide when you want full attention on you.

Build the talk first, then the slides. Slides built first become the structure, and the structure of a slide deck is not the structure of an argument.

Deliverable: take an existing deck and cut its word count by two-thirds without losing meaning.`,
          },
        ],
      },
      {
        title: "Communicating Your Own Value",
        lessons: [
          {
            title: "Interview communication",
            durationMin: 60,
            videoUrl: yt("1qw5ITr3k9E"),
            content: `An interview is a structured conversation where the same speaking skills apply under pressure.

Answer behavioural questions with the STAR structure:
- Situation: the context, briefly.
- Task: what you were responsible for.
- Action: what you specifically did. Say "I", not "we" — panels need to know your contribution.
- Result: what happened, with a number if one exists, and what you learned.

Preparation that works:
- Prepare six stories, not thirty answers. Six well-chosen experiences can be adapted to almost any behavioural question.
- Research the organisation properly and have three specific, genuine questions ready.
- Practise saying your salary expectation out loud until it sounds ordinary.
- For technical interviews, think aloud. Interviewers are assessing reasoning, and silence tells them nothing.
- Prepare an honest answer about a real failure. Everyone can spot the disguised boast.

During the interview:
- Take a breath before answering. A two-second pause reads as considered, not slow.
- If you do not know, say so, then describe how you would find out.
- Ask for clarification rather than answering the wrong question confidently.

Watch this mock interview and note how the candidate handles uncertainty. That handling is often what is actually being assessed.`,
          },
          {
            title: "Written communication: CV and cover letter",
            durationMin: 40,
            videoUrl: yt("y8YH0Qbu5h4"),
            pdfUrl: PDFS.resumeGuide,
            content: `Your CV gets a short first scan. Everything must earn its place.

What works:
- One page for early career, two at most later. Reverse chronological order.
- Bullet points that lead with an action verb and end with a result: "Rebuilt the reporting pipeline, cutting month-end close from five days to one."
- Numbers wherever they honestly exist. Percentages, volumes, time saved, money earned.
- Tailor to the advert. Mirror its language where it accurately describes what you did, because both humans and screening systems look for it.
- Consistent formatting, one or two fonts, generous white space.
- Save and send as PDF unless told otherwise.

What to remove:
- Objective statements that say you are a hard-working team player. Everyone writes this and nobody believes it.
- Photographs, date of birth and marital status, unless local convention requires them.
- Duties copied from a job description. Responsibilities are not achievements.
- Any claim you cannot substantiate in an interview.

The cover letter, when one is asked for, should answer three questions in under 300 words: why this organisation, why this role, and why you. Never restate the CV.

The attached guide from Harvard's career service contains extensive real examples of both. Use it as a model, not a template to copy.`,
          },
        ],
      },
      {
        title: "Projects and Capstone",
        lessons: [
          {
            title: "Project 1: The five-minute talk",
            durationMin: 150,
            content: `Prepare, rehearse and record a five-minute talk on a subject you know well.

Requirements:
- One clear idea, stated as a single sentence before you begin writing.
- Structure using the what-is and what-could-be pattern.
- An opening that promises something specific, and a close that lands rather than trails off.
- No slides at all for this project. The talk must work on words and delivery alone.
- Rehearsed aloud at least five times, with the last two recorded.
- Delivered within 15 seconds of five minutes.

Acceptance criteria:
- You watch your own recording all the way through, which is uncomfortable and essential.
- You list three specific delivery habits to change, based on the recording rather than on how it felt.
- The final take shows measurable improvement on at least one of them.`,
          },
          {
            title: "Project 2: Presentation with slides",
            durationMin: 210,
            content: `Deliver a ten-minute presentation with a supporting deck to a live audience of at least three people.

Requirements:
- Talk written and structured before a single slide is made.
- No more than twelve slides, with an average of fewer than fifteen words each.
- At least one chart with the message in the title.
- Handles questions afterwards for at least five minutes.
- Feedback collected from the audience on three specific dimensions: clarity of the main idea, pace, and whether the slides helped or competed.

Acceptance criteria:
- The audience can state your one main idea afterwards, unprompted and correctly.
- You did not read from the slides at any point.
- At least one question was answered with "I do not know, but here is how I would find out" if that was the honest answer.`,
          },
          {
            title: "Capstone: Persuasive talk and application package",
            durationMin: 300,
            content: `Combine speaking and written communication into one package aimed at a real opportunity.

Requirements:
- A twelve to fifteen minute persuasive talk arguing for a specific change, with a clear call to action.
- Delivered live and recorded.
- A supporting deck that works if someone reads it without you, achieved with a separate notes version rather than by crowding the slides.
- A tailored CV and cover letter for a real role or opportunity you are pursuing.
- A prepared set of six STAR stories mapped to the competencies in that advert.
- A recorded five-minute answer to the question "tell me about yourself".

Acceptance criteria:
- The talk changes at least one listener's stated position, verified by asking before and after.
- The CV is genuinely tailored — a reader could identify which advert it targets without being told.
- Every STAR story has a concrete result.
- You have rehearsed the talk enough that you can recover from an interruption without losing your place.

How to submit: share the recording, the deck and the written documents, and note the one piece of feedback that was hardest to hear.`,
          },
        ],
      },
    ],
    quizzes: [
      {
        title: "Checkpoint 1: Voice and Structure",
        durationMin: 15,
        passingScore: 70,
        questions: [
          {
            type: "MCQ",
            question:
              "According to Nancy Duarte's analysis, what pattern do the most effective talks follow?",
            options: [
              "Alternating between what is and what could be, closing on the new normal",
              "A chronological account from beginning to end",
              "Three unrelated stories followed by a summary",
              "A list of facts ordered by importance",
            ],
            correctAnswer:
              "Alternating between what is and what could be, closing on the new normal",
          },
          {
            type: "MCQ",
            question: "What is 'cycling' in Patrick Winston's advice on speaking?",
            options: [
              "Saying the important idea several times in different ways",
              "Moving around the stage in a set pattern",
              "Rotating between speakers during a presentation",
              "Repeating the audience's questions before answering",
            ],
            correctAnswer: "Saying the important idea several times in different ways",
          },
          {
            type: "MCQ",
            question: "Which is the most effective way to open a talk?",
            options: [
              "A promise of what the audience will know by the end",
              "A joke to relax the room",
              "An apology for being nervous",
              "A detailed agenda slide",
            ],
            correctAnswer: "A promise of what the audience will know by the end",
          },
          {
            type: "TRUE_FALSE",
            question:
              "Deliberate pauses are a tool for emphasis rather than a sign that the speaker has lost their place.",
            correctAnswer: "true",
          },
          {
            type: "TRUE_FALSE",
            question:
              "Rehearsing a talk silently in your head transfers just as well as rehearsing it aloud and standing.",
            correctAnswer: "false",
          },
        ],
      },
      {
        title: "Final Assessment: Slides, Nerves and Interviews",
        durationMin: 20,
        passingScore: 70,
        questions: [
          {
            type: "MCQ",
            question: "What should the title of a chart on a slide contain?",
            options: [
              "The message the chart proves, such as 'Revenue grew 40 percent in Q3'",
              "A short label such as 'Q3 Revenue'",
              "The data source and date only",
              "Nothing — charts should speak for themselves",
            ],
            correctAnswer:
              "The message the chart proves, such as 'Revenue grew 40 percent in Q3'",
          },
          {
            type: "MCQ",
            question: "Which reframing is best supported for managing pre-talk nerves?",
            options: [
              "Telling yourself you are excited rather than trying to calm down",
              "Suppressing the physical symptoms through willpower",
              "Avoiding rehearsal so the delivery stays spontaneous",
              "Arriving at the last moment to reduce waiting time",
            ],
            correctAnswer: "Telling yourself you are excited rather than trying to calm down",
          },
          {
            type: "MCQ",
            question: "In the STAR structure, why should you say 'I' rather than 'we' in the Action step?",
            options: [
              "The panel needs to know your specific contribution",
              "It sounds more confident regardless of accuracy",
              "Teamwork is viewed negatively by interviewers",
              "It keeps the answer shorter",
            ],
            correctAnswer: "The panel needs to know your specific contribution",
          },
          {
            type: "MCQ",
            question: "Which CV bullet point is strongest?",
            options: [
              "Rebuilt the reporting pipeline, cutting month-end close from five days to one",
              "Responsible for reporting and data tasks",
              "Hard-working team player with excellent communication skills",
              "Worked in the finance department for two years",
            ],
            correctAnswer:
              "Rebuilt the reporting pipeline, cutting month-end close from five days to one",
          },
          {
            type: "TRUE_FALSE",
            question:
              "Slides should be written first, and the talk then built around the slide order.",
            correctAnswer: "false",
          },
          {
            type: "TRUE_FALSE",
            question:
              "Saying you do not know an answer, then explaining how you would find out, is an acceptable interview response.",
            correctAnswer: "true",
          },
        ],
      },
    ],
  },
];
