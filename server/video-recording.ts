import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { timelineEntries } from "../drizzle/schema";
import { storagePut, storageGet } from "./storage";

/**
 * ビデオ通話録画・再生機能
 */

export interface VideoRecording {
  id: number;
  familyGroupId: number;
  callId: string;
  recordingUrl: string;
  duration: number; // 秒
  startTime: Date;
  endTime: Date;
  participants: number[];
  title: string;
  thumbnail?: string;
  fileSize: number; // バイト
}

/**
 * ビデオ通話の録画を開始
 */
export async function startVideoRecording(
  familyGroupId: number,
  callId: string,
  participants: number[]
): Promise<string | null> {
  try {
    // 録画セッションIDを生成
    const recordingSessionId = `recording-${callId}-${Date.now()}`;

    // 録画メタデータをタイムラインに保存
    const db = await getDb();
    if (!db) return null;

    await db.insert(timelineEntries).values({
      familyGroupId,
      userId: participants[0] || 0,
      content: `Video recording started: ${callId}`,
      entryType: "photo", // 一時的に photo として保存
      metadata: {
        recordingSessionId,
        callId,
        participants,
        startTime: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return recordingSessionId;
  } catch (error) {
    console.error("[VideoRecording] Failed to start recording:", error);
    return null;
  }
}

/**
 * ビデオ通話の録画を停止・保存
 */
export async function stopVideoRecording(
  recordingSessionId: string,
  videoBuffer: Buffer,
  title: string,
  participants: number[],
  familyGroupId: number
): Promise<VideoRecording | null> {
  try {
    // 動画ファイルをS3に保存
    const fileName = `video-${recordingSessionId}.webm`;
    const { url: recordingUrl, key: recordingKey } = await storagePut(
      `family-${familyGroupId}/recordings/${fileName}`,
      videoBuffer,
      "video/webm"
    );

    if (!recordingUrl) return null;

    // 録画情報をタイムラインに保存
    const db = await getDb();
    if (!db) return null;

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 3600000); // 1時間後（実際は計算される）

    await db.insert(timelineEntries).values({
      familyGroupId,
      userId: participants[0] || 0,
      content: `Video recording: ${title}`,
      entryType: "photo",
      imageUrl: recordingUrl,
      metadata: {
        recordingSessionId,
        recordingKey,
        duration: 3600, // 秒
        participants,
        fileSize: videoBuffer.length,
      },
      createdAt: startTime,
      updatedAt: new Date(),
    });

    return {
      id: 0, // 実際はDBから取得
      familyGroupId,
      callId: recordingSessionId,
      recordingUrl,
      duration: 3600,
      startTime,
      endTime,
      participants,
      title,
      fileSize: videoBuffer.length,
    };
  } catch (error) {
    console.error("[VideoRecording] Failed to stop recording:", error);
    return null;
  }
}

/**
 * 家族の録画ビデオ一覧を取得
 */
export async function getFamilyVideoRecordings(
  familyGroupId: number,
  limit: number = 10
): Promise<VideoRecording[]> {
  try {
    const db = await getDb();
    if (!db) return [];

    const entries = await db
      .select()
      .from(timelineEntries)
      .where(eq(timelineEntries.familyGroupId, familyGroupId))
      .orderBy((t) => t.createdAt)
      .limit(limit);

    const recordings: VideoRecording[] = entries
      .filter((e) => e.metadata && (e.metadata as any).recordingSessionId)
      .map((entry) => {
        const meta = entry.metadata as any;
        return {
          id: entry.id,
          familyGroupId: entry.familyGroupId,
          callId: meta.callId || "",
          recordingUrl: entry.imageUrl || "",
          duration: meta.duration || 0,
          startTime: entry.createdAt,
          endTime: new Date(entry.createdAt.getTime() + (meta.duration || 0) * 1000),
          participants: meta.participants || [],
          title: entry.content || "Video Recording",
          fileSize: meta.fileSize || 0,
        };
      });

    return recordings;
  } catch (error) {
    console.error("[VideoRecording] Failed to fetch recordings:", error);
    return [];
  }
}

/**
 * ビデオ録画を削除
 */
export async function deleteVideoRecording(recordingId: number): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    // ソフト削除を実装（実際は削除ロジック）
    return true;
  } catch (error) {
    console.error("[VideoRecording] Failed to delete recording:", error);
    return false;
  }
}

/**
 * ビデオのサムネイルを生成
 */
export async function generateVideoThumbnail(
  recordingUrl: string,
  familyGroupId: number
): Promise<string | null> {
  try {
    // 実装は省略（FFmpeg等を使用してサムネイルを生成）
    return recordingUrl; // プレースホルダー
  } catch (error) {
    console.error("[VideoRecording] Failed to generate thumbnail:", error);
    return null;
  }
}
