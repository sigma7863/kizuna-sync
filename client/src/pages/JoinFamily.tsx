import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function JoinFamily() {
  const params = useParams<{ code: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const invitationCode = params?.code || "";

  const [manualCode, setManualCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  // Mutations
  const joinMutation = trpc.family.joinByInvitation.useMutation({
    onSuccess: () => {
      toast.success("家族グループに参加しました！");
      setLocation("/");
    },
    onError: (error) => {
      toast.error(error.message || "参加に失敗しました");
    },
  });

  const handleJoin = async (code: string) => {
    if (!code.trim()) {
      toast.error("招待コードを入力してください");
      return;
    }

    setIsJoining(true);
    try {
      await joinMutation.mutateAsync({ invitationCode: code });
    } finally {
      setIsJoining(false);
    }
  };

  // Auto-join if code is in URL
  useEffect(() => {
    if (invitationCode && user) {
      handleJoin(invitationCode);
    }
  }, [invitationCode, user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            戻る
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">家族グループに参加</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Welcome Card */}
          <Card className="p-8 bg-white border-0 shadow-md mb-6">
            <div className="text-center mb-6">
              <Heart className="w-12 h-12 text-pink-500 mx-auto mb-4 animate-pulse" />
              <h2 className="text-2xl font-bold text-gray-800">家族と繋がろう</h2>
              <p className="text-gray-600 mt-2">
                招待コードを入力して、家族グループに参加しましょう
              </p>
            </div>

            {/* Invitation Code Input */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="code">招待コード</Label>
                <Input
                  id="code"
                  placeholder="招待コードを入力"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  className="mt-2 font-mono text-center text-lg tracking-widest"
                  disabled={isJoining || joinMutation.isPending}
                />
                <p className="text-xs text-gray-500 mt-2">
                  招待者から受け取ったコードを入力してください
                </p>
              </div>

              {/* Join Button */}
              <Button
                onClick={() => handleJoin(manualCode)}
                disabled={isJoining || joinMutation.isPending || !manualCode.trim()}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold py-3"
              >
                {isJoining || joinMutation.isPending ? "参加中..." : "参加する"}
              </Button>
            </div>
          </Card>

          {/* Info Card */}
          <Card className="p-6 bg-blue-50 border-2 border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              参加について
            </h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• 招待コードは招待者から受け取ります</li>
              <li>• 招待コードは7日間有効です</li>
              <li>• 参加後、家族のタイムラインやメンバーが見えるようになります</li>
              <li>• ロール（保護者・子供・高齢者）は招待時に設定されます</li>
            </ul>
          </Card>

          {/* Already Member Card */}
          <Card className="p-6 bg-gray-50 border border-gray-200 mt-6">
            <p className="text-sm text-gray-700">
              既に家族グループに参加していますか？
              <Button
                variant="link"
                onClick={() => setLocation("/")}
                className="text-pink-600 hover:text-pink-700 p-0 ml-1"
              >
                ホームに戻る
              </Button>
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
