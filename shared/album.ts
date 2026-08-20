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
