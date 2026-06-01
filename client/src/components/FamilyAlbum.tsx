import { useState } from "react";
import { Image, Plus, Calendar, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

/**
 * 家族アルバムコンポーネント
 * 共有写真の自動整理・タイムカプセル機能
 */
interface FamilyAlbumProps {
  familyGroupId: number;
}

interface Album {
  id: string;
  name: string;
  coverUrl?: string;
  photoCount: number;
  createdAt: Date;
}

interface TimeCapsule {
  id: string;
  name: string;
  coverUrl?: string;
  photoCount: number;
  openDate: Date;
  isOpened: boolean;
}

export function FamilyAlbum({ familyGroupId }: FamilyAlbumProps) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [timeCapsules, setTimeCapsules] = useState<TimeCapsule[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);

  const handleUploadPhoto = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("familyGroupId", familyGroupId.toString());

      const response = await fetch("/api/trpc/album.uploadPhoto", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast.success("写真をアップロードしました");
        setShowUploadForm(false);
      } else {
        toast.error("写真のアップロードに失敗しました");
      }
    } catch (error) {
      console.error("Failed to upload photo:", error);
      toast.error("エラーが発生しました");
    }
  };

  const handleCreateTimeCapsule = async () => {
    try {
      const response = await fetch("/api/trpc/album.createTimeCapsule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          familyGroupId,
          name: "家族タイムカプセル",
          openDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30日後
        }),
      });

      if (response.ok) {
        toast.success("タイムカプセルを作成しました");
      } else {
        toast.error("タイムカプセルの作成に失敗しました");
      }
    } catch (error) {
      console.error("Failed to create time capsule:", error);
      toast.error("エラーが発生しました");
    }
  };

  return (
    <div className="space-y-6">
      {/* アップロードボタン */}
      <div className="flex gap-2">
        <Button onClick={() => setShowUploadForm(!showUploadForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          写真をアップロード
        </Button>
        <Button variant="outline" onClick={handleCreateTimeCapsule} className="gap-2">
          <Gift className="w-4 h-4" />
          タイムカプセルを作成
        </Button>
      </div>

      {/* アップロードフォーム */}
      {showUploadForm && (
        <Card className="p-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleUploadPhoto(file);
              }
            }}
            className="block w-full"
          />
        </Card>
      )}

      {/* アルバム一覧 */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Image className="w-5 h-5" />
          アルバム
        </h3>
        {albums.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            アルバムはまだ作成されていません
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {albums.map((album) => (
              <Card
                key={album.id}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              >
                {album.coverUrl && (
                  <img
                    src={album.coverUrl}
                    alt={album.name}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-3">
                  <h4 className="font-semibold text-sm truncate">{album.name}</h4>
                  <p className="text-xs text-gray-500">
                    {album.photoCount}枚の写真
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* タイムカプセル一覧 */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5" />
          タイムカプセル
        </h3>
        {timeCapsules.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            タイムカプセルはまだ作成されていません
          </p>
        ) : (
          <div className="space-y-3">
            {timeCapsules.map((capsule) => (
              <Card key={capsule.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">{capsule.name}</h4>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {capsule.openDate.toLocaleDateString("ja-JP")}に開封予定
                    </p>
                    <p className="text-xs text-gray-400">
                      {capsule.photoCount}枚の写真を保存
                    </p>
                  </div>
                  {capsule.isOpened && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      開封済み
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
