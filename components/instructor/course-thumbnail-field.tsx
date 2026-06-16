"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageIcon, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

const maxMb = 5;

export function CourseThumbnailField({
  idPrefix,
  currentUrl,
}: {
  idPrefix: string;
  currentUrl?: string | null;
}) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);

  useEffect(() => {
    setPreview(currentUrl ?? null);
  }, [currentUrl]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPreview(currentUrl ?? null);
      return;
    }
    setPreview(URL.createObjectURL(file));
  }

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <div className="space-y-3 rounded-lg border border-[var(--border)] bg-white p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
        <ImageIcon className="h-4 w-4 text-[var(--primary)]" />
        Course cover image
      </div>

      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-dashed border-[var(--border)] bg-[var(--background-subtle)]",
          preview ? "aspect-[16/9]" : "flex min-h-[140px] items-center justify-center",
        )}
      >
        {preview ?
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Course cover preview"
              className="h-full w-full object-cover"
            />
            <p className="absolute bottom-2 left-2 rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white">
              Preview
            </p>
          </>
        : <p className="px-4 text-center text-sm text-[var(--foreground-muted)]">
            Upload an image or paste a URL — shown on course cards and the catalog
          </p>
        }
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-thumbnail-file`}>Upload image (max {maxMb}MB)</Label>
        <Input
          id={`${idPrefix}-thumbnail-file`}
          name="thumbnail"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
          onChange={onFileChange}
        />
        <p className="text-xs text-[var(--foreground-muted)]">JPEG, PNG, WebP, or GIF</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-thumbnail-url`} className="flex items-center gap-1.5">
          <Link2 className="h-3.5 w-3.5" />
          Or image URL
        </Label>
        <Input
          id={`${idPrefix}-thumbnail-url`}
          name="thumbnailUrl"
          type="url"
          defaultValue={currentUrl ?? ""}
          placeholder="https://..."
        />
        <p className="text-xs text-[var(--foreground-muted)]">
          If you upload a file, it overrides the URL. Clear both to remove the cover when editing.
        </p>
      </div>
    </div>
  );
}
