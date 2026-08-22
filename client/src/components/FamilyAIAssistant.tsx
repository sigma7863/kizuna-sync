import { useRef, useState } from "react";
import { Mic, MicOff, CalendarPlus, Sparkles, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { trpc } from "@/lib/trpc";
import { useI18n, type Language } from "@/contexts/I18nContext";
import { getVoiceInputErrorKind, normalizeSpeechRate, speechLanguageFor, type VoiceInputErrorKind, type VoiceTurnStatus } from "@/lib/voiceConversation";
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
  const [voiceTurnStatus, setVoiceTurnStatus] = useState<VoiceTurnStatus>("ready");
  const [speechRate, setSpeechRate] = useState(1);
  const [voiceInputError, setVoiceInputError] = useState<VoiceInputErrorKind | null>(null);
  const [pendingTranscription, setPendingTranscription] = useState("");
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

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLanguageFor(language);
    utterance.rate = normalizeSpeechRate(speechRate);
    utterance.onstart = () => setVoiceTurnStatus("speaking");
    utterance.onend = () => setVoiceTurnStatus("ready");
    utterance.onerror = () => setVoiceTurnStatus("ready");
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setVoiceTurnStatus("ready");
  };

  const sendMessage = async (content: string) => {
    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    setVoiceTurnStatus("thinking");
    try {
      const result = await askMutation.mutateAsync({
        familyGroupId,
        message: content,
        language: language as Language,
      });
      const searchText = result.searchResults.length > 0
        ? `\n\n${result.searchResults.map((entry) => `• ${entry.content}`).join("\n")}`
        : "";
      const fullText = `${result.message}${searchText}`;
      setMessages((previous) => [...previous, { role: "assistant", content: fullText }]);
      setPendingAction(result.action as ScheduleAction | null);
      if (fullText) speakText(fullText);
      else setVoiceTurnStatus("ready");
    } catch {
      setVoiceTurnStatus("ready");
    }
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setVoiceInputError("unavailable");
      toast.error(t("family.voiceUnavailable"));
      return;
    }
    try {
      stopSpeaking();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      setVoiceInputError(null);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size === 0) {
          setVoiceInputError("recording");
          setVoiceTurnStatus("ready");
          return;
        }
        setVoiceTurnStatus("transcribing");
        try {
          const audioData = await blobToDataUrl(blob);
          const result = await transcribeMutation.mutateAsync({
            audioData,
            mimeType: "audio/webm",
            language: language as Language,
          });
          const transcript = result.text.trim();
          if (transcript) setPendingTranscription(transcript);
          else setVoiceInputError("emptyTranscript");
        } catch {
          setVoiceInputError("recording");
        } finally {
          setVoiceTurnStatus("ready");
        }
      };
      recorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setVoiceTurnStatus("listening");
    } catch (error) {
      setVoiceInputError(getVoiceInputErrorKind(error));
      setVoiceTurnStatus("ready");
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setIsRecording(false);
  };

  const voiceStatusLabel = {
    ready: "タップして話しかける",
    listening: "聞いています…",
    transcribing: "音声を文字にしています…",
    thinking: "家族AIが考えています…",
    speaking: "AIが読み上げています…",
  }[voiceTurnStatus];
  const voiceInputErrorLabel = voiceInputError ? {
    unavailable: t("family.voiceUnavailable"),
    permission: t("family.voicePermissionDenied"),
    missingDevice: t("family.voiceDeviceMissing"),
    recording: t("family.voiceRecordingFailed"),
    emptyTranscript: t("family.voiceTranscriptEmpty"),
  }[voiceInputError] : null;

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
        <div className="flex items-center gap-2 rounded-xl border border-violet-100 bg-violet-50/70 px-3 py-2 text-xs text-violet-800">
          <span className={`h-2 w-2 rounded-full ${voiceTurnStatus === "ready" ? "bg-violet-300" : "bg-violet-500 animate-pulse"}`} />
          <span className="font-medium">音声対話</span>
          <span className="ml-auto">{voiceStatusLabel}</span>
        </div>
        {voiceInputErrorLabel && <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950" role="alert"><p className="font-semibold">{voiceInputErrorLabel}</p><p className="mt-1 text-xs leading-relaxed">{t("family.voiceRecoveryHint")}</p></div>}
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
        <div className="rounded-lg border border-purple-100 bg-purple-50/60 px-3 py-2 text-xs text-purple-800">
          {t("family.voiceCommandExamples")}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 rounded-xl bg-slate-50 px-2 py-2">
          <label className="text-xs font-medium text-slate-700" htmlFor="assistant-speech-rate">{t("family.voiceRate")}</label>
          <select id="assistant-speech-rate" value={speechRate} onChange={(event) => setSpeechRate(normalizeSpeechRate(Number(event.target.value)))} className="h-9 rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-900">
            <option value="0.8">{t("family.voiceRateSlow")}</option>
            <option value="1">{t("family.voiceRateStandard")}</option>
            <option value="1.2">{t("family.voiceRateFast")}</option>
          </select>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              const lastAssistantMsg = messages.slice().reverse().find((m) => m.role === "assistant");
              if (lastAssistantMsg) speakText(lastAssistantMsg.content);
            }}
            className="gap-1.5 text-xs text-purple-700 hover:bg-purple-100"
          >
            <Volume2 className="h-4 w-4" />
            {t("family.ttsReadAloud")}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={stopSpeaking} disabled={voiceTurnStatus !== "speaking"} className="gap-1.5 text-xs">
            <VolumeX className="h-4 w-4" />{t("family.voiceStopSpeech")}
          </Button>
        </div>
        <AIChatBox
          messages={messages}
          onSendMessage={sendMessage}
          isLoading={askMutation.isPending || transcribeMutation.isPending}
          height="340px"
          placeholder={t("family.searchTimeline")}
          emptyStateMessage={t("family.assistant")}
          suggestedPrompts={[
            t("family.searchTimeline"),
            t("family.scheduleProposal"),
            t("family.voiceCommandSchedule"),
            t("family.voiceCommandPhotos"),
            t("family.voiceCommandTasks"),
          ]}
        />
        <Button
          type="button"
          variant={isRecording ? "destructive" : "outline"}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={transcribeMutation.isPending || askMutation.isPending}
          className="w-full gap-2"
        >
          {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          {isRecording ? t("family.stopRecording") : t("family.voiceCommandStart")}
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
        <Dialog open={Boolean(pendingTranscription)} onOpenChange={(open) => !open && setPendingTranscription("")}>
          <DialogContent aria-describedby="voice-transcript-review-description">
            <DialogHeader><DialogTitle>{t("family.voiceReviewTitle")}</DialogTitle><DialogDescription id="voice-transcript-review-description">{t("family.voiceReviewDescription")}</DialogDescription></DialogHeader>
            <Textarea value={pendingTranscription} onChange={(event) => setPendingTranscription(event.target.value)} rows={6} className="resize-none" aria-label={t("family.voiceReviewTitle")} />
            <DialogFooter><Button type="button" variant="outline" onClick={() => setPendingTranscription("")}>{t("common.cancel")}</Button><Button type="button" disabled={!pendingTranscription.trim() || askMutation.isPending} onClick={() => { const transcript = pendingTranscription.trim(); setPendingTranscription(""); void sendMessage(transcript); }} className="bg-purple-700 text-white hover:bg-purple-800">{t("family.voiceReviewConfirm")}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
