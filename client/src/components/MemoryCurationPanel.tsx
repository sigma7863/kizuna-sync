import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Calendar, Heart } from 'lucide-react';

interface CuratedMemory {
  id: string;
  title: string;
  description: string;
  photoUrls: string[];
  originalDate: Date;
  yearsAgo: number;
  reason: string;
}

interface MemoryCurationPanelProps {
  familyGroupId: number;
}

export function MemoryCurationPanel({ familyGroupId }: MemoryCurationPanelProps) {
  const [curatedMemories, setCuratedMemories] = useState<CuratedMemory[]>([]);
  const [dailyDigest, setDailyDigest] = useState('');
  const [selectedMemory, setSelectedMemory] = useState<CuratedMemory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data for demonstration
    const mockMemories: CuratedMemory[] = [
      {
        id: '1',
        title: '初めてのお出かけ',
        description: '家族で初めて公園に行った日',
        photoUrls: ['/placeholder-1.jpg'],
        originalDate: new Date('2023-06-05'),
        yearsAgo: 1,
        reason: '1年前の今日、家族で初めての思い出を作りました',
      },
      {
        id: '2',
        title: '誕生日パーティー',
        description: 'お子さんの5歳の誕生日',
        photoUrls: ['/placeholder-2.jpg'],
        originalDate: new Date('2022-06-05'),
        yearsAgo: 2,
        reason: '2年前の今日、家族で大切な日を祝いました',
      },
    ];

    const mockDigest =
      '今日は家族にとって特別な日です。1年前の今日、初めてのお出かけで素敵な思い出を作りました。そして2年前の今日は、大切な誕生日を祝いました。こうした日々の積み重ねが、家族の絆を深めています。';

    setCuratedMemories(mockMemories);
    setDailyDigest(mockDigest);
    setIsLoading(false);
  }, [familyGroupId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">思い出を読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Daily Digest */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 p-6">
        <h3 className="font-bold text-lg text-amber-900 mb-3">📖 今日の思い出</h3>
        <p className="text-sm text-amber-800 leading-relaxed">{dailyDigest}</p>
      </Card>

      {/* Curated Memories */}
      <div>
        <h3 className="font-bold text-lg mb-4">✨ 懐かしい瞬間</h3>
        <div className="space-y-3">
          {curatedMemories.map((memory) => (
            <Card
              key={memory.id}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedMemory(memory)}
            >
              <div className="flex gap-4 p-4">
                {memory.photoUrls.length > 0 && (
                  <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={memory.photoUrls[0]}
                      alt={memory.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{memory.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{memory.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{memory.yearsAgo}年前</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{memory.reason}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Memory Detail Modal */}
      {selectedMemory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedMemory.title}</h2>
                <button
                  onClick={() => setSelectedMemory(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {selectedMemory.photoUrls.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {selectedMemory.photoUrls.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`${selectedMemory.title} ${idx + 1}`}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              <p className="text-gray-700">{selectedMemory.description}</p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  <strong>なぜ今日？</strong> {selectedMemory.reason}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setSelectedMemory(null)}
                  variant="outline"
                  className="flex-1"
                >
                  閉じる
                </Button>
                <Button className="flex-1 bg-pink-500 hover:bg-pink-600 text-white">
                  ❤️ シェア
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
