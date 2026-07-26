/**
 * Verifies that every external asset referenced by the seed course catalog is
 * still reachable: YouTube videos must exist and allow embedding, and PDFs must
 * be served as PDFs small enough for the lesson proxy to stream.
 *
 * Usage:
 *   npm run courses:verify              # check the seed catalog
 *   npm run courses:verify -- <url...>  # check ad-hoc URLs
 */
import { PDF_PROXY_MAX_BYTES } from "../lib/lesson-pdf-delivery";
import { COURSE_CATALOG } from "../prisma/course-catalog";

const CONCURRENCY = 6;
const TIMEOUT_MS = 25_000;

type CheckResult = {
  url: string;
  label: string;
  ok: boolean;
  detail: string;
};

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        // Some CDNs reject requests without a browser-ish agent.
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        ...init?.headers,
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

function youtubeId(url: string): string | null {
  return (
    url.match(
      /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/i,
    )?.[1] ?? null
  );
}

async function checkYouTube(url: string, label: string): Promise<CheckResult> {
  const id = youtubeId(url);
  if (!id) return { url, label, ok: false, detail: "not a recognisable YouTube URL" };

  const oembed = await fetchWithTimeout(
    `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`,
  );
  if (!oembed.ok) {
    return { url, label, ok: false, detail: `oembed ${oembed.status} (removed or private)` };
  }
  const meta = (await oembed.json()) as { title: string; author_name: string };

  // oEmbed still succeeds for videos that block third-party embedding, so read
  // the embed player itself and look for the blocked-playback marker.
  const player = await fetchWithTimeout(`https://www.youtube.com/embed/${id}`);
  const html = await player.text();
  const embeddable = !/playableInEmbed"\s*:\s*false/.test(html);

  return {
    url,
    label,
    ok: embeddable,
    detail: `${meta.author_name} — ${meta.title}${embeddable ? "" : " [EMBEDDING BLOCKED]"}`,
  };
}

async function checkPdf(url: string, label: string): Promise<CheckResult> {
  // Some hosts (notably Cloudflare-fronted government sites) answer HEAD with a
  // 404 while serving the file perfectly well on GET, so always retry ranged.
  let res = await fetchWithTimeout(url, { method: "HEAD", redirect: "follow" });
  if (!res.ok) {
    res = await fetchWithTimeout(url, { headers: { Range: "bytes=0-1023" } });
  }
  if (!res.ok && res.status !== 206) {
    return { url, label, ok: false, detail: `HTTP ${res.status}` };
  }

  const type = res.headers.get("content-type") ?? "unknown";
  const lengthHeader =
    res.headers.get("content-length") ??
    res.headers.get("content-range")?.split("/")[1] ??
    null;
  const bytes = lengthHeader ? Number(lengthHeader) : NaN;

  if (!type.includes("pdf") && !type.includes("octet-stream")) {
    return { url, label, ok: false, detail: `content-type ${type}` };
  }
  if (Number.isFinite(bytes) && bytes > PDF_PROXY_MAX_BYTES) {
    const mb = (bytes / 1024 / 1024).toFixed(1);
    return { url, label, ok: false, detail: `${mb}MB exceeds the ${PDF_PROXY_MAX_BYTES / 1024 / 1024}MB proxy limit` };
  }

  const size = Number.isFinite(bytes) ? `${Math.round(bytes / 1024)}KB` : "size unknown";
  return { url, label, ok: true, detail: `${type}, ${size}` };
}

async function checkImage(url: string, label: string): Promise<CheckResult> {
  const res = await fetchWithTimeout(url, { method: "HEAD", redirect: "follow" });
  if (!res.ok) return { url, label, ok: false, detail: `HTTP ${res.status}` };
  const type = res.headers.get("content-type") ?? "unknown";
  return { url, label, ok: type.startsWith("image/"), detail: type };
}

async function check(url: string, label: string): Promise<CheckResult> {
  try {
    if (youtubeId(url)) return await checkYouTube(url, label);
    if (url.toLowerCase().includes(".pdf")) return await checkPdf(url, label);
    return await checkImage(url, label);
  } catch (err) {
    return { url, label, ok: false, detail: err instanceof Error ? err.message : String(err) };
  }
}

async function runPool(targets: { url: string; label: string }[]): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  let cursor = 0;

  async function worker() {
    while (cursor < targets.length) {
      const target = targets[cursor++];
      const result = await check(target.url, target.label);
      results.push(result);
      const icon = result.ok ? "ok  " : "FAIL";
      console.log(`${icon} ${result.label}\n     ${result.url}\n     ${result.detail}`);
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  return results;
}

function catalogTargets() {
  const targets: { url: string; label: string }[] = [];
  for (const course of COURSE_CATALOG) {
    if (course.thumbnailUrl) {
      targets.push({ url: course.thumbnailUrl, label: `${course.title} · thumbnail` });
    }
    for (const courseModule of course.modules) {
      for (const lesson of courseModule.lessons) {
        if (lesson.videoUrl) {
          targets.push({ url: lesson.videoUrl, label: `${course.title} · ${lesson.title} · video` });
        }
        if (lesson.pdfUrl) {
          targets.push({ url: lesson.pdfUrl, label: `${course.title} · ${lesson.title} · pdf` });
        }
      }
    }
  }
  return targets;
}

async function main() {
  const args = process.argv.slice(2);
  const targets =
    args.length > 0 ? args.map((url, i) => ({ url, label: `arg[${i}]` })) : catalogTargets();

  console.log(`Checking ${targets.length} links...\n`);
  const results = await runPool(targets);

  const failures = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failures.length}/${results.length} links OK.`);
  if (failures.length > 0) {
    console.log(`\n${failures.length} FAILED:`);
    for (const f of failures) console.log(`  - ${f.label}: ${f.detail}\n    ${f.url}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
