export type FamilyDailySupportRole = "guardian" | "child" | "elderly";
export type FamilyDailySupportInput = {
  shoppingItems: Array<{ isPurchased: boolean }>;
  helpRequests: Array<{ status: "open" | "accepted" | "completed" }>;
};

export type FamilyDailySupportSummary = {
  openShoppingCount: number;
  openHelpCount: number;
  completedCount: number;
  action: "coordinate" | "contribute" | "rest";
};

export function buildFamilyDailySupportSummary(role: FamilyDailySupportRole, input: FamilyDailySupportInput): FamilyDailySupportSummary {
  const openShoppingCount = input.shoppingItems.filter((item) => !item.isPurchased).length;
  const openHelpCount = input.helpRequests.filter((request) => request.status === "open" || request.status === "accepted").length;
  const completedCount = input.shoppingItems.filter((item) => item.isPurchased).length + input.helpRequests.filter((request) => request.status === "completed").length;
  return { openShoppingCount, openHelpCount, completedCount, action: role === "guardian" ? "coordinate" : role === "child" ? "contribute" : "rest" };
}
