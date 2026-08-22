export type CareMessageReadTarget = {
  isRead: boolean;
  senderUserId: number;
  recipientUserId: number | null;
};

export type CareMessageResponseState = "unread" | "read" | "later";

export type CareMessageAccessTarget = {
  senderUserId: number;
  recipientUserId: number | null;
};

export function getCareMessageRecipientUserId(value: string): number | undefined {
  if (value === "all") return undefined;
  const recipientUserId = Number(value);
  return Number.isInteger(recipientUserId) && recipientUserId > 0 ? recipientUserId : undefined;
}

export function canMarkCareMessageRead(message: CareMessageReadTarget, currentUserId?: number): boolean {
  return Boolean(
    currentUserId
    && !message.isRead
    && message.senderUserId !== currentUserId
    && (message.recipientUserId === null || message.recipientUserId === currentUserId),
  );
}

export function canViewCareMessage(message: CareMessageAccessTarget, currentUserId: number): boolean {
  return message.recipientUserId === null || message.senderUserId === currentUserId || message.recipientUserId === currentUserId;
}

export function canCreateCareMessage(memberUserIds: number[], senderUserId: number, recipientUserId?: number): boolean {
  return memberUserIds.includes(senderUserId) && (recipientUserId === undefined || memberUserIds.includes(recipientUserId));
}

export function canSetCareMessageResponse(message: CareMessageReadTarget, currentUserId?: number): boolean {
  return Boolean(currentUserId && message.recipientUserId === currentUserId && message.senderUserId !== currentUserId);
}

export function getCareMessageResponseLabelKey(state: CareMessageResponseState): "family.careMessageUnread" | "family.careMessageRead" | "family.careMessageLater" {
  return state === "read" ? "family.careMessageRead" : state === "later" ? "family.careMessageLater" : "family.careMessageUnread";
}
