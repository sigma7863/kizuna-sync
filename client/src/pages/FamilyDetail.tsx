import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Heart, ArrowLeft, Plus, Users, MessageSquare, Camera, Music, MapPin, Smile, Sparkles, Share2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { KizunaRipple } from "@/components/KizunaRipple";
import { SafetyGuardian } from "@/components/SafetyGuardian";
import { AIFeatures } from "@/components/AIFeatures";
import { FamilyStatsDashboard } from "@/components/FamilyStatsDashboard";

export default function FamilyDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const familyGroupId = parseInt(params?.id || "0");

  const [moodText, setMoodText] = useState("");
  const [rippleNotifications, setRippleNotifications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"timeline" | "safety" | "ai" | "stats">("timeline");

  // Queries
  const { data: familyGroup } = trpc.family.getById.useQuery(
    { id: familyGroupId },
    { enabled: !!familyGroupId }
  );

  const { data: members } = trpc.family.getMembers.useQuery(
    { familyGroupId },
    { enabled: !!familyGroupId }
  );

  const { data: timeline, isLoading: timelineLoading } = trpc.timeline.getFamilyTimeline.useQuery(
    { familyGroupId, limit: 50 },
    { enabled: !!familyGroupId, refetchInterval: 5000 }
  );

  // Mutations
  const createTimelineEntryMutation = trpc.timeline.createEntry.useMutation({
    onSuccess: () => {
      setMoodText("");
      trpc.useUtils().timeline.getFamilyTimeline.invalidate({ familyGroupId });
    },
  });

  const logActivityMutation = trpc.activity.logActivity.useMutation({
    onSuccess: () => {
      trpc.useUtils().timeline.getFamilyTimeline.invalidate({ familyGroupId });
    },
  });

  const handlePostMood = async () => {
    if (moodText.trim()) {
      await createTimelineEntryMutation.mutateAsync({
        familyGroupId,
        entryType: "mood",
        content: moodText,
      });
    }
  };

  const handleLogActivity = async (activityType: string) => {
    await logActivityMutation.mutateAsync({
      familyGroupId,
      activityType: activityType as any,
    });

    // 波紋通知を追加
    setRippleNotifications((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        type: activityType,
        userName: user?.name || "Unknown",
        timestamp: new Date(),
      },
    ]);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "mood":
        return <Smile className="w-5 h-5" />;
      case "photo":
        return <Camera className="w-5 h-5" />;
      case "music":
        return <Music className="w-5 h-5" />;
      case "message":
        return <MessageSquare className="w-5 h-5" />;
      case "location":
        return <MapPin className="w-5 h-5" />;
      default:
        return <Heart className="w-5 h-5" />;
    }
  };

  const getActivityLabel = (type: string) => {
    const labels: Record<string, string> = {
      mood: "気持ち",
      photo: "写真",
      music: "音楽",
      message: "メッセージ",
      location: "位置情報",
      activity: "アクティビティ",
    };
    return labels[type] || type;
  };

  if (!familyGroupId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">グループが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                戻る
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{familyGroup?.name}</h1>
                <p className="text-sm text-gray-500">
                  {members?.length || 0}人のメンバー
                </p>
              </div>
            </div>
            <Button
              onClick={() => setLocation(`/family/${familyGroupId}/invite`)}
              className="bg-pink-500 hover:bg-pink-600 text-white flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              メンバーを招待
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4 border-2 border-pink-200 hover:bg-pink-50"
            onClick={() => handleLogActivity("mood")}
          >
            <Smile className="w-6 h-6 text-pink-500" />
            <span className="text-xs text-center">気持ち</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4 border-2 border-blue-200 hover:bg-blue-50"
            onClick={() => handleLogActivity("photo")}
          >
            <Camera className="w-6 h-6 text-blue-500" />
            <span className="text-xs text-center">写真</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4 border-2 border-purple-200 hover:bg-purple-50"
            onClick={() => handleLogActivity("music")}
          >
            <Music className="w-6 h-6 text-purple-500" />
            <span className="text-xs text-center">音楽</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4 border-2 border-green-200 hover:bg-green-50"
            onClick={() => handleLogActivity("location")}
          >
            <MapPin className="w-6 h-6 text-green-500" />
            <span className="text-xs text-center">位置情報</span>
          </Button>
        </div>

        {/* Post Section */}
        <Card className="p-6 mb-8 bg-white border-0 shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">今の気持ちをシェア</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="mood">気持ち・状況</Label>
              <Textarea
                id="mood"
                placeholder="例：今日は楽しかった！ 😊"
                value={moodText}
                onChange={(e) => setMoodText(e.target.value)}
                className="mt-2 resize-none"
                rows={3}
              />
            </div>
            <Button
              onClick={handlePostMood}
              disabled={!moodText.trim() || createTimelineEntryMutation.isPending}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white"
            >
              {createTimelineEntryMutation.isPending ? "投稿中..." : "投稿"}
            </Button>
          </div>
        </Card>

        {/* Members Section */}
        {members && members.length > 0 && (
          <Card className="p-6 mb-8 bg-white border-0 shadow-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              家族メンバー
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {members.map((member) => (
                <div key={member.family_members.id} className="text-center p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">
                    {member.users.name?.charAt(0) || "?"}
                  </div>
                  <p className="font-semibold text-gray-800 text-sm">{member.users.name}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {member.family_members.memberRole === "guardian" && "保護者"}
                    {member.family_members.memberRole === "child" && "子供"}
                    {member.family_members.memberRole === "elderly" && "高齢者"}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab("timeline")}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "timeline"
                ? "border-pink-500 text-pink-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            <Heart className="w-4 h-4 inline mr-2" />
            タイムライン
          </button>
          <button
            onClick={() => setActiveTab("safety")}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "safety"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            <MapPin className="w-4 h-4 inline mr-2" />
            見守り
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "ai"
                ? "border-yellow-500 text-yellow-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            AI提案
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "stats"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            <Share2 className="w-4 h-4 inline mr-2" />
            統計
          </button>
        </div>

        {/* Timeline Section */}
        {activeTab === "timeline" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              家族タイムライン
            </h2>

            {timelineLoading ? (
              <Card className="p-8 text-center bg-white border-0 shadow-md">
                <p className="text-gray-600">読み込み中...</p>
              </Card>
            ) : timeline && timeline.length > 0 ? (
              timeline.map((entry) => (
                <Card key={entry.id} className="p-6 bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white flex-shrink-0">
                      {getActivityIcon(entry.entryType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-800">
                          {getActivityLabel(entry.entryType)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(entry.createdAt).toLocaleTimeString('ja-JP', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      {entry.content && (
                        <p className="text-gray-700 text-sm leading-relaxed">{entry.content}</p>
                      )}
                      {entry.imageUrl && (
                        <img
                          src={entry.imageUrl}
                          alt="Timeline entry"
                          className="mt-3 rounded-lg max-w-xs max-h-48 object-cover"
                        />
                      )}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-8 text-center bg-white border-0 shadow-md">
                <Heart className="w-12 h-12 text-pink-200 mx-auto mb-4" />
                <p className="text-gray-600">
                  まだタイムラインに投稿がありません
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  家族の気持ちや行動をシェアして、絆を深めましょう
                </p>
              </Card>
            )}
          </div>
        )}

        {/* Safety Guardian Section */}
        {activeTab === "safety" && (
          <SafetyGuardian
            familyGroupId={familyGroupId}
            memberLocations={[]}
          />
        )}

        {/* AI Features Section */}
        {activeTab === "ai" && (
          <AIFeatures
            familyGroupId={familyGroupId}
            familyMembers={members?.map((m) => ({
              id: m.users.id,
              name: m.users.name || "Unknown",
            })) || []}
          />
        )}

        {/* Statistics Dashboard Section */}
        {activeTab === "stats" && (
          <FamilyStatsDashboard familyGroupId={familyGroupId} />
        )}
      </main>

      {/* 絆の波紋通知 */}
      <KizunaRipple
        notifications={rippleNotifications}
        onNotificationDismiss={(id) => {
          setRippleNotifications((prev) => prev.filter((n) => n.id !== id));
        }}
      />
    </div>
  );
}
