export const MAIN_CONTENT_ID = "main-content";

export function shouldAnnounceRouteChange(previousPath: string | null, nextPath: string) {
  return previousPath !== null && previousPath !== nextPath;
}
