export function countHelpfulHands(entries: Array<{ isHelpful: boolean }>) { return entries.filter((entry) => entry.isHelpful).length; }
export function countSavedDiscoveries(entries: Array<{ isSaved: boolean }>) { return entries.filter((entry) => entry.isSaved).length; }
