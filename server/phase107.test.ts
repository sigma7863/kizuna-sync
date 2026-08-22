import { describe, expect, it } from "vitest";
import { canMarkCareMessageRead, getCareMessageRecipientUserId } from "../shared/familyCareMessages";

describe("phase 107 family care message accessibility and delivery", () => {
  it("turns the all-family option into an open recipient and rejects invalid recipient choices", () => {
    expect(getCareMessageRecipientUserId("all")).toBeUndefined();
    expect(getCareMessageRecipientUserId("12")).toBe(12);
    expect(getCareMessageRecipientUserId("0")).toBeUndefined();
    expect(getCareMessageRecipientUserId("not-a-user")).toBeUndefined();
  });

  it("only lets an eligible recipient mark an unread message as read", () => {
    expect(canMarkCareMessageRead({ isRead: false, senderUserId: 2, recipientUserId: 7 }, 7)).toBe(true);
    expect(canMarkCareMessageRead({ isRead: false, senderUserId: 2, recipientUserId: null }, 7)).toBe(true);
    expect(canMarkCareMessageRead({ isRead: false, senderUserId: 2, recipientUserId: 7 }, 3)).toBe(false);
    expect(canMarkCareMessageRead({ isRead: false, senderUserId: 7, recipientUserId: null }, 7)).toBe(false);
    expect(canMarkCareMessageRead({ isRead: true, senderUserId: 2, recipientUserId: 7 }, 7)).toBe(false);
  });
});
