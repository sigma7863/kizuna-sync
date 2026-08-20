import { useRef, useState } from "react";
import { Mic, MicOff, CalendarPlus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { trpc } from "@/lib/trpc";
import { useI18n, type Language } from "@/contexts/I18nContext";
import { toast } from "sonner";

export type ScheduleAction = {
  type: "create_schedule" | "update_schedule" | "delete_schedule";
  eventId?: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
};

function toDateTimeLocalValue(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function FamilyAIAssistant({ familyGroupId }: { familyGroupId: number }) {
  const { language, t } = useI18n();
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingAction, setPendingAction] = useState<ScheduleAction | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const askMutation = trpc.assistant.ask.useMutation({
    onError: (error) => toast.error(error.message),
  });
  const transcribeMutation = trpc.voice.transcribeBase64.useMutation({
    onError: (error) => toast.error(error.message),
  });
  const utils = trpc.useUtils();
  const { data: scheduleEvents = [] } = trpc.assistant.schedule.useQuery(
    { familyGroupId },
    { enabled: !!familyGroupId, refetchInterval: 30_000 }
  );
  const confirmScheduleMutation = trpc.assistant.confirmSchedule.useMutation({
    onSuccess: () => {
      setPendingAction(null);
      setMessages((previous) => [...previous, { role: "assistant", content: t("family.scheduleAdded") }]);
      void utils.assistant.schedule.invalidate({ familyGroupId });
      toast.success(t("family.scheduleAdded"));
    },
    onError: (error) => toast.error(error.message),
  });

  const sendMessage = async (content: string) => {
    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    const result = await askMutation.mutateAsync({
      familyGroupId,
      message: content,
      language: language as Language,
    });
    const searchText = result.searchResults.length > 0
      ? `\n\n${result.searchResults.map((entry) => `• ${entry.content}`).join("\n")}`
      : "";
    setMessages((previous) => [...previous, { role: "assistant", content: `${result.message}${searchText}` }]);
    setPendingAction(result.action as ScheduleAction | null);
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error(t("family.voiceUnavailable"));
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    chunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstop = async () => {
      stream.getTracks().forEach((track) => track.stop());
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const audioData = await blobToDataUrl(blob);
      const result = await transcribeMutation.mutateAsync({
        audioData,
        mimeType: "audio/webm",
        language: language as Language,
      });
      if (result.text.trim()) await sendMessage(result.text.trim());
    };
    recorderRef.current = recorder;
    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setIsRecording(false);
  };

  return (
    <Card className="border-0 bg-white/90 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-gray-800">
          <Sparkles className="h-5 w-5 text-purple-500" />
          {t("family.assistant")}
          <Badge variant="secondary" className="ml-auto">{t("family.aiLabel")}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-indigo-900">{t("family.events")}</h3>
            <span className="text-xs text-indigo-600">{scheduleEvents.length}</span>
          </div>
          {scheduleEvents.length === 0 ? (
            <p className="text-sm text-gray-500">{t("family.noEvents")}</p>
          ) : (
            <div className="space-y-2">
              {scheduleEvents.slice(0, 6).map((event) => (
                <div key={event.id} className="rounded-lg bg-white p-3 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{event.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.startTime).toLocaleString()} – {new Date(event.endTime).toLocaleTimeString()}
                      </p>
                      {event.location && <p className="text-xs text-gray-500">{event.location}</p>}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setPendingAction({
                          type: "update_schedule",
                          eventId: event.id,
                          title: event.title,
                          description: event.description ?? "",
                          startTime: new Date(event.startTime).toISOString(),
                          endTime: new Date(event.endTime).toISOString(),
                          location: event.location ?? "",
                        })}
                      >
                        {t("family.edit")}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setPendingAction({
                          type: "delete_schedule",
                          eventId: event.id,
                          title: event.title,
                          description: event.description ?? "",
                          startTime: new Date(event.startTime).toISOString(),
                          endTime: new Date(event.endTime).toISOString(),
                          location: event.location ?? "",
                        })}
                      >
                        {t("family.delete")}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <AIChatBox
          messages={messages}
          onSendMessage={sendMessage}
          isLoading={askMutation.isPending || transcribeMutation.isPending}
          height="380px"
          placeholder={t("family.searchTimeline")}
          emptyStateMessage={t("family.assistant")}
          suggestedPrompts={[t("family.searchTimeline"), t("family.scheduleProposal")]}
        />
        <Button
          type="button"
          variant={isRecording ? "destructive" : "outline"}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={transcribeMutation.isPending || askMutation.isPending}
          className="w-full gap-2"
        >
          {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          {isRecording ? t("family.stopRecording") : t("family.voiceInput")}
        </Button>
        {pendingAction && (
          <div className="rounded-xl border border-purple-100 bg-purple-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-purple-900">
              <CalendarPlus className="h-4 w-4" />
              {t("family.confirmSchedule")}
            </div>
            {pendingAction.type !== "delete_schedule" ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="text-xs font-medium text-gray-700">
                  {t("family.eventTitle")}
                  <Input
                    value={pendingAction.title}
                    onChange={(event) => setPendingAction((current) => current ? { ...current, title: event.target.value } : current)}
                    className="mt-1 bg-white"
                  />
                </label>
                <label className="text-xs font-medium text-gray-700">
                  {t("family.eventLocation")}
                  <Input
                    value={pendingAction.location}
                    onChange={(event) => setPendingAction((current) => current ? { ...current, location: event.target.value } : current)}
                    className="mt-1 bg-white"
                  />
                </label>
                <label className="text-xs font-medium text-gray-700">
                  {t("family.eventStart")}
                  <Input
                    type="datetime-local"
                    value={toDateTimeLocalValue(pendingAction.startTime)}
                    onChange={(event) => setPendingAction((current) => current ? { ...current, startTime: new Date(event.target.value).toISOString() } : current)}
                    className="mt-1 bg-white"
                  />
                </label>
                <label className="text-xs font-medium text-gray-700">
                  {t("family.eventEnd")}
                  <Input
                    type="datetime-local"
                    value={toDateTimeLocalValue(pendingAction.endTime)}
                    onChange={(event) => setPendingAction((current) => current ? { ...current, endTime: new Date(event.target.value).toISOString() } : current)}
                    className="mt-1 bg-white"
                  />
                </label>
                <label className="text-xs font-medium text-gray-700 sm:col-span-2">
                  {t("family.eventDescription")}
                  <Textarea
                    value={pendingAction.description}
                    onChange={(event) => setPendingAction((current) => current ? { ...current, description: event.target.value } : current)}
                    className="mt-1 bg-white"
                    rows={2}
                  />
                </label>
              </div>
            ) : (
              <p className="font-medium text-gray-800">{pendingAction.title}</p>
            )}
            <div className="mt-3 flex gap-2">
              <Button
                onClick={() => confirmScheduleMutation.mutate({ familyGroupId, action: pendingAction })}
                disabled={confirmScheduleMutation.isPending}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {pendingAction.type === "create_schedule" ? t("common.confirm") : t("family.applyChange")}
              </Button>
              <Button variant="outline" onClick={() => setPendingAction(null)} className="flex-1">
                {t("common.cancel")}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
