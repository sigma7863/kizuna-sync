import { beforeEach, describe, expect, it, vi } from "vitest";

const getDbMock = vi.fn();
const broadcastFamilyNotificationMock = vi.fn();

vi.mock("./db", () => ({ getDb: getDbMock }));
vi.mock("./websocket-integration", () => ({
  broadcastFamilyNotification: broadcastFamilyNotificationMock,
}));

describe("family notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses the elderly role defaults when no personal settings exist", async () => {
    const roleLimit = vi.fn().mockResolvedValue([{ memberRole: "elderly" }]);
    const roleWhere = vi.fn().mockReturnValue({ limit: roleLimit });
    const roleFrom = vi.fn().mockReturnValue({ where: roleWhere });
    const settingsLimit = vi.fn().mockResolvedValue([]);
    const settingsWhere = vi.fn().mockReturnValue({ limit: settingsLimit });
    const settingsFrom = vi.fn().mockReturnValue({ where: settingsWhere });
    const db = {
      select: vi.fn().mockReturnValueOnce({ from: roleFrom }).mockReturnValueOnce({ from: settingsFrom }),
    };
    getDbMock.mockResolvedValue(db);

    const { getNotificationSettings } = await import("./notifications");
    const result = await getNotificationSettings(9, 3);

    expect(result).toEqual({
      memberRole: "elderly",
      vibrationEnabled: true,
      soundEnabled: true,
      bannerEnabled: true,
      quietMode: false,
    });
  });

  it("creates one quiet notification per family member and excludes the actor", async () => {
    const where = vi.fn().mockResolvedValue([{ userId: 7 }, { userId: 8 }]);
    const from = vi.fn().mockReturnValue({ where });
    const insertValues = vi
      .fn()
      .mockResolvedValueOnce({ insertId: 101 })
      .mockResolvedValueOnce({ insertId: 102 });
    const db = {
      select: vi.fn().mockReturnValue({ from }),
      insert: vi.fn().mockReturnValue({ values: insertValues }),
    };
    getDbMock.mockResolvedValue(db);

    const { createFamilyNotification } = await import("./notifications");
    const result = await createFamilyNotification({
      familyGroupId: 3,
      type: "achievement",
      title: "新しいバッジ",
      message: "7日連続で家族タイムラインを共有しました",
      payload: { badgeId: "week_warrior" },
      excludeUserId: 7,
    });

    expect(insertValues).toHaveBeenCalledTimes(1);
    expect(insertValues).toHaveBeenCalledWith(expect.objectContaining({ userId: 8, quiet: true }));
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(101);
    expect(broadcastFamilyNotificationMock).toHaveBeenCalledTimes(1);
    expect(broadcastFamilyNotificationMock).toHaveBeenCalledWith(expect.objectContaining({ userId: 8, type: "achievement" }));
  });
});
