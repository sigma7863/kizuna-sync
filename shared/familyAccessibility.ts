export type FamilyMemberRole = "guardian" | "child" | "elderly";
export type QuickHubAction = "safety" | "assistant" | "album" | "shareMood" | "stats";
export type DisplayScale = "standard" | "large" | "xlarge";

const roleActions: Record<FamilyMemberRole, QuickHubAction[]> = {
  guardian: ["safety", "stats", "assistant"],
  child: ["shareMood", "album", "assistant"],
  elderly: ["safety", "shareMood", "assistant"],
};
const displayScalePercent: Record<DisplayScale, number> = { standard: 100, large: 112.5, xlarge: 125 };

export function getRoleQuickActions(role: FamilyMemberRole): QuickHubAction[] { return roleActions[role]; }
export function getDisplayScalePercent(scale: DisplayScale): number { return displayScalePercent[scale]; }
