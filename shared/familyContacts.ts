export type FamilyContactCategory = "緊急" | "かかりつけ先" | "避難場所" | string;
export type FamilyContactRole = "guardian" | "child" | "elderly";

export function visibleFamilyContacts<T extends { category: FamilyContactCategory }>(items: T[], role: FamilyContactRole): T[] {
  return role === "child" ? items.filter((item) => item.category === "緊急") : items;
}
