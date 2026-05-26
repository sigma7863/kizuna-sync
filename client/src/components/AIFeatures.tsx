import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Camera, Lightbulb, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface AIFeaturesProps {
  familyGroupId: number;
  familyMembers: Array<{ id: number; name: string }>;
}

/**
 * AI機能コンポーネント
 * - 共創フォトジャーナル: 家族が撮影した写真をAIが自動で「家族の物語」として編集・共有
 * - 家族会議AI: 家族全員の予定・好みをもとに、AIが夕食やお出かけ先などの最適な提案を生成
 */
export function AIFeatures({ familyGroupId, familyMembers }: AIFeaturesProps) {
  const [photoJournalTitle, setPhotoJournalTitle] = useState("");
  const [photoJournalCount, setPhotoJournalCount] = useState(1);
  const [familyPreferences, setFamilyPreferences] = useState("");
  const [isGeneratingJournal, setIsGeneratingJournal] = useState(false);
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);
  const [generatedJournal, setGeneratedJournal] = useState<{
    title: string;
    story: string;
  } | null>(null);
  const [generatedProposal, setGeneratedProposal] = useState<string | null>(null);

  const generatePhotoJournal = async () => {
    if (!photoJournalTitle || photoJournalCount <= 0) {
      toast.error("タイトルと写真枚数を入力してください");
      return;
    }

    setIsGeneratingJournal(true);
    try {
      const result = await trpc.ai.generatePhotoJournal.useMutation().mutateAsync({
        title: photoJournalTitle,
        description: "家族の思い出の写真",
        photoCount: photoJournalCount,
      });

      setGeneratedJournal({
        title: photoJournalTitle,
        story: result.story,
      });
      toast.success("物語を生成しました！");
    } catch (error) {
      console.error("Error generating photo journal:", error);
      toast.error("物語の生成に失敗しました");
    } finally {
      setIsGeneratingJournal(false);
    }
  };

  const generateFamilyProposal = async () => {
    if (!familyPreferences.trim()) {
      toast.error("家族の好みを入力してください");
      return;
    }

    setIsGeneratingProposal(true);
    try {
      const result = await trpc.ai.generateFamilyProposal.useMutation().mutateAsync({
        familyName: "我が家",
        preferences: familyPreferences,
        memberCount: familyMembers.length,
        roles: familyMembers.map((m) => m.name),
      });

      setGeneratedProposal(result.proposal);
      toast.success("提案を生成しました！");
    } catch (error) {
      console.error("Error generating family proposal:", error);
      toast.error("提案の生成に失敗しました");
    } finally {
      setIsGeneratingProposal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 共創フォトジャーナル */}
      <Card className="p-6 bg-white border-0 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-500" />
            共創フォトジャーナル
          </h3>
          <Sparkles className="w-5 h-5 text-yellow-500" />
        </div>

        <p className="text-sm text-gray-600 mb-4">
          家族が撮影した写真をAIが自動で「家族の物語」として編集・共有します。
        </p>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white mb-4">
              <Camera className="w-4 h-4 mr-2" />
              フォトジャーナルを作成
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>フォトジャーナルを作成</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="journal-title">タイトル</Label>
                <Input
                  id="journal-title"
                  placeholder="例：春のお花見"
                  value={photoJournalTitle}
                  onChange={(e) => setPhotoJournalTitle(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="photo-count">写真枚数</Label>
                <Input
                  id="photo-count"
                  type="number"
                  min="1"
                  max="100"
                  value={photoJournalCount}
                  onChange={(e) => setPhotoJournalCount(parseInt(e.target.value) || 1)}
                  className="mt-2"
                />
              </div>
              <Button
                onClick={generatePhotoJournal}
                disabled={isGeneratingJournal || !photoJournalTitle}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                {isGeneratingJournal ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    AIで物語を生成
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {generatedJournal && (
          <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-gray-800 mb-2">{generatedJournal.title}</h4>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {generatedJournal.story}
            </p>
          </div>
        )}
      </Card>

      {/* 家族会議AI */}
      <Card className="p-6 bg-white border-0 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            家族会議AI
          </h3>
          <Sparkles className="w-5 h-5 text-yellow-500" />
        </div>

        <p className="text-sm text-gray-600 mb-4">
          家族全員の予定・好みをもとに、AIが夕食やお出かけ先などの最適な提案を生成します。
        </p>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white mb-4">
              <Lightbulb className="w-4 h-4 mr-2" />
              提案を生成
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>家族の好みを入力</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="preferences">
                  家族の好み・予定（例：月曜は忙しい、子供がカレー好き、など）
                </Label>
                <Textarea
                  id="preferences"
                  placeholder="家族の好みや予定を入力してください"
                  value={familyPreferences}
                  onChange={(e) => setFamilyPreferences(e.target.value)}
                  className="mt-2 resize-none"
                  rows={4}
                />
              </div>
              <Button
                onClick={generateFamilyProposal}
                disabled={isGeneratingProposal || !familyPreferences.trim()}
                className="w-full bg-yellow-500 hover:bg-yellow-600"
              >
                {isGeneratingProposal ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    AIで提案を生成
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {generatedProposal && (
          <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {generatedProposal}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

export default AIFeatures;
