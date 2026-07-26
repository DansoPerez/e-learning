import { PDFS, yt, ytThumb, type SeedCourse } from "./types";

export const ACADEMIC_COURSES: SeedCourse[] = [
  {
    title: "Academic Writing and Research Methods",
    category: "Academics",
    price: 199,
    thumbnailUrl: ytThumb("vtIzMaLkCaM"),
    description:
      "A professional academic-writing programme. Build argument and thesis, search and review literature, choose methods ethically, and cite correctly — with university writing guides from BTU, OvGU, Manchester and Glasgow, plus a full research-paper capstone.",
    modules: [
      {
        title: "Writing That Earns a Reader",
        lessons: [
          {
            title: "The craft of writing effectively",
            durationMin: 80,
            videoUrl: yt("vtIzMaLkCaM"),
            pdfUrl: PDFS.academicWritingGuide,
            content: `Larry McEnerney runs the University of Chicago's writing programme, and this lecture reframes academic writing entirely.

His central argument: you were taught to write to demonstrate that you had learned something. That writing was read by someone paid to read it. In the real academic world, nobody is paid to read your work, so writing must instead create value for a specific community of readers.

The consequences are practical and uncomfortable:
- Clear, organised and persuasive writing is not enough. The writing must be valuable to the people you want to read it.
- Value is defined by the reader's community, not by you. You must know what that community already believes and what it finds problematic.
- The function of an introduction is to create instability — to show the reader that something they believe is incomplete or wrong. Without that tension, there is no reason to keep reading.
- Words that signal this instability: however, but, although, inconsistent, anomaly, surprising, puzzling. If your paper contains none of these, it may not have an argument.
- Do not use writing to work out your thinking and then submit the result. Thinking-writing and reader-writing are different documents.

The attached guide covers the formal mechanics: structure, workflow and requirements. Watch the lecture for the mindset, then use the guide for the machinery.`,
          },
          {
            title: "Thesis, argument and paragraph structure",
            durationMin: 45,
            videoUrl: yt("6OLPL5p0fMg"),
            pdfUrl: PDFS.academicStyleGuide,
            content: `An academic paper is an argument, and every part of it should serve that argument.

The thesis statement is a claim that a reasonable person could dispute. Test yours: can you imagine someone qualified arguing the opposite? If not, it is a topic or an observation, not a thesis.

Weak: "This paper examines mobile money adoption in Ghana."
Strong: "Mobile money adoption in Ghana has been driven primarily by agent network density rather than by smartphone penetration, which explains why rural uptake outpaced urban uptake between 2015 and 2020."

The second version tells the reader what you claim, what you reject, and what evidence will follow.

Paragraph discipline:
- One idea per paragraph.
- The topic sentence states the idea. A reader should be able to read only the first sentence of every paragraph and follow your entire argument.
- Then evidence, then interpretation of that evidence, then a link onward. Evidence never speaks for itself; the sentence after a quotation or a table is where the analysis happens.
- Transitions carry logic: however signals contrast, therefore signals consequence, moreover signals addition. Using the wrong one confuses the reader about your reasoning.

Standard structure: introduction with context, gap and thesis; literature review; methodology; results; discussion; conclusion. Different disciplines vary the names, not the logic.

The attached style guide covers formal conventions, citation practice and language rules in detail.`,
          },
          {
            title: "Critical thinking and evaluating sources",
            durationMin: 30,
            videoUrl: yt("6OLPL5p0fMg"),
            content: `Critical thinking is the discipline of proportioning belief to evidence, and it is the underlying skill in all academic work.

Evaluate every source on:
- Authority. Who wrote it, what are their credentials, and who funded it?
- Peer review. Was it scrutinised by other specialists before publication?
- Currency. Is it recent enough to matter in a fast-moving field?
- Evidence. Are claims supported by data, and can you inspect that data?
- Bias. What position does the author or funder hold, and how might it shape the conclusions?

The hierarchy of evidence, strongest first: systematic reviews and meta-analyses, randomised controlled trials, cohort studies, case-control studies, case reports, expert opinion, anecdote.

Reasoning errors to catch in your own work as well as in others':
- Correlation treated as causation.
- Cherry-picking the studies that agree with you.
- Appeal to authority in place of evidence.
- Straw man: refuting a weakened version of the opposing view.
- Survivorship bias: studying only the cases that remain visible.
- Confirmation bias, which is the default state of every researcher including you.

Practical safeguard: before writing your conclusion, deliberately spend an hour searching for evidence that contradicts it. If you find none, you have either a strong finding or a weak search.`,
          },
        ],
      },
      {
        title: "Finding and Reviewing the Literature",
        lessons: [
          {
            title: "Searching the literature systematically",
            durationMin: 40,
            content: `A good search is reproducible, which means recorded rather than remembered.

Where to search:
- Google Scholar for breadth and citation chains.
- Your institution's database subscriptions for full text.
- Discipline-specific databases: PubMed, JSTOR, IEEE Xplore, ERIC, Scopus, Web of Science.
- Open repositories: arXiv, SSRN, DOAJ, and institutional repositories for otherwise paywalled work.

How to search well:
- Build your search string from concepts, not sentences. Combine synonyms with OR, and concepts with AND: ("mobile money" OR "digital wallet") AND (adoption OR uptake) AND Ghana.
- Use quotation marks for phrases and the asterisk for word stems.
- Filter by date, publication type and peer-review status.
- Record every search: the database, the exact string, the date, and the number of results. Reviewers ask, and you will forget.

Follow the citation trail in both directions. Backwards: read the reference list of a key paper. Forwards: use "cited by" to find newer work that builds on it. Two or three iterations of this usually reveal the core literature of any narrow field.

Manage what you find with Zotero or Mendeley from day one. Both are free, both capture references from your browser, and both generate bibliographies. Retyping references by hand at 2am is an avoidable experience.`,
          },
          {
            title: "Writing a literature review",
            durationMin: 20,
            videoUrl: yt("zIYC6zG265E"),
            content: `A literature review is not a list of summaries. It is an argument about the state of knowledge that justifies your own study.

The difference in practice:

Weak: "Mensah (2019) found X. Osei (2020) found Y. Adjei (2021) found Z."
Strong: "Early work attributed adoption to smartphone access (Mensah, 2019; Osei, 2020). More recent studies question this, finding stronger effects from agent density (Adjei, 2021), but all three rely on urban samples, leaving rural adoption largely unexplained."

The second version groups, compares, evaluates and identifies a gap. That gap is where your research lives.

How to build one:
1. Read and take structured notes: research question, method, sample, findings, limitations.
2. Build a synthesis matrix — a table with sources down the side and themes across the top. Patterns become visible immediately.
3. Organise by theme or by chronology of debate, never by source.
4. In each theme: what is agreed, what is contested, what is missing.
5. End by stating the gap and how your study addresses it.

Every paragraph should reference multiple sources. A paragraph citing one source is a summary, not a synthesis.`,
          },
        ],
      },
      {
        title: "Designing and Conducting Research",
        lessons: [
          {
            title: "Research methods and design",
            durationMin: 55,
            videoUrl: yt("IsAUNs-IoSQ"),
            content: `Method follows question. Choosing a method first and then finding a question to fit it is the most common design error in student research.

Quantitative methods answer how much, how many, how often, and whether a relationship exists. Surveys, experiments, secondary data analysis. They give generalisability and statistical inference, and they require careful sampling.

Qualitative methods answer why and how. Interviews, focus groups, ethnography, document analysis, case studies. They give depth, context and mechanism, and they require rigour in coding and interpretation rather than in sampling size.

Mixed methods combine both, usually with one leading. Say which leads and why.

Design decisions to make explicit:
- Population and sampling strategy. Random, stratified, purposive, convenience — each with its consequence for what you can claim.
- Sample size, and its justification.
- Instruments: your questionnaire, interview guide or protocol, included in an appendix.
- Validity: are you measuring what you claim to measure?
- Reliability: would the same procedure produce the same result again?
- Limitations, stated honestly in the methodology rather than buried at the end.

Ethics is not paperwork. Informed consent, the right to withdraw, anonymity, secure data storage, and approval from your ethics committee before collecting anything. Data collected without approval usually cannot be used, however good it is.`,
          },
          {
            title: "Citation, referencing and academic integrity",
            durationMin: 25,
            videoUrl: yt("9pbUoNa5tyY"),
            pdfUrl: PDFS.manchesterReferencing,
            content: `Citation exists so a reader can verify your claims and trace an idea to its origin. Everything else follows from that purpose.

Cite whenever you use someone else's idea, data, argument, structure or words, whether quoted or paraphrased. The only exception is common knowledge within your field, and when unsure, cite.

Styles differ in punctuation, not in principle:
- APA: author-date, common in social sciences and education.
- MLA: author-page, common in humanities.
- Harvard: author-date with several variants.
- IEEE and Vancouver: numbered, common in engineering and medicine.

Use whichever your department specifies, and be consistent. A reference manager handles the formatting so you can think about the argument.

Plagiarism includes: copying text without quotation marks even with a citation, paraphrasing too closely, reusing your own submitted work without declaring it, and fabricating or altering data. Most cases in universities are careless rather than dishonest — the usual cause is poor note-taking that loses track of which words were whose.

Preventive habit: in your notes, mark every quotation with quotation marks and a page number at the moment you record it. Never paste text into a draft without marking it first.

On generative AI: policies vary and are changing. Find out your institution's rule, follow it, and declare use where required. Submitting generated text as your own thinking is misconduct in most institutions, and it also skips the part where you learn something.`,
          },
        ],
      },
      {
        title: "Projects and Capstone",
        lessons: [
          {
            title: "Project 1: Annotated bibliography and synthesis matrix",
            durationMin: 210,
            content: `Choose a narrow research question and map the literature around it.

Requirements:
- A research question specific enough to answer in a single paper.
- At least fifteen peer-reviewed sources, no more than a third older than ten years unless the field justifies it.
- For each source, an annotation of 100 to 150 words covering the question, method, sample, key finding and limitation.
- A synthesis matrix mapping sources against at least four themes.
- A search log recording every database, search string, date and result count.
- A one-page statement of the gap you have identified.

Acceptance criteria:
- Sources are genuinely relevant, not padded with tangential work.
- Annotations evaluate rather than summarise — each says something about quality or limitation.
- The stated gap follows visibly from the matrix.`,
          },
          {
            title: "Project 2: Research proposal",
            durationMin: 240,
            content: `Write the proposal you would submit to a supervisor or an ethics committee.

Requirements:
- Title, and an abstract of no more than 250 words.
- Background and problem statement with cited evidence.
- Research question, sub-questions and, where appropriate, hypotheses.
- A literature review of 1,500 to 2,000 words, synthesised rather than listed.
- Methodology: design, population, sampling, instruments, procedure and analysis plan.
- Ethical considerations, including consent, anonymity and data handling.
- Timeline with milestones, and a budget if relevant.
- Limitations and how you will mitigate them.
- Complete reference list in a single consistent style.

Acceptance criteria:
- The method demonstrably answers the question asked, and you can explain why an alternative method was rejected.
- The analysis plan is specific: which test, which comparison, which coding approach.
- The ethics section addresses real risks in your specific study, not generic statements.
- Every in-text citation appears in the reference list and vice versa.`,
          },
          {
            title: "Capstone: Complete research paper",
            durationMin: 480,
            content: `Carry out a small study and write it up to publication standard.

Requirements:
- Executed study following your approved proposal, with any deviations documented and explained.
- Full paper: abstract, introduction, literature review, methodology, results, discussion, conclusion, references and appendices.
- Results presented in clearly labelled tables and figures, each referred to in the text.
- Discussion that interprets rather than repeats results, relates findings back to the literature, and states limitations honestly.
- Conclusion that answers the research question directly and proposes further work.
- Between 4,000 and 6,000 words excluding references.
- Instruments included as appendices.

Acceptance criteria:
- The abstract alone conveys the question, method, finding and significance.
- Every claim in the discussion is supported by your data or a citation.
- Limitations are specific to your study, and at least one is genuinely uncomfortable to admit.
- The paper has been read by one other person and revised in response before submission.
- No claim of causation is made from correlational data.

How to submit: share the paper as a PDF along with your data collection instruments and, where ethics permit, your anonymised dataset.`,
          },
        ],
      },
    ],
    quizzes: [
      {
        title: "Checkpoint 1: Argument and Sources",
        durationMin: 15,
        passingScore: 70,
        questions: [
          {
            type: "MCQ",
            question: "Which of these is a defensible thesis statement?",
            options: [
              "Agent network density, rather than smartphone access, explains rural mobile money adoption in Ghana",
              "This paper examines mobile money adoption in Ghana",
              "Mobile money is an important topic in development economics",
              "There are many factors affecting mobile money adoption",
            ],
            correctAnswer:
              "Agent network density, rather than smartphone access, explains rural mobile money adoption in Ghana",
          },
          {
            type: "MCQ",
            question: "What distinguishes a literature review from a set of summaries?",
            options: [
              "It groups, compares and evaluates sources to identify a gap",
              "It is longer and includes more sources",
              "It presents sources in chronological order",
              "It quotes directly from each source",
            ],
            correctAnswer: "It groups, compares and evaluates sources to identify a gap",
          },
          {
            type: "MCQ",
            question:
              "Which sits highest in the conventional hierarchy of evidence?",
            options: [
              "A systematic review or meta-analysis",
              "A single randomised controlled trial",
              "An expert opinion piece",
              "A well-documented case report",
            ],
            correctAnswer: "A systematic review or meta-analysis",
          },
          {
            type: "MCQ",
            question:
              "According to McEnerney, what is the purpose of an academic introduction?",
            options: [
              "To create instability by showing the reader that something they believe is incomplete",
              "To demonstrate how much reading the author has done",
              "To define all the technical terms used later",
              "To summarise the conclusions in advance",
            ],
            correctAnswer:
              "To create instability by showing the reader that something they believe is incomplete",
          },
          {
            type: "TRUE_FALSE",
            question:
              "A reader should be able to follow your whole argument by reading only the first sentence of each paragraph.",
            correctAnswer: "true",
          },
          {
            type: "TRUE_FALSE",
            question:
              "Paraphrasing a source closely is acceptable without a citation as long as no words are copied exactly.",
            correctAnswer: "false",
          },
        ],
      },
      {
        title: "Final Assessment: Method and Integrity",
        durationMin: 20,
        passingScore: 70,
        questions: [
          {
            type: "MCQ",
            question:
              "You want to understand why farmers reject a new irrigation scheme. Which approach fits best?",
            options: [
              "Qualitative interviews, because the question asks why",
              "A large-scale survey, because it produces statistics",
              "A randomised controlled trial, because it establishes causation",
              "Secondary data analysis, because it is quickest",
            ],
            correctAnswer: "Qualitative interviews, because the question asks why",
          },
          {
            type: "MCQ",
            question: "What does validity refer to in research design?",
            options: [
              "Whether you are measuring what you claim to measure",
              "Whether the same procedure would give the same result again",
              "Whether the sample is large enough",
              "Whether the study received ethical approval",
            ],
            correctAnswer: "Whether you are measuring what you claim to measure",
          },
          {
            type: "MCQ",
            question: "When must ethical approval be obtained?",
            options: [
              "Before any data is collected",
              "Before the paper is submitted for marking",
              "Only when the study involves children",
              "After analysis, when the findings are known",
            ],
            correctAnswer: "Before any data is collected",
          },
          {
            type: "MCQ",
            question: "Why should a search log record exact search strings and dates?",
            options: [
              "So the literature search is reproducible and can be defended",
              "So the bibliography can be generated automatically",
              "Because databases charge per search",
              "To prove how many hours were spent researching",
            ],
            correctAnswer: "So the literature search is reproducible and can be defended",
          },
          {
            type: "TRUE_FALSE",
            question:
              "Deliberately searching for evidence that contradicts your conclusion is good practice before writing it.",
            correctAnswer: "true",
          },
          {
            type: "TRUE_FALSE",
            question:
              "The discussion section should mainly restate the results in the same order they were presented.",
            correctAnswer: "false",
          },
        ],
      },
    ],
  },

  {
    title: "Statistics and Data Literacy for Students",
    category: "Academics",
    price: 249,
    thumbnailUrl: ytThumb("xxpc-HPKN28"),
    description:
      "A professional statistics-literacy programme. Master descriptive stats, sampling, confidence intervals, hypothesis tests and regression — with Georgia Tech, Rutgers and York College (CUNY) course readings, spreadsheet practice and a statistical-report capstone.",
    modules: [
      {
        title: "Describing Data",
        lessons: [
          {
            title: "A full university course in statistics",
            durationMin: 300,
            videoUrl: yt("xxpc-HPKN28"),
            pdfUrl: PDFS.gatechStatistics,
            content: `The reference lesson for the whole course. Work through it in sections over several weeks rather than attempting it in one sitting.

The order of ideas, and why each matters:

1. Descriptive statistics. Mean, median, mode, range, variance, standard deviation. The median is the honest average whenever data is skewed, which is most of the time with income, house prices and waiting times.

2. Distributions. The normal distribution and why it appears so often, plus skew and kurtosis. Learn to look at a histogram before calculating anything.

3. Probability. Independent and dependent events, conditional probability and Bayes' theorem. Conditional probability is where intuition fails most spectacularly, especially with rare conditions and imperfect tests.

4. Sampling and the central limit theorem. Why sample means are normally distributed even when the underlying data is not, and why this makes inference possible at all.

5. Confidence intervals. A range of plausible values, with a specific and frequently misstated interpretation.

6. Hypothesis testing. t-tests, chi-squared, ANOVA, and what a p-value does and does not tell you.

7. Correlation and regression. Measuring relationships, fitting lines, and interpreting coefficients.

The attached book, Think Stats, teaches the same material through Python code. If you prefer learning by doing, read it alongside.`,
          },
          {
            title: "Summarising data honestly",
            durationMin: 35,
            videoUrl: yt("xxpc-HPKN28"),
            pdfUrl: PDFS.yorkStatsWriting,
            content: `Before any test, describe your data properly. Most analytical mistakes are made before a single test is run.

Always compute and always look at:
- Sample size, including how many observations are missing and why.
- Centre: mean and median. When they differ substantially, the data is skewed and the mean is misleading.
- Spread: standard deviation and interquartile range.
- Shape: draw a histogram. Statistics that assume normality behave badly on strongly skewed data, and you cannot know without looking.
- Extremes: minimum, maximum and any implausible values. A recorded age of 200 is a data entry error, not an outlier.

Numbers alone deceive. Anscombe's quartet is four datasets with nearly identical means, variances and correlations that look completely different when plotted. Always plot.

Reporting conventions that show competence:
- Report the sample size with every statistic.
- Give the measure of spread alongside every average.
- Round sensibly. Reporting a mean to four decimal places from a sample of thirty implies a precision you do not have.
- State what you excluded and why.

Practice task: take any dataset with at least 200 rows, produce a full descriptive summary, and write three sentences describing it to someone who cannot see the numbers.`,
          },
        ],
      },
      {
        title: "Inference and Testing",
        lessons: [
          {
            title: "Hypothesis testing and p-values",
            durationMin: 20,
            videoUrl: yt("0oc49DyA3hU"),
            content: `StatQuest explains the null hypothesis with unusual clarity. Watch it twice.

The logic of a hypothesis test:
1. State a null hypothesis, usually "there is no difference" or "there is no relationship".
2. Assume it is true.
3. Calculate how surprising your data would be under that assumption.
4. If it would be very surprising, reject the null hypothesis.

The p-value is the probability of observing data at least as extreme as yours if the null hypothesis were true.

What a p-value is not, and these misinterpretations appear constantly in published work:
- It is not the probability that the null hypothesis is true.
- It is not the probability that your finding is a fluke.
- It is not a measure of effect size. A tiny, meaningless difference becomes statistically significant with a large enough sample.
- p = 0.049 and p = 0.051 are not meaningfully different, despite one crossing the conventional threshold.

Always report the effect size and a confidence interval alongside the p-value. "Significant" means "unlikely under the null", not "important".

Two errors to keep in mind: a Type I error rejects a true null hypothesis (a false alarm), and a Type II error fails to reject a false one (a miss). Setting a stricter threshold reduces the first and increases the second.`,
          },
          {
            title: "Choosing the right test",
            durationMin: 40,
            videoUrl: yt("0oc49DyA3hU"),
            pdfUrl: PDFS.rutgersStatistics,
            content: `A decision guide you can return to for coursework and dissertations.

Comparing means:
- One group against a known value: one-sample t-test.
- Two independent groups: independent samples t-test, or Mann-Whitney U if the data is not normal.
- Two measurements on the same subjects: paired t-test, or Wilcoxon signed-rank if not normal.
- Three or more groups: ANOVA, or Kruskal-Wallis if not normal.

Relationships:
- Two continuous variables: Pearson correlation, or Spearman if the relationship is monotonic but not linear or the data is ranked.
- Two categorical variables: chi-squared test of independence.
- Predicting a continuous outcome: linear regression.
- Predicting a binary outcome: logistic regression.

Before choosing, check the assumptions:
- Level of measurement: nominal, ordinal, interval or ratio.
- Independence of observations. Repeated measures from the same people violate this and require a paired or mixed model.
- Normality, checked with a histogram or a Q-Q plot rather than assumed.
- Equal variances between groups, where the test requires it.

If assumptions fail, use the non-parametric equivalent rather than proceeding and hoping. Reporting the assumption checks you performed is a mark of competence that most student work omits.`,
          },
          {
            title: "Correlation, regression and causation",
            durationMin: 40,
            videoUrl: yt("xxpc-HPKN28"),
            pdfUrl: PDFS.thinkStats,
            content: `Regression is the workhorse of applied statistics, and it is routinely over-interpreted.

Correlation, denoted r, runs from -1 to 1 and measures only the strength of a linear relationship. A perfect U-shaped relationship has a correlation near zero. Always look at the scatter plot.

Simple linear regression fits y = a + bx. The slope b is the estimated change in y for a one-unit increase in x. R-squared is the proportion of variation in y explained by the model.

Multiple regression adds more predictors, and each coefficient is interpreted as the effect of that variable while holding the others constant.

Where it goes wrong:
- Causation. Regression describes association. Causal claims require an experimental design or careful causal identification, not a small p-value.
- Confounding. A third variable driving both x and y creates a relationship that vanishes when it is controlled for. Ice cream sales predict drownings; temperature explains both.
- Extrapolation. A model fitted on ages 18 to 65 says nothing about a 90-year-old.
- Overfitting. Adding predictors always increases R-squared, even when they are random noise. Use adjusted R-squared.

The honest formulation for observational data: "X is associated with Y after adjusting for A and B", never "X causes Y".`,
          },
        ],
      },
      {
        title: "Practical Analysis and Presentation",
        lessons: [
          {
            title: "Statistics in spreadsheets",
            durationMin: 120,
            videoUrl: yt("Vl0H-qTclOg"),
            content: `Most student analysis happens in a spreadsheet, and that is fine if it is done carefully.

Functions to know: AVERAGE, MEDIAN, STDEV.S, VAR.S, COUNT, COUNTIF, CORREL, and the analysis functions T.TEST, CHISQ.TEST and LINEST. Enable the Analysis ToolPak for descriptive statistics, regression, ANOVA and histograms in one dialogue.

Spreadsheet discipline for research data:
- Keep the raw data on its own sheet and never edit it. All cleaning happens on a copy, with the steps documented.
- One variable per column, one observation per row, one value per cell. This "tidy" layout makes every subsequent step easier.
- No merged cells, no colour-as-data, no units mixed into number cells.
- Use a separate codebook sheet defining every variable, its type, its units and its permitted values.
- Beware automatic date conversion mangling identifiers and gene names — set the column type before pasting.

When to leave the spreadsheet: repeated measures models, large datasets, anything you will need to redo when the data changes, and anything that must be reproducible. At that point move to R, Python or a statistics package. The transition is easier than the alternative of rebuilding a 40-sheet workbook.`,
          },
          {
            title: "Charts that tell the truth",
            durationMin: 60,
            videoUrl: yt("AGrl-H87pRU"),
            content: `Presenting results is part of the analysis, and it is where honest work is most often undermined by careless choices.

Choose the chart by the question:
- Distribution of one variable: histogram or box plot.
- Comparison between groups: bar chart with error bars, or a box plot.
- Relationship: scatter plot, with a fitted line only if a line is justified.
- Change over time: line chart.
- Composition: stacked bar, and only where the parts genuinely sum to a whole.

Practices that mislead, whether intended or not:
- Truncating the y-axis on a bar chart, which exaggerates small differences. Bar charts must start at zero; line charts need not, but should say so.
- Showing means without any indication of variability.
- Dual axes chosen to make two series appear related.
- Omitting the sample size.
- 3D effects, which distort the very comparison the chart exists to make.

Every figure needs: a title stating the finding, labelled axes with units, the sample size, and a note on what the error bars represent. A reader should understand the figure without reading your text.

Practice task: find a chart in a news article that misleads, explain the technique, and redraw it honestly.`,
          },
        ],
      },
      {
        title: "Projects and Capstone",
        lessons: [
          {
            title: "Project 1: Descriptive analysis and critique",
            durationMin: 180,
            content: `Take a real public dataset and describe it rigorously, then critique a published claim about it.

Requirements:
- Full descriptive summary: sample size, missing data, centre, spread and shape for every key variable.
- At least four charts, correctly chosen for the variable types.
- Identification of any data quality problems, with your handling of each documented.
- A critique of one published article or news report using this data or a similar dataset, identifying at least three problems with how the statistics were presented.

Acceptance criteria:
- Every statistic is reported with its sample size and a measure of spread.
- The critique addresses specific statistical issues, not general disagreement with the conclusions.
- Charts follow the honesty rules from the course.`,
          },
          {
            title: "Project 2: Hypothesis test with full reporting",
            durationMin: 210,
            content: `Answer a research question with an appropriate statistical test, reported to journal standard.

Requirements:
- A clearly stated research question and a null hypothesis.
- Justification for the chosen test, including why alternatives were rejected.
- Documented assumption checks with the evidence, such as histograms or Q-Q plots.
- The test performed, with the test statistic, degrees of freedom, p-value, effect size and confidence interval all reported.
- A plain-language interpretation of what the result means for the original question.
- A statement of what the result does not show.

Acceptance criteria:
- The interpretation of the p-value is correct and does not claim the probability of the hypothesis being true.
- Effect size is reported and discussed, not just significance.
- If assumptions were violated, an appropriate alternative test was used rather than the original applied anyway.`,
          },
          {
            title: "Capstone: Statistical report on a real question",
            durationMin: 360,
            content: `Produce a complete statistical report of the kind expected in a dissertation chapter.

Requirements:
- A research question of genuine interest, with background and justification.
- Data sourced and described, including sampling and any bias in how it was collected.
- Descriptive statistics for all variables in a properly formatted table.
- Inferential analysis: at least one hypothesis test and one regression model.
- Assumption checks documented for every model.
- Results presented in tables and figures that meet publication standards.
- Discussion interpreting the findings in context, with limitations.
- Conclusion answering the question, with appropriate caution about causation.

Acceptance criteria:
- Every table and figure is numbered, titled and referenced in the text.
- No causal language is used for observational data.
- Limitations include at least one that materially weakens your conclusion, stated plainly.
- The analysis is reproducible: your data file, your steps and your outputs are all included.
- A reader with basic statistical training could check your work and reach the same numbers.

How to submit: share the report along with your data file and the spreadsheet or script containing the analysis.`,
          },
        ],
      },
    ],
    quizzes: [
      {
        title: "Checkpoint 1: Describing and Inferring",
        durationMin: 15,
        passingScore: 70,
        questions: [
          {
            type: "MCQ",
            question:
              "Income data in a country is heavily skewed by a few very high earners. Which measure of centre is most representative?",
            options: ["The median", "The mean", "The mode", "The range"],
            correctAnswer: "The median",
          },
          {
            type: "MCQ",
            question: "What does a p-value of 0.03 mean?",
            options: [
              "If the null hypothesis were true, data this extreme would occur about 3 percent of the time",
              "There is a 3 percent chance the null hypothesis is true",
              "There is a 97 percent chance the finding is real",
              "The effect is large enough to matter in practice",
            ],
            correctAnswer:
              "If the null hypothesis were true, data this extreme would occur about 3 percent of the time",
          },
          {
            type: "MCQ",
            question:
              "You are comparing the mean scores of three independent groups on a normally distributed measure. Which test is appropriate?",
            options: ["ANOVA", "Paired t-test", "Chi-squared test", "Pearson correlation"],
            correctAnswer: "ANOVA",
          },
          {
            type: "MCQ",
            question: "What is a Type I error?",
            options: [
              "Rejecting a null hypothesis that is actually true",
              "Failing to reject a null hypothesis that is false",
              "Using the wrong statistical test",
              "Collecting too small a sample",
            ],
            correctAnswer: "Rejecting a null hypothesis that is actually true",
          },
          {
            type: "TRUE_FALSE",
            question:
              "A correlation close to zero proves there is no relationship between two variables.",
            correctAnswer: "false",
          },
          {
            type: "TRUE_FALSE",
            question:
              "With a large enough sample, a trivially small difference can still be statistically significant.",
            correctAnswer: "true",
          },
        ],
      },
      {
        title: "Final Assessment: Regression and Reporting",
        durationMin: 20,
        passingScore: 70,
        questions: [
          {
            type: "MCQ",
            question:
              "In observational data, how should a regression finding be described?",
            options: [
              "X is associated with Y after adjusting for other variables",
              "X causes Y",
              "Y is determined by X",
              "Increasing X will increase Y",
            ],
            correctAnswer: "X is associated with Y after adjusting for other variables",
          },
          {
            type: "MCQ",
            question:
              "Ice cream sales correlate with drowning deaths. What is the most likely explanation?",
            options: [
              "A confounding variable, temperature, drives both",
              "Ice cream consumption impairs swimming ability",
              "The correlation is a calculation error",
              "Drownings increase demand for ice cream",
            ],
            correctAnswer: "A confounding variable, temperature, drives both",
          },
          {
            type: "MCQ",
            question: "Which practice makes a bar chart misleading?",
            options: [
              "Truncating the y-axis so it does not start at zero",
              "Including error bars",
              "Labelling the axes with units",
              "Stating the sample size in the caption",
            ],
            correctAnswer: "Truncating the y-axis so it does not start at zero",
          },
          {
            type: "MCQ",
            question: "Why should raw data be kept on a separate untouched sheet?",
            options: [
              "So cleaning steps can be checked and rerun if a mistake is found",
              "So the file opens faster",
              "Because spreadsheets corrupt edited data",
              "To reduce the file size",
            ],
            correctAnswer:
              "So cleaning steps can be checked and rerun if a mistake is found",
          },
          {
            type: "TRUE_FALSE",
            question:
              "Adding more predictors to a regression always increases R-squared, even if they are unrelated to the outcome.",
            correctAnswer: "true",
          },
          {
            type: "TRUE_FALSE",
            question:
              "Reporting a p-value alone is sufficient; effect size and confidence intervals are optional extras.",
            correctAnswer: "false",
          },
        ],
      },
    ],
  },
];
