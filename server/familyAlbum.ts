import { getDb } from "./db";
import { storagePut } from "./storage";
import { invokeLLM } from "./_core/llm";

/**
 * 家族アルバム機能
 * 共有写真の自動整理・タイムカプセル機能を実装
 */

interface FamilyPhoto {
  id: string;
  familyGroupId: number;
  uploadedBy: number;
  photoUrl: string;
  caption?: string;
  aiDescription?: string;
  tags: string[];
  createdAt: Date;
  uploadedAt: Date;
}

interface FamilyAlbum {
  id: string;
  familyGroupId: number;
  name: string;
  description?: string;
  coverPhotoUrl?: string;
  photos: FamilyPhoto[];
  createdAt: Date;
  updatedAt: Date;
}

interface TimeCapsule {
  id: string;
  familyGroupId: number;
  name: string;
  description?: string;
  photos: FamilyPhoto[];
  openDate: Date;
  createdAt: Date;
}

/**
 * 写真をアップロードして自動分類
 */
export async function uploadFamilyPhoto(
  familyGroupId: number,
  uploadedBy: number,
  photoBuffer: Buffer,
  caption?: string
): Promise<FamilyPhoto> {
  try {
    // 写真をS3に保存
    const photoKey = `family-photos/${familyGroupId}/${uploadedBy}/${Date.now()}.jpg`;
    const { url: photoUrl } = await storagePut(photoKey, photoBuffer, "image/jpeg");

    // AIで写真を分析し、説明とタグを生成
    const { description, tags } = await analyzePhotoWithAI(photoUrl);

    // データベースに保存
    const photo: FamilyPhoto = {
      id: `${Date.now()}-${Math.random()}`,
      familyGroupId,
      uploadedBy,
      photoUrl,
      caption,
      aiDescription: description,
      tags,
      createdAt: new Date(),
      uploadedAt: new Date(),
    };

    // TODO: データベースに保存
    return photo;
  } catch (error) {
    console.error("Failed to upload family photo:", error);
    throw error;
  }
}

/**
 * AIで写真を分析
 */
export async function analyzePhotoWithAI(
  photoUrl: string
): Promise<{ description: string; tags: string[] }> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are a family photo analyst. Analyze the photo and provide a brief description and tags in Japanese.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "この写真を分析して、説明とタグを日本語で提供してください。JSON形式で返してください。",
            },
            {
              type: "image_url",
              image_url: { url: photoUrl },
            },
          ],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "photo_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              description: {
                type: "string",
                description: "写真の説明",
              },
              tags: {
                type: "array",
                items: { type: "string" },
                description: "写真に関連するタグ",
              },
            },
            required: ["description", "tags"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message.content;
    if (typeof content === "string") {
      const parsed = JSON.parse(content);
      return {
        description: parsed.description || "",
        tags: parsed.tags || [],
      };
    }

    return { description: "", tags: [] };
  } catch (error) {
    console.warn("Failed to analyze photo with AI:", error);
    return { description: "", tags: [] };
  }
}

/**
 * 自動アルバムを作成（日付ごと、イベントごと）
 */
export async function createAutoAlbum(
  familyGroupId: number,
  photos: FamilyPhoto[]
): Promise<FamilyAlbum> {
  try {
    // AIでアルバムの名前と説明を生成
    const { albumName, albumDescription } = await generateAlbumMetadata(photos);

    const album: FamilyAlbum = {
      id: `${Date.now()}-${Math.random()}`,
      familyGroupId,
      name: albumName,
      description: albumDescription,
      coverPhotoUrl: photos[0]?.photoUrl,
      photos,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // TODO: データベースに保存
    return album;
  } catch (error) {
    console.error("Failed to create auto album:", error);
    throw error;
  }
}

/**
 * AIでアルバムのメタデータを生成
 */
async function generateAlbumMetadata(
  photos: FamilyPhoto[]
): Promise<{ albumName: string; albumDescription: string }> {
  try {
    const photoDescriptions = photos.map((p) => p.aiDescription).join("\n");

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are a family album curator. Generate a creative album name and description based on the photos.",
        },
        {
          role: "user",
          content: `以下の写真の説明から、家族アルバムの名前と説明を日本語で生成してください。JSON形式で返してください。\n\n${photoDescriptions}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "album_metadata",
          strict: true,
          schema: {
            type: "object",
            properties: {
              albumName: {
                type: "string",
                description: "アルバムの名前",
              },
              albumDescription: {
                type: "string",
                description: "アルバムの説明",
              },
            },
            required: ["albumName", "albumDescription"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message.content;
    if (typeof content === "string") {
      const parsed = JSON.parse(content);
      return {
        albumName: parsed.albumName || "家族アルバム",
        albumDescription: parsed.albumDescription || "",
      };
    }

    return {
      albumName: "家族アルバム",
      albumDescription: "",
    };
  } catch (error) {
    console.warn("Failed to generate album metadata:", error);
    return {
      albumName: "家族アルバム",
      albumDescription: "",
    };
  }
}

/**
 * タイムカプセルを作成
 */
export async function createTimeCapsule(
  familyGroupId: number,
  name: string,
  photos: FamilyPhoto[],
  openDate: Date,
  description?: string
): Promise<TimeCapsule> {
  try {
    const timeCapsule: TimeCapsule = {
      id: `${Date.now()}-${Math.random()}`,
      familyGroupId,
      name,
      description,
      photos,
      openDate,
      createdAt: new Date(),
    };

    // TODO: データベースに保存
    return timeCapsule;
  } catch (error) {
    console.error("Failed to create time capsule:", error);
    throw error;
  }
}

/**
 * 開封可能なタイムカプセルを取得
 */
export async function getOpenableTimeCapsules(
  familyGroupId: number
): Promise<TimeCapsule[]> {
  try {
    const now = new Date();
    // TODO: データベースから開封可能なタイムカプセルを取得
    return [];
  } catch (error) {
    console.error("Failed to get openable time capsules:", error);
    throw error;
  }
}
