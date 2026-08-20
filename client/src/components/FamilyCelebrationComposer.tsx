import { useState } from "react";
import { PartyPopper, Send, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/contexts/I18nContext";
import { toast } from "sonner";

type Occasion = "birthday" | "achievement" | "welcome" | "thanks" | "encouragement" | "general";

const OCCASION_STAMPS: Record<Occasion, string> = {
  birthday: "🎂",
  achievement: "🏆",
  welcome: "🌸",
  thanks: "💐",
  encouragement: "🌟",
  general: "🎉",
};

export function FamilyCelebrationComposer({ familyGroupId }: { familyGroupId: number }) {
  const { t } = useI18n();
  const [message, setMessage] = useState("");
  const [occasion, setOccasion] = useState<Occasion>("general");
  const [lastStamp, setLastStamp] = useState<string | null>(null);
  const sendMutation = trpc.celebration.send.useMutation({
    onSuccess: (result) => {
      setMessage("");
      setLastStamp(result.metadata.stamp);
      toast.success(t("family.celebrationSuccess"));
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-pink-50 via-white to-amber-50 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-gray-800">
          <PartyPopper className="h-5 w-5 text-pink-500" />
          {t("family.celebration")}
          <Badge variant="secondary" className="ml-auto">{t("family.celebrationBadge")}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {(Object.entries(OCCASION_STAMPS) as Array<[Occasion, string]>).map(([value, stamp]) => (
            <button
              key={value}
              type="button"
              aria-label={`${t("family.celebrationBadge")} ${stamp}`}
              onClick={() => setOccasion(value)}
              className={`rounded-xl border p-3 text-2xl transition ${occasion === value ? "border-pink-400 bg-pink-100 shadow-sm" : "border-white bg-white/80 hover:bg-white"}`}
            >
              {stamp}
            </button>
          ))}
        </div>
        <Textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={t("family.celebrationPlaceholder")}
          rows={3}
          maxLength={1000}
          className="resize-none bg-white/90"
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-gray-500">{t("family.celebrationBadge")}: {OCCASION_STAMPS[occasion]}</p>
          <Button
            type="button"
            onClick={() => sendMutation.mutate({ familyGroupId, message, occasion })}
            disabled={!message.trim() || sendMutation.isPending}
            className="gap-2 bg-gradient-to-r from-pink-500 to-amber-500 text-white"
          >
            {sendMutation.isPending ? <Sparkles className="h-4 w-4 animate-pulse" /> : <Send className="h-4 w-4" />}
            {t("family.celebrationSend")}
          </Button>
        </div>
        {lastStamp ? (
          <div className="flex items-center justify-center rounded-2xl border border-pink-100 bg-white/80 py-4 text-5xl animate-in zoom-in duration-300" aria-live="polite">
            {lastStamp}
          </div>
        ) : (
          <p className="text-center text-sm text-gray-500">{t("family.celebrationEmpty")}</p>
        )}
      </CardContent>
    </Card>
  );
}
