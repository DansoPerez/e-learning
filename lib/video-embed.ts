export type VideoEmbed =
  | { kind: "youtube" | "vimeo"; embedUrl: string }
  | { kind: "direct"; src: string };

const YOUTUBE =
  /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/i;

const VIMEO = /^(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(?:video\/)?(\d+)/i;

const DIRECT_VIDEO = /\.(mp4|webm|ogg|mov)(\?.*)?$/i;

export function parseVideoEmbed(input: string): VideoEmbed | null {
  const url = input.trim();
  if (!url) return null;

  const youtube = url.match(YOUTUBE);
  if (youtube?.[1]) {
    return {
      kind: "youtube",
      embedUrl: `https://www.youtube.com/embed/${youtube[1]}?rel=0&modestbranding=1`,
    };
  }

  const vimeo = url.match(VIMEO);
  if (vimeo?.[1]) {
    return {
      kind: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeo[1]}?title=0&byline=0&portrait=0`,
    };
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;

    if (
      parsed.hostname.includes("cloudinary.com") &&
      (parsed.pathname.includes("/video/") || DIRECT_VIDEO.test(parsed.pathname))
    ) {
      return { kind: "direct", src: url };
    }

    if (DIRECT_VIDEO.test(parsed.pathname)) {
      return { kind: "direct", src: url };
    }
  } catch {
    return null;
  }

  return null;
}

export function isValidVideoUrl(input: string): boolean {
  return parseVideoEmbed(input) !== null;
}
