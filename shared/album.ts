export const SUPPORTED_ALBUM_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type AlbumMimeType = (typeof SUPPORTED_ALBUM_MIME_TYPES)[number];
export const MAX_ALBUM_PHOTO_BYTES = 8 * 1024 * 1024;

export function isSupportedAlbumMimeType(value: string): value is AlbumMimeType {
  return (SUPPORTED_ALBUM_MIME_TYPES as readonly string[]).includes(value);
}

export function albumFileExtension(mimeType: AlbumMimeType) {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

export function matchesAlbumSearch(photo: { fileName: string; description: string | null; tags: unknown }, keyword: string) {
  const normalizedKeyword = keyword.trim().toLocaleLowerCase();
  if (!normalizedKeyword) return true;
  const tagText = Array.isArray(photo.tags) ? photo.tags.filter((tag): tag is string => typeof tag === "string").join(" ") : "";
  return [photo.fileName, photo.description ?? "", tagText]
    .join(" ")
    .toLocaleLowerCase()
    .includes(normalizedKeyword);
}
