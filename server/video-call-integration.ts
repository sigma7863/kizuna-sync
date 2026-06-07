import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { familyMembers } from "../drizzle/schema";

export interface VideoCallSession {
  sessionId: string;
  familyGroupId: number;
  initiatorId: number;
  participantIds: number[];
  startTime: Date;
  endTime?: Date;
  status: "pending" | "active" | "ended";
  recordingUrl?: string;
}

export interface VideoCallInvite {
  inviteId: string;
  sessionId: string;
  recipientId: number;
  status: "pending" | "accepted" | "declined";
  createdAt: Date;
}

/**
 * ビデオ通話セッションを作成
 */
export function createVideoCallSession(
  familyGroupId: number,
  initiatorId: number,
  participantIds: number[]
): VideoCallSession {
  const sessionId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return {
    sessionId,
    familyGroupId,
    initiatorId,
    participantIds,
    startTime: new Date(),
    status: "pending",
  };
}

/**
 * 家族メンバーにビデオ通話招待を送信
 */
export async function sendVideoCallInvite(
  sessionId: string,
  recipientId: number,
  familyGroupId: number
): Promise<VideoCallInvite> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // メンバーが存在するか確認
  const member = await db
    .select()
    .from(familyMembers)
    .where(
      eq(familyMembers.userId, recipientId)
    )
    .limit(1);

  if (!member.length) {
    throw new Error("Member not found");
  }

  const inviteId = `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return {
    inviteId,
    sessionId,
    recipientId,
    status: "pending",
    createdAt: new Date(),
  };
}

/**
 * ビデオ通話セッションを終了
 */
export function endVideoCallSession(
  session: VideoCallSession,
  recordingUrl?: string
): VideoCallSession {
  return {
    ...session,
    endTime: new Date(),
    status: "ended",
    recordingUrl,
  };
}

/**
 * WebRTC シグナリングサーバーの初期化
 */
export interface WebRTCSignalingMessage {
  type: "offer" | "answer" | "ice-candidate";
  from: number;
  to: number;
  sessionId: string;
  data: any;
}

export function createSignalingMessage(
  type: "offer" | "answer" | "ice-candidate",
  from: number,
  to: number,
  sessionId: string,
  data: any
): WebRTCSignalingMessage {
  return {
    type,
    from,
    to,
    sessionId,
    data,
  };
}

/**
 * ビデオ通話品質メトリクス
 */
export interface CallQualityMetrics {
  sessionId: string;
  latency: number; // ms
  packetLoss: number; // %
  jitter: number; // ms
  bandwidth: number; // kbps
  videoResolution: string;
  audioQuality: "excellent" | "good" | "fair" | "poor";
}

export function analyzeCallQuality(
  latency: number,
  packetLoss: number,
  jitter: number
): "excellent" | "good" | "fair" | "poor" {
  if (latency < 50 && packetLoss < 1 && jitter < 20) return "excellent";
  if (latency < 150 && packetLoss < 3 && jitter < 50) return "good";
  if (latency < 300 && packetLoss < 5 && jitter < 100) return "fair";
  return "poor";
}
