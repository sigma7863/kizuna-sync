import { describe, expect, it } from "vitest";
import { canCreateCareMessage, canMarkCareMessageRead, canSetCareMessageResponse, canViewCareMessage, getCareMessageRecipientUserId } from "../shared/familyCareMessages";

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

  it("keeps private messages visible to their sender and recipient only, and validates both message participants", () => {
    expect(canViewCareMessage({ senderUserId: 2, recipientUserId: 7 }, 2)).toBe(true);
    expect(canViewCareMessage({ senderUserId: 2, recipientUserId: 7 }, 7)).toBe(true);
    expect(canViewCareMessage({ senderUserId: 2, recipientUserId: 7 }, 3)).toBe(false);
    expect(canViewCareMessage({ senderUserId: 2, recipientUserId: null }, 3)).toBe(true);
    expect(canCreateCareMessage([2, 7], 2, 7)).toBe(true);
    expect(canCreateCareMessage([2, 7], 2, 8)).toBe(false);
    expect(canCreateCareMessage([2, 7], 8)).toBe(false);
  });

  it("lets only the direct recipient quietly defer a reply", () => {
    const directMessage = { isRead: false, senderUserId: 2, recipientUserId: 7 };
    expect(canSetCareMessageResponse(directMessage, 7)).toBe(true);
    expect(canSetCareMessageResponse(directMessage, 2)).toBe(false);
    expect(canSetCareMessageResponse({ ...directMessage, recipientUserId: null }, 7)).toBe(false);
  });
});
