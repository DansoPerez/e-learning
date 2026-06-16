import { parseVideoEmbed } from "@/lib/video-embed";

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

export { LessonPdfViewer } from "@/components/lessons/lesson-pdf-viewer";
