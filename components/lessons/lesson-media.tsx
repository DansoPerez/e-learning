import { parseVideoEmbed } from "@/lib/video-embed";

export function LessonVideo({ url }: { url: string }) {
  const embed = parseVideoEmbed(url);
  if (!embed) return null;

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
  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background-subtle)] shadow-[var(--shadow-sm)]">
      <p className="border-b border-[var(--border)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
        Reading material — view only
      </p>
      <iframe
        src={`/api/lessons/${lessonId}/pdf#toolbar=0&navpanes=0`}
        title={`${title} reading material`}
        className="h-[min(70vh,720px)] w-full border-0 bg-white"
      />
    </div>
  );
}
