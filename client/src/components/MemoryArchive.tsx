import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Lock, Unlock, Heart, Share2 } from 'lucide-react';

interface Memory {
  id: number;
  title: string;
  description: string;
  photoUrls: string[];
  createdAt: Date;
  tags: string[];
  sentiment: 'happy' | 'sad' | 'nostalgic' | 'funny' | 'meaningful';
}

interface TimeCapsule {
  id: number;
  title: string;
  content: string;
  photoUrls: string[];
  createdAt: Date;
  unlockDate: Date;
  isUnlocked: boolean;
  contributors: string[];
}

interface MemoryArchiveProps {
  memories?: Memory[];
  timeCapsules?: TimeCapsule[];
  onCreateMemory?: () => void;
  onCreateTimeCapsule?: () => void;
}

const SENTIMENT_COLORS = {
  happy: 'bg-yellow-100 text-yellow-800',
  sad: 'bg-blue-100 text-blue-800',
  nostalgic: 'bg-purple-100 text-purple-800',
  funny: 'bg-orange-100 text-orange-800',
  meaningful: 'bg-pink-100 text-pink-800',
};

export function MemoryArchive({
  memories = [],
  timeCapsules = [],
  onCreateMemory,
  onCreateTimeCapsule,
}: MemoryArchiveProps) {
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [selectedCapsule, setSelectedCapsule] = useState<TimeCapsule | null>(null);
  const [activeTab, setActiveTab] = useState<'memories' | 'capsules'>('memories');

  return (
    <div className="w-full space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('memories')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'memories'
              ? 'text-pink-600 border-b-2 border-pink-600'
              : 'text-gray-600'
          }`}
        >
          📸 思い出アーカイブ
        </button>
        <button
          onClick={() => setActiveTab('capsules')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'capsules'
              ? 'text-pink-600 border-b-2 border-pink-600'
              : 'text-gray-600'
          }`}
        >
          ⏰ タイムカプセル
        </button>
      </div>

      {/* Memories Grid */}
      {activeTab === 'memories' && (
        <div className="space-y-4">
          <Button
            onClick={onCreateMemory}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white"
          >
            + 新しい思い出を作成
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {memories.map((memory) => (
              <Card
                key={memory.id}
                className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                onClick={() => setSelectedMemory(memory)}
              >
                {memory.photoUrls.length > 0 && (
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={memory.photoUrls[0]}
                      alt={memory.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          SENTIMENT_COLORS[memory.sentiment]
                        }`}
                      >
                        {memory.sentiment}
                      </span>
                    </div>
                  </div>
                )}
                <div className="p-3">
                  <h3 className="font-semibold text-gray-800">{memory.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {memory.description}
                  </p>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {memory.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(memory.createdAt).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Time Capsules */}
      {activeTab === 'capsules' && (
        <div className="space-y-4">
          <Button
            onClick={onCreateTimeCapsule}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white"
          >
            + 新しいタイムカプセルを作成
          </Button>

          <div className="space-y-3">
            {timeCapsules.map((capsule) => (
              <Card
                key={capsule.id}
                className="cursor-pointer hover:shadow-lg transition-shadow p-4"
                onClick={() => setSelectedCapsule(capsule)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {capsule.isUnlocked ? (
                        <Unlock className="w-5 h-5 text-green-600" />
                      ) : (
                        <Lock className="w-5 h-5 text-gray-400" />
                      )}
                      <h3 className="font-semibold text-gray-800">{capsule.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{capsule.content}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        開封予定: {new Date(capsule.unlockDate).toLocaleDateString('ja-JP')}
                      </span>
                      <span>
                        投稿者: {capsule.contributors.join(', ')}
                      </span>
                    </div>
                  </div>
                  {capsule.photoUrls.length > 0 && (
                    <img
                      src={capsule.photoUrls[0]}
                      alt={capsule.title}
                      className="w-16 h-16 object-cover rounded ml-2"
                    />
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Memory Detail Dialog */}
      <Dialog open={!!selectedMemory} onOpenChange={() => setSelectedMemory(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMemory?.title}</DialogTitle>
          </DialogHeader>
          {selectedMemory && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {selectedMemory.photoUrls.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`photo-${idx}`}
                    className="w-full h-32 object-cover rounded"
                  />
                ))}
              </div>
              <p className="text-gray-700">{selectedMemory.description}</p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Heart className="w-4 h-4 mr-2" />
                  いいね
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  シェア
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
