import { parseVideoEmbed } from "@/lib/video-embed";
import { ExternalLink } from "lucide-react";

export function LessonVideo({ url }: { url: string }) {
  const embed = parseVideoEmbed(url);
  if (!embed) {
    return (
      <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--background-subtle)] p-4 text-sm text-[var(--foreground-muted)]">
        This lesson&apos;s video could not be displayed.{" "}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[var(--primary)] hover:underline"
        >
          Open the video in a new tab
        </a>
        .
      </div>
    );
  }

  if (embed.kind === "direct") {
    return (
      <div className="mt-6 aspect-video overflow-hidden rounded-xl bg-slate-900 shadow-lg">
        <video
          src={embed.src}
          controls
          controlsList="nodownload noplaybackrate"
          className="h-full w-full"
          playsInline
        />
      </div>
    );
  }

  return (
    <div className="mt-6 aspect-video overflow-hidden rounded-xl bg-slate-900 shadow-lg">
      <iframe
        src={embed.embedUrl}
        title="Lesson video"
        className="h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

export function LessonPdfViewer({ lessonId, title }: { lessonId: string; title: string }) {
  const pdfUrl = `/api/lessons/${lessonId}/pdf`;

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background-subtle)] shadow-[var(--shadow-sm)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] bg-white px-4 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
          Reading material — view only
        </p>
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-semibold text-[var(--primary)] hover:underline"
        >
          Open PDF
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
      <iframe
        src={`${pdfUrl}#toolbar=0&navpanes=0`}
        title={`${title} reading material`}
        className="hidden h-[min(70vh,720px)] w-full border-0 bg-white sm:block"
      />
      <div className="space-y-3 p-4 sm:hidden">
        <p className="text-sm text-[var(--foreground-secondary)]">
          PDFs open more reliably on mobile in your browser viewer.
        </p>
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white"
        >
          View reading material
        </a>
      </div>
    </div>
  );
}
