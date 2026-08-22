export type KoshienDemoStep = {
  id: "create" | "safety" | "checkIn" | "memory" | "recovery";
  path: string;
};

export function getKoshienDemoSteps(familyGroupId: number): KoshienDemoStep[] {
  return [
    { id: "create", path: "/" },
    { id: "safety", path: `/family/${familyGroupId}?tab=safety` },
    { id: "checkIn", path: `/family/${familyGroupId}?tab=timeline` },
    { id: "memory", path: `/family/${familyGroupId}?tab=album` },
    { id: "recovery", path: `/family/${familyGroupId}?tab=safety` },
  ];
}
