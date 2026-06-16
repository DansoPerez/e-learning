export const CLOUDINARY_STORAGE_PREFIX = "cloudinary:";

export function toCloudinaryStorageKey(publicId: string): string {
  return `${CLOUDINARY_STORAGE_PREFIX}${publicId}`;
}

export function isCloudinaryStorageKey(key: string): boolean {
  return key.startsWith(CLOUDINARY_STORAGE_PREFIX);
}

export function publicIdFromStorageKey(key: string): string {
  return key.slice(CLOUDINARY_STORAGE_PREFIX.length);
}
