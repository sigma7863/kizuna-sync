import { describe, expect, it } from "vitest";
import {
  canMarkFamilyNotificationRead,
  FAMILY_REALTIME_SOCKET_OPTIONS,
  isFamilyScopedEvent,
  isUserNotification,
} from "../shared/familyRealtime";

describe("phase 127 family realtime contracts", () => {
  it("keeps reconnect settings and both supported transports enabled", () => {
    expect(FAMILY_REALTIME_SOCKET_OPTIONS.transports).toEqual(["websocket", "polling"]);
    expect(FAMILY_REALTIME_SOCKET_OPTIONS.reconnection).toBe(true);
    expect(FAMILY_REALTIME_SOCKET_OPTIONS.reconnectionAttempts).toBe(5);
  });

  it("accepts events only for the active positive family group", () => {
    expect(isFamilyScopedEvent(42, 42)).toBe(true);
    expect(isFamilyScopedEvent(43, 42)).toBe(false);
    expect(isFamilyScopedEvent(42, 0)).toBe(false);
    expect(isFamilyScopedEvent(42, -1)).toBe(false);
  });

  it("delivers notifications only to the matching user and family", () => {
    expect(isUserNotification(7, 42, 7, 42)).toBe(true);
    expect(isUserNotification(8, 42, 7, 42)).toBe(false);
    expect(isUserNotification(7, 43, 7, 42)).toBe(false);
  });

  it("rejects invalid read acknowledgements before emitting them", () => {
    expect(canMarkFamilyNotificationRead(42, 10)).toBe(true);
    expect(canMarkFamilyNotificationRead(0, 10)).toBe(false);
    expect(canMarkFamilyNotificationRead(42, 0)).toBe(false);
    expect(canMarkFamilyNotificationRead(42, -1)).toBe(false);
  });
});
