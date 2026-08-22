export type FamilyMembershipRecord = {
  users: {
    id: number;
  };
};

export function isFamilyMember(members: FamilyMembershipRecord[], userId: number): boolean {
  return members.some((member) => member.users.id === userId);
}
