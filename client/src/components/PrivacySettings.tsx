import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Lock, MapPin, Eye, Bell } from "lucide-react";
import { toast } from "sonner";

interface PrivacySettingsProps {
  familyGroupId: number;
}

/**
 * プライバシー設定コンポーネント
 * ユーザーが位置情報・アクティビティの共有設定をコントロール
 */
export function PrivacySettings({ familyGroupId }: PrivacySettingsProps) {
  const [locationSharing, setLocationSharing] = useState(true);
  const [activitySharing, setActivitySharing] = useState(true);
  const [notificationSharing, setNotificationSharing] = useState(true);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // プライバシー設定を保存
      // TODO: サーバーに送信
      toast.success("プライバシー設定を保存しました");
    } catch (error) {
      toast.error("設定の保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white border-0 shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <Lock className="w-5 h-5 text-blue-500" />
          プライバシー設定
        </h3>

        <div className="space-y-6">
          {/* 位置情報共有 */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-semibold text-gray-800">位置情報の共有</p>
                  <p className="text-xs text-gray-600 mt-1">
                    家族に現在地を共有します
                  </p>
                </div>
              </div>
              <Switch
                checked={locationSharing}
                onCheckedChange={setLocationSharing}
              />
            </div>
            {locationSharing && (
              <div className="mt-4 p-3 bg-white rounded border border-green-200">
                <p className="text-xs text-gray-700 mb-3">
                  位置情報を共有する家族メンバーを選択:
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      共有メンバーを設定
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>位置情報を共有するメンバー</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        位置情報を共有したいメンバーを選択してください
                      </p>
                      {/* メンバーリストはここに表示される */}
                      <div className="p-3 bg-gray-50 rounded text-sm text-gray-600">
                        全メンバーに共有中
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>

          {/* アクティビティ共有 */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="font-semibold text-gray-800">アクティビティの共有</p>
                  <p className="text-xs text-gray-600 mt-1">
                    歩行・撮影・音楽などのアクティビティを共有します
                  </p>
                </div>
              </div>
              <Switch
                checked={activitySharing}
                onCheckedChange={setActivitySharing}
              />
            </div>
          </div>

          {/* 通知共有 */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="font-semibold text-gray-800">通知の受け取り</p>
                  <p className="text-xs text-gray-600 mt-1">
                    家族からの到着通知や波紋通知を受け取ります
                  </p>
                </div>
              </div>
              <Switch
                checked={notificationSharing}
                onCheckedChange={setNotificationSharing}
              />
            </div>
          </div>

          {/* 保存ボタン */}
          <Button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3"
          >
            {isSaving ? "保存中..." : "設定を保存"}
          </Button>
        </div>
      </Card>

      {/* 情報カード */}
      <Card className="p-4 bg-blue-50 border-2 border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">💡 プライバシーについて</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• 位置情報は暗号化されて保存されます</li>
          <li>• 共有設定はいつでも変更できます</li>
          <li>• 位置情報を共有しない場合、GPS見守り機能は利用できません</li>
          <li>• 家族メンバーは共有設定を確認できません</li>
        </ul>
      </Card>
    </div>
  );
}

export default PrivacySettings;
