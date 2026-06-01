import { useEffect, useRef, useState } from "react";
import { Mic, Square, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/**
 * 音声メッセージレコーダー
 * 家族間の音声メモ・メッセージ機能
 */
interface VoiceMessageRecorderProps {
  familyGroupId: number;
  onSend?: (audioBlob: Blob, duration: number) => Promise<void>;
}

export function VoiceMessageRecorder({
  familyGroupId,
  onSend,
}: VoiceMessageRecorderProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      // 録音時間をカウント
      durationIntervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Failed to start recording:", error);
      toast.error("マイクへのアクセスが拒否されました");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => {
        track.stop();
      });
      setIsRecording(false);

      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    }
  };

  const sendVoiceMessage = async () => {
    if (audioChunksRef.current.length === 0) {
      toast.error("音声が記録されていません");
      return;
    }

    setIsSending(true);
    try {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });

      if (onSend) {
        await onSend(audioBlob, duration);
      }

      // リセット
      audioChunksRef.current = [];
      setDuration(0);
      toast.success("音声メッセージを送信しました");
    } catch (error) {
      console.error("Failed to send voice message:", error);
      toast.error("音声メッセージの送信に失敗しました");
    } finally {
      setIsSending(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
      {!isRecording ? (
        <Button
          onClick={startRecording}
          variant="default"
          size="sm"
          className="gap-2"
        >
          <Mic className="w-4 h-4" />
          音声メッセージ
        </Button>
      ) : (
        <>
          <div className="flex-1 flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-red-600">
              {formatDuration(duration)}
            </span>
          </div>
          <Button
            onClick={stopRecording}
            variant="destructive"
            size="sm"
            className="gap-2"
          >
            <Square className="w-4 h-4" />
            停止
          </Button>
        </>
      )}

      {!isRecording && audioChunksRef.current.length > 0 && (
        <Button
          onClick={sendVoiceMessage}
          disabled={isSending}
          size="sm"
          className="gap-2"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          送信
        </Button>
      )}
    </div>
  );
}
