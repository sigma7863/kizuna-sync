import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Copy, Share2, Mail, Link as LinkIcon, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function InviteMembers() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const familyGroupId = parseInt(params?.id || "0");

  const [invitedEmail, setInvitedEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<"guardian" | "child" | "elderly">("child");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [invitationLink, setInvitationLink] = useState<string | null>(null);

  // Queries
  const { data: familyGroup } = trpc.family.getById.useQuery(
    { id: familyGroupId },
    { enabled: !!familyGroupId }
  );

  // Mutations
  const createInvitationMutation = trpc.family.createInvitation.useMutation({
    onSuccess: (data) => {
      const link = `${window.location.origin}/join/${data.invitationCode}`;
      setGeneratedCode(data.invitationCode);
      setInvitationLink(link);
      setInvitedEmail("");
      toast.success("招待コードを生成しました！");
    },
    onError: (error) => {
      toast.error("招待コードの生成に失敗しました");
    },
  });

  const handleCreateInvitation = async () => {
    if (!selectedRole) return;

    await createInvitationMutation.mutateAsync({
      familyGroupId,
      suggestedRole: selectedRole,
      invitedEmail: invitedEmail || undefined,
    });
  };

  const handleCopyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      toast.success("招待コードをコピーしました");
    }
  };

  const handleCopyLink = () => {
    if (invitationLink) {
      navigator.clipboard.writeText(invitationLink);
      toast.success("招待リンクをコピーしました");
    }
  };

  const handleShareLink = async () => {
    if (invitationLink && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title: `${familyGroup?.name}に招待されました`,
          text: "KizunaSyncで家族と繋がりましょう！",
          url: invitationLink,
        });
      } catch (error) {
        console.error("Share failed:", error);
      }
    }
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
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation(`/family/${familyGroupId}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            戻る
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">メンバーを招待</h1>
            <p className="text-sm text-gray-500">{familyGroup?.name}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Invitation Creation */}
        <Card className="p-8 bg-white border-0 shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-pink-500" />
            新しいメンバーを招待
          </h2>

          <div className="space-y-6">
            {/* Role Selection */}
            <div>
              <Label htmlFor="role">メンバーのロール</Label>
              <Select value={selectedRole} onValueChange={(value: any) => setSelectedRole(value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guardian">
                    <span className="font-semibold">保護者</span>
                    <span className="text-xs text-gray-500 ml-2">（管理・見守り機能有効）</span>
                  </SelectItem>
                  <SelectItem value="child">
                    <span className="font-semibold">子供</span>
                    <span className="text-xs text-gray-500 ml-2">（シンプルUI）</span>
                  </SelectItem>
                  <SelectItem value="elderly">
                    <span className="font-semibold">高齢者</span>
                    <span className="text-xs text-gray-500 ml-2">（大きなボタン・高コントラスト）</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Email (Optional) */}
            <div>
              <Label htmlFor="email">メールアドレス（オプション）</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={invitedEmail}
                onChange={(e) => setInvitedEmail(e.target.value)}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-2">
                メールアドレスを入力すると、招待リンクをメール送信できます
              </p>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleCreateInvitation}
              disabled={createInvitationMutation.isPending}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold py-3"
            >
              {createInvitationMutation.isPending ? "生成中..." : "招待コードを生成"}
            </Button>
          </div>
        </Card>

        {/* Generated Invitation */}
        {generatedCode && invitationLink && (
          <Card className="p-8 bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200 shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">招待コードが生成されました！</h3>

            <div className="space-y-6">
              {/* Invitation Code */}
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 mb-2">招待コード</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-lg font-mono font-bold text-gray-800 break-all">
                    {generatedCode}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyCode}
                    className="flex-shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Invitation Link */}
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 mb-2">招待リンク</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={invitationLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 bg-gray-50"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    className="flex-shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Share Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(navigator as any).share && (
                  <Button
                    onClick={handleShareLink}
                    className="bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    シェア
                  </Button>
                )}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2">
                      <Mail className="w-4 h-4" />
                      メール送信
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>招待メールを送信</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        以下のテンプレートを使用してメールを送信してください:
                      </p>
                      <div className="p-4 bg-gray-100 rounded-lg text-sm">
                        <p className="font-semibold mb-2">件名: {familyGroup?.name}への招待</p>
                        <p className="whitespace-pre-wrap text-gray-700">
                          {`こんにちは！

${familyGroup?.name}でKizunaSyncを使い始めました。
ぜひあなたも参加して、家族と繋がりましょう！

招待コード: ${generatedCode}

または以下のリンクから参加できます:
${invitationLink}

KizunaSyncは、家族全員がスマホで繋がり、
日常の小さな行動や気持ちをリアルタイムで共有・見守り合えるアプリです。

よろしくお願いします！`}
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          const subject = `${familyGroup?.name}への招待`;
                          const body = `こんにちは！\n\n${familyGroup?.name}でKizunaSyncを使い始めました。\nぜひあなたも参加して、家族と繋がりましょう！\n\n招待コード: ${generatedCode}\n\nまたは以下のリンクから参加できます:\n${invitationLink}`;
                          window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        }}
                        className="w-full bg-green-500 hover:bg-green-600 text-white"
                      >
                        メールクライアントで開く
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Instructions */}
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-sm font-semibold text-gray-800 mb-3">参加方法:</p>
                <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                  <li>招待リンクをクリックまたは招待コードをコピー</li>
                  <li>KizunaSyncアプリで「招待コードで参加」を選択</li>
                  <li>コードを入力して参加完了！</li>
                </ol>
              </div>
            </div>
          </Card>
        )}

        {/* Info Card */}
        <Card className="p-6 bg-blue-50 border-2 border-blue-200 mt-8">
          <h3 className="font-semibold text-blue-900 mb-3">💡 ヒント</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• 複数のメンバーを招待する場合は、各メンバーごとに招待コードを生成してください</li>
            <li>• 招待コードは7日間有効です</li>
            <li>• ロールは後で変更することができます</li>
            <li>• 招待されたメンバーは、参加時にロールを確認できます</li>
          </ul>
        </Card>
      </main>
    </div>
  );
}
