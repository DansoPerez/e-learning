import { PDFS, yt, ytThumb, type SeedCourse } from "./types";

export const DATA_SCIENCE_COURSES: SeedCourse[] = [
  {
    title: "Data Analysis with Python: NumPy, Pandas and Visualisation",
    category: "Data Science",
    price: 349,
    featured: true,
    thumbnailUrl: ytThumb("r-uOLxNrNk8"),
    description:
      "A professional data-analysis programme. Learn NumPy, Pandas, cleaning, grouping and joins, and clear charting — with University of Toronto data-science readings, cheat sheets, quizzes and a full exploratory analysis of a public dataset.",
    modules: [
      {
        title: "Setting Up for Analysis",
        lessons: [
          {
            title: "The analyst's toolkit and workflow",
            durationMin: 30,
            videoUrl: yt("HW29067qVWk"),
            pdfUrl: PDFS.torontoDataScience,
            content: `Data analysis has a repeatable shape. Learn the shape and every project becomes less intimidating.

The workflow:
1. Question. What decision will this analysis inform? Write it down before touching data.
2. Collect. Load the data and record exactly where it came from and when.
3. Clean. Handle missing values, wrong types, duplicates and outliers.
4. Explore. Summarise, group, compare, visualise.
5. Communicate. One clear chart and three sentences beat forty pages nobody reads.

Set up your environment:

pip install numpy pandas matplotlib seaborn jupyter

Then start Jupyter with: jupyter notebook

Notebook discipline that separates professionals from beginners:
- Put imports in the first cell.
- Load the raw data once, then never overwrite the raw variable. Work on copies.
- Use markdown cells to state what each section is doing and what you found.
- Restart and run all before you share anything. If it does not run top to bottom, it is not reproducible.`,
          },
          {
            title: "Numerical computing with NumPy",
            durationMin: 60,
            videoUrl: yt("QUT1VHiLmmI"),
            pdfUrl: PDFS.numpyCheatSheet,
            content: `NumPy is the foundation. Pandas is built on it, and so is most of scientific Python.

The central object is the ndarray: a grid of values, all the same type, with a shape.

import numpy as np

prices = np.array([12.5, 18.0, 9.75, 22.4])
prices * 1.15          # applies to every element at once
prices[prices > 15]    # boolean masking
prices.mean(), prices.std(), prices.sum()

Why not just use lists? Two reasons:
- Vectorised operations. Multiplying a million-element array happens in optimised C, not a Python loop. It is often a hundred times faster.
- Broadcasting. Arrays of different shapes combine according to clear rules, so you rarely write nested loops.

Concepts to be comfortable with: shape and reshape, indexing and slicing, axis (0 is down the rows, 1 is across the columns), boolean masks, and the difference between a view and a copy.

The attached cheat sheet is a good desk reference while these become second nature.`,
          },
        ],
      },
      {
        title: "Working with Data in Pandas",
        lessons: [
          {
            title: "Loading and inspecting data frames",
            durationMin: 55,
            videoUrl: yt("ZyhVh-qRZPA"),
            pdfUrl: PDFS.pandasCheatSheet,
            content: `A DataFrame is a table with labelled rows and columns. It is the object you will spend most of your career manipulating.

The first five things to run on any new dataset:

df = pd.read_csv("data.csv")
df.shape        # how many rows and columns
df.head()       # what does it look like
df.info()       # column types and non-null counts
df.describe()   # numeric summary
df.isna().sum() # missing values per column

Selecting data:
- df["column"] gives one column as a Series.
- df[["a", "b"]] gives several columns as a DataFrame.
- df.loc[row_label, column_label] selects by label.
- df.iloc[row_position, column_position] selects by position.
- df[df["price"] > 100] filters rows with a boolean mask.

The mistake everyone makes early: chained assignment such as df[df.x > 1]["y"] = 0. It may modify a copy and silently do nothing. Use .loc for assignment: df.loc[df.x > 1, "y"] = 0.

The attached cheat sheet is the official Pandas one-pager. Keep it open while you work.`,
          },
          {
            title: "Cleaning messy real-world data",
            durationMin: 50,
            content: `Real data is never tidy. Cleaning usually takes longer than analysis, and doing it carelessly invalidates everything downstream.

Missing values. First understand why they are missing, then decide:
- df.dropna(subset=["price"]) removes rows missing a critical field.
- df["rating"].fillna(df["rating"].median()) imputes a sensible substitute.
- Sometimes missing is meaningful — an empty discount column may mean "no discount", so fill with 0.

Wrong types. Numbers read as text break every calculation:
- pd.to_numeric(df["amount"], errors="coerce") converts and marks failures as missing.
- pd.to_datetime(df["signup_date"]) unlocks date arithmetic and grouping by month.

Duplicates:
- df.duplicated().sum() counts them; df.drop_duplicates(subset=["order_id"]) removes them.

Inconsistent categories. "Ghana", "ghana" and " Ghana " are three values to a computer:
- df["country"] = df["country"].str.strip().str.title()

Outliers. Do not delete reflexively. Investigate first — an unusual value is sometimes the most interesting row in the dataset, and sometimes a typo of one extra zero.

Golden rule: record every cleaning decision in a markdown cell. Three months later you will not remember why 47 rows disappeared.`,
          },
          {
            title: "Grouping, aggregating and joining",
            durationMin: 60,
            videoUrl: yt("vmEHCJofslg"),
            content: `This is where analysis actually happens: splitting data into groups, computing something per group, and combining the results.

The core operation:

df.groupby("region")["revenue"].sum()
df.groupby(["region", "month"]).agg(
    total=("revenue", "sum"),
    orders=("order_id", "count"),
    average=("revenue", "mean"),
)

Reshaping:
- pivot_table gives you a spreadsheet-style cross-tabulation.
- melt turns wide data into long data, which most plotting libraries prefer.

Combining datasets:
- pd.merge(orders, customers, on="customer_id", how="left") is a SQL-style join.
- pd.concat([jan, feb, mar]) stacks frames with the same columns.

Always check row counts before and after a merge. If the count grows unexpectedly, your join key is not unique and you have silently duplicated data — one of the most common and most damaging analysis bugs.

Practice task: load any sales dataset and answer three questions with groupby: which region earns most, which month is strongest, and which ten customers account for the largest share of revenue.`,
          },
        ],
      },
      {
        title: "Communicating with Charts",
        lessons: [
          {
            title: "Plotting with Matplotlib",
            durationMin: 45,
            videoUrl: yt("UO98lJQ3QGI"),
            pdfUrl: PDFS.matplotlibCheatSheets,
            content: `Matplotlib is verbose but total in its control, and everything else is built on top of it.

The pattern worth memorising:

import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(8, 5))
ax.plot(months, revenue, marker="o")
ax.set_title("Monthly revenue, 2025")
ax.set_xlabel("Month")
ax.set_ylabel("Revenue (GHS)")
ax.grid(True, alpha=0.3)
fig.tight_layout()

Choosing the right chart:
- Line for change over time.
- Bar for comparing categories.
- Histogram for the distribution of one numeric variable.
- Scatter for the relationship between two numeric variables.
- Box plot for comparing distributions across groups.

Never use a pie chart with more than three slices, and never a 3D chart at all. Both make comparison harder, which is the only reason charts exist.

Every chart needs a title, axis labels and units. A chart without units is a decoration.`,
          },
          {
            title: "The complete data analysis walkthrough",
            durationMin: 240,
            videoUrl: yt("r-uOLxNrNk8"),
            content: `A long, complete course covering NumPy, Pandas, Matplotlib and Seaborn together on realistic data.

Watch this after the previous lessons, in sittings of about an hour. Its value is showing the whole workflow joined up rather than each library in isolation.

Pay particular attention to:
- How the presenter decides what to look at next — the reasoning between steps matters more than the syntax.
- Seaborn, which produces statistical charts in one line: sns.boxplot, sns.heatmap for correlations, sns.pairplot for a fast overview of relationships.
- Making figures presentable: colour choices, annotation and consistent styling.

As you watch, apply each technique to a different dataset of your own choosing. Following along on the same data teaches you the video; applying it elsewhere teaches you the skill.`,
          },
        ],
      },
      {
        title: "Projects and Capstone",
        lessons: [
          {
            title: "Project 1: Clean and profile a messy dataset",
            durationMin: 180,
            content: `Find a genuinely messy public dataset — government open data portals are ideal — and produce a cleaned version with a documented audit trail.

Requirements:
- Load the raw data without modifying the original file.
- Produce a data quality report: row and column counts, types, missing values per column, duplicates, and suspicious values.
- Apply cleaning steps, each one explained in a markdown cell stating the problem, the decision and the justification.
- Export a cleaned CSV.
- Summarise, in five bullet points, what a user of this data must know about its limitations.

Acceptance criteria:
- The notebook runs top to bottom after Restart and Run All.
- No cleaning step is applied without a written reason.
- The row count at every stage is reported, so a reader can see exactly what was dropped.`,
          },
          {
            title: "Project 2: Exploratory analysis with a question",
            durationMin: 240,
            content: `Take your cleaned dataset and answer a specific question a real person would care about.

Requirements:
- State one clear question at the top of the notebook, and the decision it would inform.
- Use at least three grouping or aggregation operations.
- Include at least four charts, each with a title, labelled axes and a one-sentence interpretation directly beneath it.
- Include at least one comparison across groups and one trend over time.
- End with a findings section of no more than 200 words, written for someone who will not read the code.

Acceptance criteria:
- Every chart answers part of the stated question. Charts that are merely interesting are removed.
- Claims are supported by the numbers shown, and uncertainty is acknowledged where the sample is small.
- A non-technical reader could read only the findings section and act on it.`,
          },
          {
            title: "Capstone: End-to-end analysis report",
            durationMin: 420,
            content: `Deliver a complete piece of analysis of the standard you would attach to a job application.

Choose a subject with real stakes: public health figures, education outcomes, transport reliability, prices in your local market, football statistics, or company data if you have permission to use it.

Requirements:
- Data acquired from a documented source, with the collection date recorded.
- A reproducible cleaning pipeline, ideally in a separate module imported by the notebook.
- Exploratory analysis leading to at least three substantive findings.
- At least one finding that surprised you and that you then investigated further.
- Publication-quality charts with a consistent visual style.
- A written report with an executive summary, method, findings, limitations and recommendations.
- The whole project in a GitHub repository with a README and a requirements file.

Acceptance criteria:
- Restart and Run All completes without error on a clean environment.
- The limitations section is honest and specific — every dataset has them.
- Recommendations follow from the evidence rather than from opinion.
- A reader can reproduce your headline number from your code.

How to submit: share the repository link and a two-paragraph summary of your most important finding.`,
          },
        ],
      },
    ],
    quizzes: [
      {
        title: "Checkpoint 1: NumPy and Pandas",
        durationMin: 15,
        passingScore: 70,
        questions: [
          {
            type: "MCQ",
            question: "Which method gives column data types and non-null counts for a DataFrame?",
            options: ["df.info()", "df.describe()", "df.head()", "df.shape"],
            correctAnswer: "df.info()",
          },
          {
            type: "MCQ",
            question: "What is the main performance advantage of NumPy arrays over Python lists?",
            options: [
              "Operations are vectorised and run in optimised compiled code",
              "Arrays can hold mixed data types efficiently",
              "Arrays are automatically saved to disk",
              "Arrays resize faster when appending items",
            ],
            correctAnswer: "Operations are vectorised and run in optimised compiled code",
          },
          {
            type: "MCQ",
            question: "Which is the safe way to assign a value to a subset of rows?",
            options: [
              'df.loc[df["x"] > 1, "y"] = 0',
              'df[df["x"] > 1]["y"] = 0',
              'df["y"][df["x"] > 1] = 0',
              'df.filter(df["x"] > 1).y = 0',
            ],
            correctAnswer: 'df.loc[df["x"] > 1, "y"] = 0',
          },
          {
            type: "MCQ",
            question:
              "After a merge, the row count is much larger than expected. What is the most likely cause?",
            options: [
              "The join key is not unique in one of the tables",
              "The merge used how='left' instead of how='inner'",
              "One table had missing values",
              "The columns were in a different order",
            ],
            correctAnswer: "The join key is not unique in one of the tables",
          },
          {
            type: "TRUE_FALSE",
            question:
              "In Pandas, axis=0 refers to operating down the rows and axis=1 across the columns.",
            correctAnswer: "true",
          },
          {
            type: "TRUE_FALSE",
            question:
              "Outliers should always be deleted before analysis because they distort the mean.",
            correctAnswer: "false",
          },
        ],
      },
      {
        title: "Final Assessment: Analysis and Communication",
        durationMin: 20,
        passingScore: 70,
        questions: [
          {
            type: "MCQ",
            question: "Which chart type best shows the distribution of a single numeric variable?",
            options: ["Histogram", "Line chart", "Pie chart", "Scatter plot"],
            correctAnswer: "Histogram",
          },
          {
            type: "MCQ",
            question: "Which chart type is most appropriate for showing change over time?",
            options: ["Line chart", "Bar chart", "Box plot", "Heatmap"],
            correctAnswer: "Line chart",
          },
          {
            type: "MCQ",
            question:
              "A column of prices was imported as text. Which call converts it while marking unconvertible entries as missing?",
            options: [
              'pd.to_numeric(df["price"], errors="coerce")',
              'df["price"].astype(float)',
              'df["price"].fillna(0)',
              'pd.to_datetime(df["price"])',
            ],
            correctAnswer: 'pd.to_numeric(df["price"], errors="coerce")',
          },
          {
            type: "MCQ",
            question: "What makes a notebook analysis reproducible?",
            options: [
              "It runs correctly from top to bottom after restarting the kernel",
              "It contains many charts",
              "It uses the fastest possible Pandas operations",
              "It was written in a single session",
            ],
            correctAnswer:
              "It runs correctly from top to bottom after restarting the kernel",
          },
          {
            type: "TRUE_FALSE",
            question:
              "Every cleaning decision should be documented so a reader can see why rows were removed or changed.",
            correctAnswer: "true",
          },
          {
            type: "TRUE_FALSE",
            question:
              "A chart without axis labels or units is acceptable in a final report as long as the title is descriptive.",
            correctAnswer: "false",
          },
        ],
      },
    ],
  },

  {
    title: "SQL for Data Analytics",
    category: "Data Science",
    price: 279,
    thumbnailUrl: ytThumb("HXV3zeQKqGY"),
    description:
      "A professional SQL analytics programme. Master querying, joins, aggregation, window functions and performance — with Carnegie Mellon database lecture notes, graded quizzes and a reporting layer built on a real relational schema.",
    modules: [
      {
        title: "Querying Fundamentals",
        lessons: [
          {
            title: "Relational databases and your first queries",
            durationMin: 200,
            videoUrl: yt("HXV3zeQKqGY"),
            pdfUrl: PDFS.cmuDatabaseIntro,
            content: `A relational database stores data in tables with defined columns and relationships between them. SQL is how you ask it questions.

The clause order you write:

SELECT column_list
FROM table
WHERE row_condition
GROUP BY grouping_columns
HAVING group_condition
ORDER BY sort_columns
LIMIT n

The execution order the database actually uses is different, and knowing it prevents most confusion: FROM, then WHERE, then GROUP BY, then HAVING, then SELECT, then ORDER BY, then LIMIT.

That order explains two things beginners find baffling:
- You cannot use a column alias defined in SELECT inside WHERE, because WHERE runs first.
- WHERE filters individual rows; HAVING filters groups after aggregation. Using WHERE with an aggregate function is an error.

Work through this full course with a real database. Install PostgreSQL or use a free browser-based sandbox, and type every query rather than reading it.

The attached cheat sheet covers the syntax you will look up most often.`,
          },
          {
            title: "Filtering, sorting and useful functions",
            durationMin: 40,
            videoUrl: yt("7S_tz1z_5bA"),
            pdfUrl: PDFS.sqlCheatSheet,
            content: `Precision in the WHERE clause is most of the craft.

Operators worth knowing:
- Comparison: =, <>, <, >, <=, >=
- BETWEEN 10 AND 20, inclusive at both ends
- IN ('Ghana', 'Nigeria', 'Kenya')
- LIKE 'Jo%' for prefix matching, ILIKE in Postgres for case-insensitive matching
- IS NULL and IS NOT NULL

The null trap. NULL means unknown, not zero and not empty. Any comparison with NULL yields NULL, which is not true. So price <> 100 will not return rows where price is NULL. If you want them, you must say so explicitly:

WHERE price <> 100 OR price IS NULL

Use COALESCE(discount, 0) to substitute a default for nulls in calculations.

Other functions in constant use: CONCAT, UPPER, LOWER, TRIM, LENGTH, ROUND, DATE_TRUNC, EXTRACT, and CASE WHEN for conditional logic inside a query.

Practice task: from any orders table, list the ten highest-value orders placed in the last quarter, showing the customer name in title case and the total rounded to two decimal places.`,
          },
        ],
      },
      {
        title: "Combining and Summarising Data",
        lessons: [
          {
            title: "Joins: connecting tables correctly",
            durationMin: 20,
            videoUrl: yt("Yh4CrPHVBdE"),
            content: `Joins are where most incorrect analyses are born, so learn them properly rather than by trial and error.

The types:
- INNER JOIN returns only rows with a match in both tables.
- LEFT JOIN returns every row from the left table, with nulls where there is no match. This is what you want when asking "all customers, including those who never ordered".
- RIGHT JOIN is the mirror image and is rarely used; rewrite it as a LEFT JOIN for readability.
- FULL OUTER JOIN returns everything from both sides.
- CROSS JOIN pairs every row with every row, which is occasionally useful and usually an accident.

The bug that catches everyone: putting a condition on the right table in the WHERE clause of a LEFT JOIN turns it into an INNER JOIN, because NULL fails the condition. Put the condition in the ON clause instead if you want to keep unmatched rows.

Sanity check every join:
- Count rows before and after. Growth means a one-to-many relationship you did not expect.
- Count nulls in the joined columns to see how many rows failed to match.

Practice task: list every customer with their total number of orders, including customers with zero orders.`,
          },
          {
            title: "A second view of joins",
            durationMin: 15,
            videoUrl: yt("9yeOJ0ZMUYw"),
            content: `A short, precise explanation of the same material with different visuals.

Joins are worth over-learning because they are the single most common topic in data analyst interviews, and a misunderstood join produces answers that look plausible and are wrong.

After watching, test yourself on these without running them:
- Two tables, A has 10 rows, B has 5 rows, and every row in B matches exactly one row in A. How many rows does A INNER JOIN B return? How many does A LEFT JOIN B return?
- If one row in A matches three rows in B, how many rows does the inner join return in total?

Answers: 5 and 10 for the first; the join returns three rows for that single A row, so the total grows accordingly. If you got these instantly, you understand joins.`,
          },
          {
            title: "Aggregation, grouping and window functions",
            durationMin: 90,
            videoUrl: yt("qw--VYLpxG4"),
            content: `Aggregation collapses rows; window functions calculate across rows while keeping them.

Aggregation:

SELECT region, COUNT(*) AS orders, SUM(total) AS revenue, AVG(total) AS average
FROM orders
GROUP BY region
HAVING SUM(total) > 10000
ORDER BY revenue DESC;

Note that COUNT(*) counts rows while COUNT(column) skips nulls — a difference that quietly changes results.

Window functions are the step that separates intermediate from beginner:

SELECT
  name,
  region,
  total,
  RANK() OVER (PARTITION BY region ORDER BY total DESC) AS rank_in_region,
  SUM(total) OVER (PARTITION BY region) AS region_total,
  total - LAG(total) OVER (ORDER BY order_date) AS change_from_previous
FROM orders;

The mental model: PARTITION BY defines the group, ORDER BY defines the sequence within it, and the function computes without collapsing rows.

Common uses: ranking within categories, running totals, month-on-month change, and deduplicating with ROW_NUMBER.

Practice task: for each region, return the top three customers by revenue using a window function.`,
          },
        ],
      },
      {
        title: "Writing Queries That Scale",
        lessons: [
          {
            title: "Subqueries, CTEs and readable SQL",
            durationMin: 45,
            content: `Long queries become unreadable fast. Common table expressions fix that.

Instead of nested subqueries:

WITH monthly AS (
  SELECT DATE_TRUNC('month', order_date) AS month,
         SUM(total) AS revenue
  FROM orders
  GROUP BY 1
),
with_growth AS (
  SELECT month,
         revenue,
         LAG(revenue) OVER (ORDER BY month) AS previous
  FROM monthly
)
SELECT month,
       revenue,
       ROUND(100.0 * (revenue - previous) / previous, 1) AS growth_percent
FROM with_growth
WHERE previous IS NOT NULL;

Each CTE is a named step. You can read the query top to bottom like a paragraph, and you can test each step independently by selecting from it alone.

Style rules that make SQL maintainable:
- One clause per line, keywords in capitals.
- Alias tables with meaningful short names, not a, b, c.
- Never use SELECT * in production queries or saved reports.
- Comment the why, not the what.`,
          },
          {
            title: "Indexes, execution plans and performance",
            durationMin: 40,
            videoUrl: yt("HXV3zeQKqGY"),
            content: `A query that takes four minutes on a million rows will take forty on ten million. Understanding why is a career-defining skill.

Indexes. An index is a sorted structure that lets the database find rows without scanning the whole table. Index the columns you filter and join on. Every index speeds up reads and slows down writes, so do not index everything.

Read the plan. Prefix any query with EXPLAIN ANALYZE and the database tells you what it did:
- Sequential Scan means it read every row. Fine on small tables, alarming on large ones.
- Index Scan means it used an index. Usually what you want.
- Nested Loop, Hash Join and Merge Join describe the join strategy.
- Look at actual rows against estimated rows. A big discrepancy means the planner has stale statistics.

Habits that keep queries fast:
- Filter as early as possible, and on indexed columns.
- Avoid applying functions to indexed columns in WHERE — WHERE DATE(created_at) = '2025-01-01' cannot use an index on created_at, but a range comparison can.
- Select only the columns you need.
- Aggregate in the database rather than pulling a million rows into Python.

Practice task: run EXPLAIN ANALYZE on the slowest query you have written so far, add an index on the filtered column, and compare the timings.`,
          },
        ],
      },
      {
        title: "Projects and Capstone",
        lessons: [
          {
            title: "Project 1: Query drill set",
            durationMin: 150,
            content: `Load a public relational dataset — a classic sample database or an open data export — and answer twenty questions with SQL.

Include at least:
- Three queries using joins across three or more tables.
- Three using GROUP BY with HAVING.
- Three using window functions.
- Two using CTEs with multiple steps.
- Two involving dates: month-on-month change and a rolling total.
- One that deliberately demonstrates the difference between an inner join and a left join on the same data.

Acceptance criteria:
- Every query is saved in a .sql file with a comment stating the question it answers.
- Results are correct, and you can explain how you verified them.
- No query uses SELECT *.`,
          },
          {
            title: "Project 2: Analytical reporting layer",
            durationMin: 240,
            content: `Design and build the reporting views a small business would actually use.

Requirements:
- A normalised schema of at least four related tables, with primary and foreign keys defined.
- Seed data of at least a few thousand rows, generated or imported.
- At least five views or saved queries covering: daily revenue, customer lifetime value, product performance, cohort retention, and a data quality check.
- Indexes chosen deliberately, with a comment justifying each one.
- An EXPLAIN ANALYZE before and after for your slowest query, showing the improvement.

Acceptance criteria:
- Foreign key constraints are enforced, not merely implied.
- Every view returns correct results when run against an empty table, rather than erroring.
- The repository includes the schema, the seed script and the queries, and a README explaining how to recreate the database from scratch.`,
          },
          {
            title: "Capstone: From question to dashboard",
            durationMin: 360,
            content: `Combine SQL with everything else you know to deliver an answer to a real question.

Requirements:
- Choose a subject and a stakeholder. Write the question and the decision it informs.
- Model the data in a relational database.
- Write the analytical queries that answer the question.
- Present the results, either in a notebook that queries the database directly, or in a free dashboard tool.
- Document the assumptions and known data quality issues.

Acceptance criteria:
- The queries are the analysis; charts read from query results rather than from hand-copied numbers.
- Anyone can rebuild the database and reproduce every figure from your repository.
- The final summary is one page and contains a recommendation, not just observations.

How to submit: share the repository and a screenshot or link to the final report or dashboard.`,
          },
        ],
      },
    ],
    quizzes: [
      {
        title: "Checkpoint 1: Querying and Joins",
        durationMin: 15,
        passingScore: 70,
        questions: [
          {
            type: "MCQ",
            question: "Which join returns every row from the left table even when there is no match?",
            options: ["LEFT JOIN", "INNER JOIN", "CROSS JOIN", "SELF JOIN"],
            correctAnswer: "LEFT JOIN",
          },
          {
            type: "MCQ",
            question: "What is the difference between WHERE and HAVING?",
            options: [
              "WHERE filters rows before grouping, HAVING filters groups after aggregation",
              "They are interchangeable synonyms",
              "HAVING filters rows and WHERE filters columns",
              "WHERE works only with joins, HAVING only with subqueries",
            ],
            correctAnswer:
              "WHERE filters rows before grouping, HAVING filters groups after aggregation",
          },
          {
            type: "MCQ",
            question: "Why does the condition price <> 100 exclude rows where price is NULL?",
            options: [
              "Any comparison with NULL evaluates to NULL, which is not true",
              "NULL is automatically treated as zero",
              "The database converts NULL to an empty string first",
              "NULL rows are always excluded from every query",
            ],
            correctAnswer: "Any comparison with NULL evaluates to NULL, which is not true",
          },
          {
            type: "MCQ",
            question: "Which clause is evaluated first when the database executes a query?",
            options: ["FROM", "SELECT", "ORDER BY", "GROUP BY"],
            correctAnswer: "FROM",
          },
          {
            type: "TRUE_FALSE",
            question:
              "Putting a condition on the right-hand table in the WHERE clause of a LEFT JOIN effectively turns it into an inner join.",
            correctAnswer: "true",
          },
          {
            type: "TRUE_FALSE",
            question: "COUNT(*) and COUNT(column) always return the same number.",
            correctAnswer: "false",
          },
        ],
      },
      {
        title: "Final Assessment: Advanced SQL",
        durationMin: 20,
        passingScore: 70,
        questions: [
          {
            type: "MCQ",
            question:
              "Which construct calculates a value across a set of rows without collapsing them into one row?",
            options: ["A window function", "GROUP BY", "DISTINCT", "A subquery in WHERE"],
            correctAnswer: "A window function",
          },
          {
            type: "MCQ",
            question: "What does PARTITION BY do inside an OVER clause?",
            options: [
              "Defines the group of rows the window function is calculated within",
              "Sorts the final result set",
              "Splits the table into physical storage partitions",
              "Removes duplicate rows before the calculation",
            ],
            correctAnswer:
              "Defines the group of rows the window function is calculated within",
          },
          {
            type: "MCQ",
            question:
              "Why can WHERE DATE(created_at) = '2025-01-01' fail to use an index on created_at?",
            options: [
              "Applying a function to the column prevents the index from being used",
              "Date comparisons are never indexed",
              "The index only works with the BETWEEN operator",
              "String literals cannot be compared to date columns",
            ],
            correctAnswer:
              "Applying a function to the column prevents the index from being used",
          },
          {
            type: "MCQ",
            question:
              "In an execution plan, seeing a Sequential Scan on a very large table usually suggests what?",
            options: [
              "A useful index is missing or is not being used",
              "The query is optimally written",
              "The table needs to be dropped and recreated",
              "The database is out of memory",
            ],
            correctAnswer: "A useful index is missing or is not being used",
          },
          {
            type: "TRUE_FALSE",
            question:
              "Common table expressions let you name intermediate steps so a long query can be read from top to bottom.",
            correctAnswer: "true",
          },
          {
            type: "TRUE_FALSE",
            question:
              "Adding an index to every column is a reliable way to improve overall database performance.",
            correctAnswer: "false",
          },
        ],
      },
    ],
  },

  {
    title: "Machine Learning Foundations with Python",
    category: "Data Science",
    price: 449,
    featured: true,
    thumbnailUrl: ytThumb("i_LwzRVP7bg"),
    description:
      "A professional machine-learning programme. Build models that generalise: supervised learning, train/test discipline, regression and classification, honest metrics, regularisation and a first look at neural nets — with Stanford CS229 lecture notes and scikit-learn projects.",
    modules: [
      {
        title: "What Machine Learning Is and Is Not",
        lessons: [
          {
            title: "Machine learning for everybody",
            durationMin: 220,
            videoUrl: yt("i_LwzRVP7bg"),
            pdfUrl: PDFS.stanfordMlNotes,
            content: `A complete, practical introduction with code. This is the backbone of the module.

The core idea: instead of writing rules by hand, you show an algorithm examples and it infers the rules. That is powerful, and it is also why machine learning fails in ways ordinary software does not — the rules are learned from data, so bad data produces confidently wrong models.

Vocabulary you need:
- Features are the inputs, the target is what you predict.
- Supervised learning has labelled examples; unsupervised learning finds structure without labels.
- Regression predicts a number, classification predicts a category.
- Training data teaches the model, test data measures it. They must never overlap.
- A model that memorises training data but fails on new data is overfitting.

The most important discipline in the whole field: split your data before you look at it, and do not touch the test set until the very end. Every time you peek and adjust, you leak information and your reported accuracy becomes a lie.

Work through the notebooks alongside the video.`,
          },
          {
            title: "The statistics you cannot skip",
            durationMin: 20,
            videoUrl: yt("0oc49DyA3hU"),
            pdfUrl: PDFS.thinkStats,
            content: `Machine learning is applied statistics with more compute. A little statistical literacy prevents a great deal of nonsense.

Concepts that matter immediately:
- Distributions, mean, median and standard deviation, and why the median is the honest summary for skewed data such as income.
- Correlation is not causation, and correlation only measures linear relationships.
- Sampling bias. A model trained on data from one city, season or demographic will fail elsewhere, no matter how high its accuracy looked.
- The null hypothesis and p-values, explained clearly in this video. A p-value is the probability of seeing data this extreme if the null hypothesis were true. It is not the probability that your hypothesis is correct.
- Base rates. If 1 percent of transactions are fraudulent, a model that predicts "never fraud" is 99 percent accurate and completely useless.

The attached book, Think Stats, is a free and practical statistics text written in Python. Chapters 1 to 4 are the ones that pay off fastest.`,
          },
        ],
      },
      {
        title: "Building Models with scikit-learn",
        lessons: [
          {
            title: "The scikit-learn workflow",
            durationMin: 130,
            videoUrl: yt("pqNCD_5r0IU"),
            content: `Every scikit-learn model follows the same four-step interface, which is why the library is so pleasant once it clicks.

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

model = RandomForestClassifier(random_state=42)
model.fit(X_train, y_train)
predictions = model.predict(X_test)
print(classification_report(y_test, predictions))

Swap the model class and everything else stays the same. That means you can try logistic regression, decision trees, gradient boosting and support vector machines in minutes.

Two features worth adopting early:
- Pipelines chain preprocessing and the model into one object, so the same transformations apply to training and prediction. This eliminates a whole category of bugs.
- Cross-validation splits the training data into folds and evaluates several times, giving a far more stable estimate than one split.

Always set random_state so results are reproducible, and use stratify for classification so class proportions are preserved in both splits.`,
          },
          {
            title: "Evaluating models honestly",
            durationMin: 45,
            content: `Choosing the wrong metric is the most common way to ship a useless model that looks excellent on paper.

For classification:
- Accuracy is the proportion correct. It is misleading whenever classes are imbalanced.
- Precision answers: of the cases I flagged, how many were real? Optimise it when false alarms are expensive.
- Recall answers: of the real cases, how many did I catch? Optimise it when misses are dangerous, such as disease screening.
- The F1 score balances the two.
- The confusion matrix shows all four outcomes and should be the first thing you look at.
- ROC AUC summarises performance across all thresholds.

For regression:
- Mean absolute error is in the same units as the target and is easy to explain.
- Root mean squared error punishes large errors more heavily.
- R-squared is the proportion of variance explained, and can be negative for a bad model.

Always compare against a baseline. For classification, predicting the most common class; for regression, predicting the mean. If your model cannot beat that, it has learned nothing.

Practice task: build a classifier on an imbalanced dataset, report accuracy, then report the confusion matrix and recall. Note how differently the two describe the same model.`,
          },
          {
            title: "Overfitting, features and improving results",
            durationMin: 45,
            content: `When a model performs far better on training data than on test data, it has memorised rather than learned.

Signs and remedies:
- A large train and test gap. Reduce model complexity, gather more data, or add regularisation.
- Regularisation penalises large coefficients: Ridge (L2) shrinks them, Lasso (L1) can drive them to zero and so performs feature selection.
- For trees, limit max_depth, min_samples_leaf and the number of estimators.
- Cross-validation gives you a trustworthy estimate before you touch the test set.

Feature engineering usually beats model choice:
- Encode categories with one-hot encoding for unordered categories, ordinal encoding only when the order is genuine.
- Scale numeric features for distance-based and regularised models; tree models do not need it.
- Create informative combinations: price per square metre, days since signup, ratio of two columns.
- Handle missing values inside the pipeline, so the same rule applies at prediction time.

Beware data leakage, the subtlest failure in machine learning. If information from the future or from the target sneaks into your features, your model looks superb and fails in production. Common causes: scaling before splitting, including a column derived from the target, and using data that would not exist at prediction time.`,
          },
          {
            title: "A first look at neural networks",
            durationMin: 180,
            videoUrl: yt("tPYj3fFJGjk"),
            content: `Neural networks are the right tool for images, audio, text and other unstructured data. For ordinary tabular data, gradient boosted trees usually still win, and are far cheaper to train.

Concepts to take from this course:
- A neuron computes a weighted sum and applies a non-linear activation.
- Layers stack, and depth allows the network to compose simple patterns into complex ones.
- Training means minimising a loss function using gradient descent and backpropagation.
- An epoch is one pass through the training data; the batch size is how many examples are processed at a time; the learning rate controls how big each adjustment is.
- Convolutional networks exploit spatial structure and dominate image tasks.
- Transfer learning — starting from a pre-trained network — gives strong results from small datasets and is what you should almost always try first.

Treat this lesson as orientation rather than mastery. Understand the vocabulary and run the examples; specialising comes later.`,
          },
        ],
      },
      {
        title: "Projects and Capstone",
        lessons: [
          {
            title: "Project 1: Regression with honest evaluation",
            durationMin: 240,
            content: `Predict a continuous value and report results you would be willing to defend.

Suggested subjects: house prices, energy consumption, delivery time, crop yield, or student results.

Requirements:
- Split the data before any exploration of the test set.
- Establish a baseline (predicting the mean) and report its error.
- Train at least three different model types and compare them with cross-validation.
- Report mean absolute error, root mean squared error and R-squared, and explain what the error means in real units.
- Plot predicted against actual values, and inspect the largest errors to understand where the model fails.
- Use a scikit-learn pipeline so preprocessing is applied consistently.

Acceptance criteria:
- The test set is evaluated exactly once, at the end.
- The chosen model beats the baseline by a margin you can justify.
- The notebook states, in plain language, what the model should and should not be used for.`,
          },
          {
            title: "Project 2: Classification on imbalanced data",
            durationMin: 240,
            content: `Build a classifier where the interesting class is rare — fraud, churn, equipment failure or disease screening.

Requirements:
- Report the class balance up front.
- Use stratified splitting and stratified cross-validation.
- Compare at least three models and tune the decision threshold, not just the model.
- Present a confusion matrix and explain the real-world cost of a false positive and a false negative in your chosen scenario.
- Justify which metric you optimised and why.
- Examine feature importance and sanity-check that the top features make sense.

Acceptance criteria:
- Accuracy alone is never presented as evidence of success.
- The threshold choice is explicitly linked to the costs of each error type.
- You have checked for data leakage and stated how.`,
          },
          {
            title: "Capstone: A model with a purpose",
            durationMin: 480,
            content: `Deliver a machine learning project that solves a stated problem for a stated user.

Requirements:
- A written problem statement: who uses this prediction, when, and what they do differently because of it.
- Data sourced and documented, with an honest assessment of its representativeness.
- A reproducible pipeline from raw data to trained model.
- Rigorous evaluation, including performance on meaningful subgroups to check for unfair behaviour.
- A discussion of limitations and failure modes.
- The model saved and exposed somehow — a script, a small API or a simple interface — so it can be used rather than only described.

Acceptance criteria:
- No data leakage, and you can explain the checks you performed.
- Results are reproducible from a fixed random seed and a documented environment.
- The write-up includes at least one thing that did not work and what you learned from it.
- A non-specialist can read the summary and understand what the model does and how much to trust it.

How to submit: share the repository, the model artefact, and a one-page summary written for a decision-maker rather than an engineer.`,
          },
        ],
      },
    ],
    quizzes: [
      {
        title: "Checkpoint 1: Core Concepts",
        durationMin: 15,
        passingScore: 70,
        questions: [
          {
            type: "MCQ",
            question: "What does it mean for a model to overfit?",
            options: [
              "It performs well on training data but poorly on unseen data",
              "It performs poorly on both training and test data",
              "It uses too few features",
              "It takes too long to train",
            ],
            correctAnswer: "It performs well on training data but poorly on unseen data",
          },
          {
            type: "MCQ",
            question:
              "In a dataset where 1 percent of cases are positive, a model that always predicts negative achieves what?",
            options: [
              "99 percent accuracy and zero recall",
              "99 percent recall and zero accuracy",
              "50 percent accuracy",
              "Perfect precision and perfect recall",
            ],
            correctAnswer: "99 percent accuracy and zero recall",
          },
          {
            type: "MCQ",
            question: "Which task type predicts a continuous numeric value?",
            options: ["Regression", "Classification", "Clustering", "Dimensionality reduction"],
            correctAnswer: "Regression",
          },
          {
            type: "MCQ",
            question:
              "Which metric should you prioritise when failing to detect a positive case is dangerous?",
            options: ["Recall", "Precision", "Accuracy", "R-squared"],
            correctAnswer: "Recall",
          },
          {
            type: "TRUE_FALSE",
            question:
              "The test set should be evaluated repeatedly during development to guide model tuning.",
            correctAnswer: "false",
          },
          {
            type: "TRUE_FALSE",
            question:
              "Scaling features using statistics computed from the whole dataset before splitting causes data leakage.",
            correctAnswer: "true",
          },
        ],
      },
      {
        title: "Final Assessment: Modelling Practice",
        durationMin: 20,
        passingScore: 70,
        questions: [
          {
            type: "MCQ",
            question: "What is the main benefit of a scikit-learn pipeline?",
            options: [
              "Preprocessing and modelling are bundled so identical transformations apply at prediction time",
              "It trains models faster by using multiple cores",
              "It automatically selects the best algorithm",
              "It removes the need for a test set",
            ],
            correctAnswer:
              "Preprocessing and modelling are bundled so identical transformations apply at prediction time",
          },
          {
            type: "MCQ",
            question: "What does cross-validation give you that a single train/test split does not?",
            options: [
              "A more stable performance estimate by evaluating across several folds",
              "A guarantee that the model will not overfit",
              "Faster training times",
              "Automatic feature engineering",
            ],
            correctAnswer:
              "A more stable performance estimate by evaluating across several folds",
          },
          {
            type: "MCQ",
            question:
              "Which regularisation method can shrink coefficients to exactly zero, effectively selecting features?",
            options: ["Lasso (L1)", "Ridge (L2)", "Dropout", "Early stopping"],
            correctAnswer: "Lasso (L1)",
          },
          {
            type: "MCQ",
            question:
              "For a small image dataset, which approach usually gives the strongest result soonest?",
            options: [
              "Transfer learning from a pre-trained network",
              "Training a deep network from random initialisation",
              "Linear regression on raw pixel values",
              "Increasing the learning rate until training is fast",
            ],
            correctAnswer: "Transfer learning from a pre-trained network",
          },
          {
            type: "TRUE_FALSE",
            question:
              "Every model should be compared against a simple baseline such as predicting the most common class.",
            correctAnswer: "true",
          },
          {
            type: "TRUE_FALSE",
            question:
              "A high correlation between a feature and the target proves the feature causes the outcome.",
            correctAnswer: "false",
          },
        ],
      },
    ],
  },
];
