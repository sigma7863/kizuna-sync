export type FamilyAlbumDiscoveryMode = "all" | "favorites" | "search";

export function getFamilyAlbumDiscoveryMode(keyword: string, favoritesOnly: boolean): FamilyAlbumDiscoveryMode {
  return keyword.trim().length > 0 ? "search" : favoritesOnly ? "favorites" : "all";
}
