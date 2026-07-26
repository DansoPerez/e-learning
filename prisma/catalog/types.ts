import type { COURSE_CATEGORIES } from "../../lib/constants";

export type CourseCategory = (typeof COURSE_CATEGORIES)[number];

export type SeedLesson = {
  title: string;
  /**
   * Rendered with `whitespace-pre-wrap` and no markdown parser, so write plain
   * prose. Blank lines and "- " bullets are the only formatting that survives.
   */
  content: string;
  videoUrl?: string;
  /** Stored in `Lesson.pdfStorageKey`; the lesson PDF proxy streams remote URLs. */
  pdfUrl?: string;
  durationMin: number;
};

export type SeedModule = {
  title: string;
  lessons: SeedLesson[];
};

export type SeedQuestion =
  | {
      type: "MCQ";
      question: string;
      /** `correctAnswer` must match one option exactly — grading is case-sensitive. */
      options: string[];
      correctAnswer: string;
    }
  | {
      type: "TRUE_FALSE";
      question: string;
      correctAnswer: "true" | "false";
    };

export type SeedQuiz = {
  title: string;
  durationMin: number;
  passingScore: number;
  questions: SeedQuestion[];
};

export type SeedCourse = {
  title: string;
  category: CourseCategory;
  description: string;
  featured?: boolean;
  thumbnailUrl?: string;
  modules: SeedModule[];
  quizzes: SeedQuiz[];
};

/** Watch URL for a YouTube video id. */
export function yt(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

/**
 * Course art derived from a lesson video, so thumbnails never outlive their
 * source. Older uploads have no max-res still, so pass "sddefault" for those.
 */
export function ytThumb(id: string, quality: "maxresdefault" | "sddefault" = "maxresdefault"): string {
  return `https://i.ytimg.com/vi/${id}/${quality}.jpg`;
}

/**
 * Openly available reference documents attached to lessons. Every entry is
 * checked by `npm run courses:verify` for availability, PDF content type and a
 * size the lesson proxy can stream.
 */
export const PDFS = {
  eloquentJavaScript: "https://eloquentjavascript.net/Eloquent_JavaScript.pdf",
  thinkPython: "https://greenteapress.com/thinkpython2/thinkpython2.pdf",
  thinkStats: "https://greenteapress.com/thinkstats2/thinkstats2.pdf",
  gitCheatSheet: "https://education.github.com/git-cheat-sheet-education.pdf",
  vsCodeShortcuts: "https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf",
  dockerCheatSheet: "https://docs.docker.com/get-started/docker_cheatsheet.pdf",
  pandasCheatSheet: "https://pandas.pydata.org/Pandas_Cheat_Sheet.pdf",
  numpyCheatSheet:
    "https://s3.amazonaws.com/assets.datacamp.com/blog_assets/Numpy_Python_Cheat_Sheet.pdf",
  matplotlibCheatSheets: "https://matplotlib.org/cheatsheets/cheatsheets.pdf",
  sqlCheatSheet: "https://www.sqltutorial.org/wp-content/uploads/2016/04/SQL-cheat-sheet.pdf",
  usabilityHeuristics:
    "https://media.nngroup.com/media/articles/attachments/Heuristic_Summary1-compressed.pdf",
  visualDesignGuide: "https://depts.washington.edu/deshelp/toolkit/Printable_11x17_Guides.pdf",
  businessModelCanvas:
    "https://assets.strategyzer.com/assets/resources/the-business-model-canvas.pdf",
  scrumGuide: "https://scrumguides.org/docs/scrumguide/v2020/2020-Scrum-Guide-US.pdf",
  nistCsf: "https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.04162018.pdf",
  nistPasswords: "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-63b.pdf",
  seoChecklist: "https://yoast.com/app/uploads/2026/01/seo_starter_checklist_2026_jan.pdf",
  academicWritingGuide:
    "https://www-docs.b-tu.de/fg-technik-umwelt-soziologie/public/Leitfaden-Wissenschaftliches-Arbeiten/Guide%20for%20academic%20writing_BTU_EN.pdf",
  academicStyleGuide: "https://www.ang.ovgu.de/ifph_media/Downloads/Style+Guide-download-1.pdf",
  resumeGuide:
    "https://cdn-careerservices.fas.harvard.edu/wp-content/uploads/sites/161/2025/08/MASTERS-RESUME-COVER-LETTER-GUIDE.pdf",
} as const;
