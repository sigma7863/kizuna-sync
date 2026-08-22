export type FamilyMembershipRecord = {
  users: {
    id: number;
  };
  family_members?: {
    memberRole: "guardian" | "child" | "elderly";
  };
};

export function isFamilyMember(members: FamilyMembershipRecord[], userId: number): boolean {
  return members.some((member) => member.users.id === userId);
}

export function getFamilyMemberRole(members: FamilyMembershipRecord[], userId: number): "guardian" | "child" | "elderly" | undefined {
  return members.find((member) => member.users.id === userId)?.family_members?.memberRole;
}
