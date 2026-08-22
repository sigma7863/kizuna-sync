export type CareMessageReadTarget = {
  isRead: boolean;
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
