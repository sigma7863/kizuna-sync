import { invokeLLM } from './_core/llm';

export interface CuratedMemory {
  id: string;
  title: string;
  description: string;
  photoUrls: string[];
  originalDate: Date;
  curatedDate: Date;
  sentiment: string;
  reason: string; // Why this memory was curated
  yearsAgo: number;
}

export async function generateMemoryCuration(
  familyGroupId: number,
  pastMemories: Array<{
    title: string;
    description: string;
    photoUrls: string[];
    createdAt: Date;
  }>
): Promise<CuratedMemory[]> {
  if (pastMemories.length === 0) {
    return [];
  }

  try {
    const today = new Date();
    const memoryPrompt = pastMemories
      .map(
        (m) =>
          `- "${m.title}": ${m.description} (${m.createdAt.toLocaleDateString('ja-JP')})`
      )
      .join('\n');

    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content:
            'You are a family memory curator. Analyze past family memories and suggest which ones would be meaningful to revisit today. Return a JSON array with selected memories and reasons.',
        },
        {
          role: 'user',
          content: `Today is ${today.toLocaleDateString('ja-JP')}. Here are past family memories:\n${memoryPrompt}\n\nSuggest 2-3 memories that would be meaningful to revisit today, considering anniversaries, seasons, or emotional significance. Return JSON array with: { title, reason, yearsAgo }`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'memory_curation',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              curated_memories: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    reason: { type: 'string' },
                    yearsAgo: { type: 'number' },
                  },
                  required: ['title', 'reason', 'yearsAgo'],
                },
              },
            },
            required: ['curated_memories'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message.content;
    if (!content || typeof content !== 'string') return [];

    const parsed = JSON.parse(content);
    const curatedMemories: CuratedMemory[] = parsed.curated_memories.map(
      (item: any, idx: number) => {
        const matchedMemory = pastMemories.find((m) => m.title.includes(item.title));
        return {
          id: `curated-${Date.now()}-${idx}`,
          title: item.title,
          description: matchedMemory?.description || '',
          photoUrls: matchedMemory?.photoUrls || [],
          originalDate: matchedMemory?.createdAt || new Date(),
          curatedDate: today,
          sentiment: 'nostalgic',
          reason: item.reason,
          yearsAgo: item.yearsAgo,
        };
      }
    );

    return curatedMemories;
  } catch (error) {
    console.error('[Memory Curation] Error:', error);
    return [];
  }
}

export async function generateDailyMemoryDigest(
  familyGroupId: number,
  pastMemories: Array<{
    title: string;
    description: string;
    photoUrls: string[];
    createdAt: Date;
  }>
): Promise<string> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content:
            'You are a family storyteller. Create a warm, engaging daily digest of family memories.',
        },
        {
          role: 'user',
          content: `Create a 2-3 sentence daily memory digest for a family based on these past memories: ${pastMemories.map((m) => m.title).join(', ')}. Make it warm and nostalgic.`,
        },
      ],
    });

    const content = response.choices[0]?.message.content;
    const textContent = typeof content === 'string' ? content : '';
    return textContent || 'No memories to share today.';
  } catch (error) {
    console.error('[Memory Digest] Error:', error);
    return 'No memories to share today.';
  }
}

export async function suggestMemoryTheme(
  familyGroupId: number,
  currentSeason: string
): Promise<string> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'You are a family memory curator. Suggest a theme for family memories.',
        },
        {
          role: 'user',
          content: `Suggest a meaningful theme for family memories during ${currentSeason}. Keep it short and warm.`,
        },
      ],
    });

    const content = response.choices[0]?.message.content;
    const textContent = typeof content === 'string' ? content : '';
    return textContent || 'Family Moments';
  } catch (error) {
    console.error('[Memory Theme] Error:', error);
    return 'Family Moments';
  }
}
