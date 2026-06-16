import Image from "next/image";
import { cn } from "@/lib/utils";

function isCloudinaryUrl(url: string) {
  try {
    return new URL(url).hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
}

type CourseThumbnailProps = {
  src: string;
  alt?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/** Renders instructor thumbnails from Cloudinary via next/image; any other URL uses a plain img. */
export function CourseThumbnail({
  src,
  alt = "",
  className,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw",
  priority = false,
}: CourseThumbnailProps) {
  if (isCloudinaryUrl(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        priority={priority}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn("absolute inset-0 h-full w-full object-cover", className)}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
