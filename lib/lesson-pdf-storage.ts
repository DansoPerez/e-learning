import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const PDF_DIR = path.join(process.cwd(), "storage", "lesson-pdfs");
const MAX_BYTES = 20 * 1024 * 1024;

export async function saveLessonPdf(buffer: Buffer): Promise<string> {
  if (buffer.length > MAX_BYTES) {
    throw new Error("PDF too large (max 20MB)");
  }

  await mkdir(PDF_DIR, { recursive: true });
  const storageKey = `${randomUUID()}.pdf`;
  await writeFile(path.join(PDF_DIR, storageKey), buffer);
  return storageKey;
}

export async function readLessonPdf(storageKey: string): Promise<Buffer> {
  if (!/^[a-f0-9-]+\.pdf$/i.test(storageKey)) {
    throw new Error("Invalid storage key");
  }
  return readFile(path.join(PDF_DIR, storageKey));
}
