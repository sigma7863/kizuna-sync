import {
  getFamilyGeofences,
  getGeofenceAlertState,
  upsertGeofenceAlertState,
} from "./db";
import { createFamilyNotification } from "./notifications";

export type GeofenceAlertSeverity = "info" | "urgent";

export interface GeofenceAlertResult {
  geofenceId: number;
  geofenceName: string;
  state: "inside" | "outside";
  distanceMeters: number;
  severity: GeofenceAlertSeverity;
  notified: boolean;
}

export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const earthRadius = 6_371_000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos((lat1 * Math.PI) / 180)
      * Math.cos((lat2 * Math.PI) / 180)
      * Math.sin(dLon / 2) ** 2;
  return Math.round(earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

/**
 * Evaluate every family geofence for one new location. A transition is notified
 * once; an ongoing outside state is re-notified after 15 minutes unless it was
 * acknowledged, keeping the alert useful without producing notification noise.
 */
export async function evaluateGeofenceForLocation(input: {
  familyGroupId: number;
  userId: number;
  userName?: string | null;
  latitude: number;
  longitude: number;
}) {
  const geofences = await getFamilyGeofences(input.familyGroupId);
  const results: GeofenceAlertResult[] = [];
  const now = new Date();

  for (const geofence of geofences) {
    const distanceMeters = calculateDistanceMeters(
      input.latitude,
      input.longitude,
      Number(geofence.latitude),
      Number(geofence.longitude),
    );
    const state: "inside" | "outside" = distanceMeters <= geofence.radiusMeters ? "inside" : "outside";
    const previous = await getGeofenceAlertState(input.familyGroupId, input.userId, geofence.id);
    const transitioned = previous ? previous.state !== state : state === "outside";
    const acknowledged = Boolean(previous?.acknowledgedAt && previous.state === "outside");
    const staleOutside = state === "outside"
      && !acknowledged
      && Boolean(previous?.lastNotifiedAt)
      && now.getTime() - new Date(previous!.lastNotifiedAt!).getTime() >= 15 * 60 * 1000;
    const shouldNotify = transitioned || staleOutside;
    const severity: GeofenceAlertSeverity = state === "outside" ? "urgent" : "info";

    if (shouldNotify) {
      await createFamilyNotification({
        familyGroupId: input.familyGroupId,
        type: "safety",
        title: state === "outside" ? "安全地帯から離れています" : "安全地帯に到着しました",
        message: state === "outside"
          ? `${input.userName ?? "家族メンバー"}さんが${geofence.name}から${distanceMeters}m離れています。`
          : `${input.userName ?? "家族メンバー"}さんが${geofence.name}に戻りました。`,
        payload: {
          geofenceId: geofence.id,
          geofenceName: geofence.name,
          userId: input.userId,
          distanceMeters,
          severity,
          state,
        },
        quiet: severity !== "urgent",
      });
    }

    await upsertGeofenceAlertState({
      familyGroupId: input.familyGroupId,
      userId: input.userId,
      geofenceId: geofence.id,
      state,
      lastDistanceMeters: distanceMeters,
      lastNotifiedAt: shouldNotify ? now : previous?.lastNotifiedAt ?? null,
      acknowledgedAt: state === "inside" ? null : previous?.acknowledgedAt ?? null,
    });

    results.push({ geofenceId: geofence.id, geofenceName: geofence.name, state, distanceMeters, severity, notified: shouldNotify });
  }

  return results;
}
