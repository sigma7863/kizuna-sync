import { beforeEach, describe, expect, it, vi } from "vitest";

const transaction = vi.fn();
const txInsert = vi.fn();
const txValues = vi.fn();
const committed = vi.fn();
vi.mock("./db", () => ({
  getDb: vi.fn(async () => ({
    transaction,
  })),
}));
import { calculateDistanceMeters } from "./geofence-monitor";
import { buildWeeklyCron } from "./photo-journal-scheduler";
import { cancelWearableSimulation, clearWearableSimulationCancellation, generateWearableSnapshot, isWearableSimulationCancelled, persistWearableSnapshot } from "./wearable-simulator";

describe("phase 10 safety and automation helpers", () => {
  it("calculates a zero distance for the same coordinate", () => {
    expect(calculateDistanceMeters(35.681236, 139.767125, 35.681236, 139.767125)).toBe(0);
  });

  it("builds a six-field UTC weekly cron expression", () => {
    expect(buildWeeklyCron(1, 9, 15)).toBe("0 15 9 * * 1");
  });

  beforeEach(() => {
    transaction.mockReset();
    txInsert.mockReset();
    txValues.mockReset();
    committed.mockReset();
    txValues.mockResolvedValue({ insertId: 1 });
    txInsert.mockImplementation(() => ({ values: txValues }));
    transaction.mockImplementation(async (callback: (tx: { insert: typeof txInsert }) => Promise<unknown>) => {
      const result = await callback({ insert: txInsert });
      committed();
      return result;
    });
  });

  it("aborts before any database side effect when cancelled", async () => {
    const simulationId = "phase10-cancel-before-db";
    cancelWearableSimulation(simulationId);
    const snapshot = generateWearableSnapshot({ familyGroupId: 1, userId: 2, seed: 42 });
    await expect(persistWearableSnapshot(snapshot, simulationId)).rejects.toMatchObject({ name: "WearableSimulationCancelledError" });
    expect(transaction).toHaveBeenCalledOnce();
    expect(txInsert).not.toHaveBeenCalled();
    expect(committed).not.toHaveBeenCalled();
    clearWearableSimulationCancellation(simulationId);
  });

  it("rolls back the transaction when cancelled between副作用 stages", async () => {
    const simulationId = "phase10-cancel-mid-transaction";
    txInsert.mockImplementationOnce(() => {
      cancelWearableSimulation(simulationId);
      return { values: txValues };
    });
    const snapshot = generateWearableSnapshot({ familyGroupId: 1, userId: 2, seed: 43 });
    await expect(persistWearableSnapshot(snapshot, simulationId)).rejects.toMatchObject({ name: "WearableSimulationCancelledError" });
    expect(txInsert).toHaveBeenCalledOnce();
    expect(txValues).toHaveBeenCalledOnce();
    expect(committed).not.toHaveBeenCalled();
    clearWearableSimulationCancellation(simulationId);
  });

  it("honors a server-side cancellation token", () => {
    const simulationId = "phase10-cancel-test";
    cancelWearableSimulation(simulationId);
    expect(isWearableSimulationCancelled(simulationId)).toBe(true);
    clearWearableSimulationCancellation(simulationId);
    expect(isWearableSimulationCancelled(simulationId)).toBe(false);
  });

  it("generates deterministic wearable demo data within safe demo ranges", () => {
    const a = generateWearableSnapshot({ familyGroupId: 1, userId: 2, seed: 42 });
    const b = generateWearableSnapshot({ familyGroupId: 1, userId: 2, seed: 42 });
    expect(a).toEqual(b);
    expect(a.source).toBe("simulated");
    expect(a.steps).toBeGreaterThanOrEqual(1800);
    expect(a.steps).toBeLessThanOrEqual(12500);
    expect(a.heartRate).toBeGreaterThanOrEqual(58);
    expect(a.heartRate).toBeLessThanOrEqual(112);
    expect(a.sleepMinutes).toBeGreaterThanOrEqual(300);
    expect(a.sleepMinutes).toBeLessThanOrEqual(540);
  });
});
