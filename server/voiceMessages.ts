import { getDb } from "./db";
import { storagePut } from "./storage";
import { transcribeAudio } from "./_core/voiceTranscription";

/**
 * 音声メッセージ機能
 * 家族間の音声メモ・メッセージ機能を実装
 */

interface VoiceMessage {
  id: string;
  familyGroupId: number;
  senderId: number;
  audioUrl: string;
  transcription?: string;
  duration: number;
  createdAt: Date;
  isRead: boolean;
}

/**
 * 音声メッセージを保存
 */
export async function saveVoiceMessage(
  familyGroupId: number,
  senderId: number,
  audioBuffer: Buffer,
  duration: number
): Promise<VoiceMessage> {
  try {
    // 音声ファイルをS3に保存
    const audioKey = `voice-messages/${familyGroupId}/${senderId}/${Date.now()}.webm`;
    const { url: audioUrl } = await storagePut(audioKey, audioBuffer, "audio/webm");

    // 音声をテキストに変換
    let transcription: string | undefined;
    try {
      const result = await transcribeAudio({
        audioUrl,
        language: "ja",
      });
      if (result && "text" in result) {
        transcription = result.text;
      }
    } catch (error) {
      console.warn("Failed to transcribe audio:", error);
    }

    // データベースに保存
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // TODO: voice_messagesテーブルに保存
    const message: VoiceMessage = {
      id: `${Date.now()}-${Math.random()}`,
      familyGroupId,
      senderId,
      audioUrl,
      transcription,
      duration,
      createdAt: new Date(),
      isRead: false,
    };

    return message;
  } catch (error) {
    console.error("Failed to save voice message:", error);
    throw error;
  }
}

/**
 * 音声メッセージを取得
 */
export async function getVoiceMessages(
  familyGroupId: number,
  limit: number = 50
): Promise<VoiceMessage[]> {
  try {
    // TODO: データベースから音声メッセージを取得
    return [];
  } catch (error) {
    console.error("Failed to get voice messages:", error);
    throw error;
  }
}

/**
 * 音声メッセージを既読にマーク
 */
export async function markVoiceMessageAsRead(messageId: string): Promise<void> {
  try {
    // TODO: データベースで既読フラグを更新
  } catch (error) {
    console.error("Failed to mark message as read:", error);
    throw error;
  }
}

/**
 * 音声メッセージを削除
 */
export async function deleteVoiceMessage(messageId: string): Promise<void> {
  try {
    // TODO: データベースとS3から削除
  } catch (error) {
    console.error("Failed to delete voice message:", error);
    throw error;
  }
}
