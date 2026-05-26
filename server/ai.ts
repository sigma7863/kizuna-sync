import { invokeLLM } from "./_core/llm";

/**
 * フォトジャーナルの物語を生成
 * 写真のタイトルと説明から、AIが家族の物語を生成
 */
export async function generatePhotoJournalStory(
  title: string,
  description: string,
  photoCount: number
): Promise<string> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `あなたは家族の思い出を素敵な物語に変える専門家です。
          
以下のルールに従って、温かく、家族の絆を感じさせる物語を作成してください:
- 日本語で、親しみやすい文体
- 3-4段落の長さ
- 家族の愛と繋がりを強調
- 写真の枚数を物語に組み込む
- 感情的で、読む人の心に残る内容`,
        },
        {
          role: "user",
          content: `タイトル: ${title}
写真の枚数: ${photoCount}枚
説明: ${description}

この情報から、家族の物語を作成してください。`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (typeof content === "string") {
      return content;
    }

    return "素敵な思い出の日になりましたね。家族との時間を大切にしてください。";
  } catch (error) {
    console.error("Error generating photo journal story:", error);
    throw error;
  }
}

/**
 * 家族会議AIの提案を生成
 * 家族の好みと予定から、最適な提案を生成
 */
export async function generateFamilyProposal(
  familyName: string,
  preferences: string,
  memberCount: number,
  roles: string[]
): Promise<string> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `あなたは家族の幸福度を最大化するAIアシスタントです。

以下のルールに従って、家族向けの提案を作成してください:
- 日本語で、実行可能な具体的な提案
- 全年代（${roles.join("・")}）が楽しめる内容
- 予算や時間を考慮した現実的な提案
- 家族の絆を深める活動を優先
- 複数の選択肢を提供（夕食3案、お出かけ3案など）
- 各提案に簡潔な理由を添える`,
        },
        {
          role: "user",
          content: `家族名: ${familyName}
メンバー数: ${memberCount}人
メンバーの役割: ${roles.join("、")}
家族の好み・予定: ${preferences}

この情報をもとに、今週の夕食提案とお出かけ提案を作成してください。`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (typeof content === "string") {
      return content;
    }

    return "家族全員で楽しめる活動を計画してみてください。";
  } catch (error) {
    console.error("Error generating family proposal:", error);
    throw error;
  }
}

/**
 * タイムラインエントリの要約を生成
 * 複数のアクティビティから、家族の1日を要約
 */
export async function summarizeFamilyDay(
  activities: Array<{ userName: string; activityType: string; content?: string }>
): Promise<string> {
  try {
    const activitiesText = activities
      .map((a) => `${a.userName}: ${a.activityType}${a.content ? ` - ${a.content}` : ""}`)
      .join("\n");

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `あなたは家族の1日を素敵に要約する専門家です。
          
以下のアクティビティから、家族の1日がどのような日だったかを、
1-2文で温かく要約してください。`,
        },
        {
          role: "user",
          content: `家族のアクティビティ:\n${activitiesText}\n\nこの1日を要約してください。`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (typeof content === "string") {
      return content;
    }

    return "家族みんなで素敵な1日を過ごしましたね。";
  } catch (error) {
    console.error("Error summarizing family day:", error);
    throw error;
  }
}
