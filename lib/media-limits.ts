export const MEDIA_LIMITS = {
  videoBytes: 100 * 1024 * 1024,
  pdfBytes: 50 * 1024 * 1024,
  selfieBytes: 5 * 1024 * 1024,
  thumbnailBytes: 5 * 1024 * 1024,
} as const;

export const VERCEL_UPLOAD_BYTES = 4.5 * 1024 * 1024;
