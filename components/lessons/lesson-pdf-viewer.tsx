"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";

type PdfAccessResponse = {
  proxyUrl?: string;
  directUrl?: string | null;
  error?: string;
};

type PdfErrorResponse = {
  error?: string;
  directUrl?: string;
};

export function LessonPdfViewer({ lessonId, title }: { lessonId: string; title: string }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [openUrl, setOpenUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    async function loadPdf() {
      setLoading(true);
      setError(null);
      setBlobUrl(null);

      try {
        const accessRes = await fetch(`/api/lessons/${lessonId}/pdf-access`, {
          credentials: "include",
        });
        const access = (await accessRes.json().catch(() => ({}))) as PdfAccessResponse;

        if (!accessRes.ok) {
          throw new Error(access.error ?? "Could not load reading material");
        }

        const fallbackOpenUrl = access.directUrl ?? access.proxyUrl ?? null;
        if (fallbackOpenUrl) setOpenUrl(fallbackOpenUrl);

        const proxyRes = await fetch(access.proxyUrl ?? `/api/lessons/${lessonId}/pdf`, {
          credentials: "include",
        });

        const contentType = proxyRes.headers.get("content-type") ?? "";

        if (proxyRes.ok && contentType.includes("application/pdf")) {
          const blob = await proxyRes.blob();
          objectUrl = URL.createObjectURL(blob);
          if (!cancelled) {
            setBlobUrl(objectUrl);
            setOpenUrl(objectUrl);
          }
          return;
        }

        const payload = (await proxyRes.json().catch(() => ({}))) as PdfErrorResponse;
        const directUrl = payload.directUrl ?? access.directUrl ?? null;

        if (directUrl) {
          if (!cancelled) {
            setOpenUrl(directUrl);
            setError(
              payload.error ??
                "This PDF is too large to embed. Use the button below to open it.",
            );
          }
          return;
        }

        throw new Error(payload.error ?? "Reading material unavailable");
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Reading material unavailable");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadPdf();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [lessonId]);

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background-subtle)] shadow-[var(--shadow-sm)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] bg-white px-4 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">
          Reading material — view only
        </p>
        {openUrl ?
          <a
            href={openUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-semibold text-[var(--primary)] hover:underline"
          >
            Open PDF
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        : null}
      </div>

      {loading ?
        <p className="p-6 text-sm text-[var(--foreground-muted)]">Loading reading material…</p>
      : error ?
        <div className="space-y-3 p-4">
          <p className="text-sm text-amber-900">{error}</p>
          {openUrl ?
            <a
              href={openUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white sm:w-auto"
            >
              Open reading material
            </a>
          : null}
        </div>
      : blobUrl ?
        <>
          <object
            data={blobUrl}
            type="application/pdf"
            className="hidden h-[min(70vh,720px)] w-full bg-white sm:block"
          >
            <iframe
              src={blobUrl}
              title={`${title} reading material`}
              className="h-[min(70vh,720px)] w-full border-0 bg-white"
            />
          </object>
          <div className="space-y-3 p-4 sm:hidden">
            <p className="text-sm text-[var(--foreground-secondary)]">
              PDFs open more reliably on mobile in your browser viewer.
            </p>
            <a
              href={openUrl ?? blobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white"
            >
              View reading material
            </a>
          </div>
        </>
      : openUrl ?
        <div className="space-y-3 p-4">
          <p className="text-sm text-[var(--foreground-secondary)]">
            Open the reading material in your browser to view this PDF.
          </p>
          <a
            href={openUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white sm:w-auto"
          >
            View reading material
          </a>
        </div>
      : <p className="p-6 text-sm text-[var(--foreground-muted)]">Reading material unavailable.</p>}
    </div>
  );
}
