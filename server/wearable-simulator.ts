import { timelineEntries, userActivities, wearableHealthSnapshots } from "../drizzle/schema";
import { getDb } from "./db";

const cancelledSimulationIds = new Set<string>();

export function cancelWearableSimulation(simulationId: string) {
  cancelledSimulationIds.add(simulationId);
}

export function isWearableSimulationCancelled(simulationId: string) {
  return cancelledSimulationIds.has(simulationId);
}

export function clearWearableSimulationCancellation(simulationId: string) {
  cancelledSimulationIds.delete(simulationId);
}

export class WearableSimulationCancelledError extends Error {
  constructor() {
    super("Wearable simulation cancelled");
    this.name = "WearableSimulationCancelledError";
  }
}

export interface SimulatedWearableSnapshot {
  familyGroupId: number;
  userId: number;
  steps: number;
  heartRate: number;
  sleepMinutes: number;
  simulatedAt: Date;
  source: "simulated";
}

function seededNumber(seed: number, min: number, max: number) {
  const value = Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1;
  return Math.round(min + value * (max - min));
}

export function generateWearableSnapshot(input: { familyGroupId: number; userId: number; seed?: number; now?: Date }): SimulatedWearableSnapshot {
  const seed = input.seed ?? Date.now();
  return {
    familyGroupId: input.familyGroupId,
    userId: input.userId,
    steps: seededNumber(seed, 1800, 12500),
    heartRate: seededNumber(seed + 1, 58, 112),
    sleepMinutes: seededNumber(seed + 2, 300, 540),
    simulatedAt: input.now ?? new Date(),
    source: "simulated",
  };
}

export async function persistWearableSnapshot(snapshot: SimulatedWearableSnapshot, simulationId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const checkCancellation = () => {
    if (isWearableSimulationCancelled(simulationId)) throw new WearableSimulationCancelledError();
  };
  const content = `ウェアラブル体験データ：${snapshot.steps.toLocaleString()}歩・心拍${snapshot.heartRate}bpm・睡眠${Math.floor(snapshot.sleepMinutes / 60)}時間${snapshot.sleepMinutes % 60}分`;
  const metadata = {
    source: snapshot.source,
    steps: snapshot.steps,
    heartRate: snapshot.heartRate,
    sleepMinutes: snapshot.sleepMinutes,
  };
  let stored: SimulatedWearableSnapshot & { id: number; createdAt: Date } | undefined;

  await db.transaction(async (tx) => {
    checkCancellation();
    const healthResult = await tx.insert(wearableHealthSnapshots).values(snapshot);
    checkCancellation();
    await tx.insert(userActivities).values({
      userId: snapshot.userId,
      familyGroupId: snapshot.familyGroupId,
      activityType: "walking",
      activityData: metadata,
    });
    checkCancellation();
    await tx.insert(timelineEntries).values({
      familyGroupId: snapshot.familyGroupId,
      userId: snapshot.userId,
      entryType: "activity",
      content,
      metadata: { ...metadata, healthSnapshot: snapshot },
    });
    checkCancellation();
    stored = {
      ...snapshot,
      id: Number((healthResult as { insertId?: number }).insertId ?? 0),
      createdAt: new Date(),
    };
  });

  return stored!;
}
