import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Share2 } from "lucide-react";

interface Participant {
  id: number;
  name: string;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isSpeaking: boolean;
}

export default function VideoCallWidget() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [participants, setParticipants] = useState<Participant[]>([
    { id: 1, name: "父", isVideoEnabled: true, isAudioEnabled: true, isSpeaking: false },
    { id: 2, name: "母", isVideoEnabled: true, isAudioEnabled: true, isSpeaking: true },
  ]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isCallActive) {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCallActive]);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartCall = () => {
    setIsCallActive(true);
    setCallDuration(0);
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setCallDuration(0);
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
  };

  if (!isCallActive) {
    return (
      <Card className="p-6 text-center">
        <Video className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="font-semibold mb-2">ビデオ通話</h3>
        <p className="text-sm text-gray-600 mb-4">
          家族とリアルタイムでビデオ通話ができます
        </p>
        <Button
          onClick={handleStartCall}
          className="bg-blue-500 hover:bg-blue-600 w-full"
        >
          <Video className="w-4 h-4 mr-2" />
          通話を開始
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* 通話時間表示 */}
      <div className="text-center p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-600">通話時間</p>
        <p className="text-2xl font-bold text-blue-600">
          {formatDuration(callDuration)}
        </p>
      </div>

      {/* 参加者グリッド */}
      <div className="grid grid-cols-2 gap-3">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className={`relative bg-gray-900 rounded-lg overflow-hidden aspect-video flex items-center justify-center ${
              participant.isSpeaking ? "ring-2 ring-green-500" : ""
            }`}
          >
            {participant.isVideoEnabled ? (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <span className="text-white font-semibold">{participant.name}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <VideoOff className="w-8 h-8 text-gray-500 mb-2" />
                <span className="text-gray-400 text-sm">{participant.name}</span>
              </div>
            )}

            {/* ステータスインジケーター */}
            <div className="absolute top-2 right-2 flex gap-1">
              {!participant.isVideoEnabled && (
                <VideoOff className="w-4 h-4 text-red-500 bg-black bg-opacity-50 rounded p-1" />
              )}
              {!participant.isAudioEnabled && (
                <MicOff className="w-4 h-4 text-red-500 bg-black bg-opacity-50 rounded p-1" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* コントロールバー */}
      <div className="flex justify-center gap-3 bg-gray-100 p-4 rounded-lg">
        <Button
          variant="outline"
          size="lg"
          onClick={toggleVideo}
          className={isVideoEnabled ? "" : "bg-red-100 border-red-300"}
        >
          {isVideoEnabled ? (
            <Video className="w-5 h-5" />
          ) : (
            <VideoOff className="w-5 h-5 text-red-500" />
          )}
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={toggleAudio}
          className={isAudioEnabled ? "" : "bg-red-100 border-red-300"}
        >
          {isAudioEnabled ? (
            <Mic className="w-5 h-5" />
          ) : (
            <MicOff className="w-5 h-5 text-red-500" />
          )}
        </Button>

        <Button variant="outline" size="lg">
          <Share2 className="w-5 h-5" />
        </Button>

        <Button
          onClick={handleEndCall}
          size="lg"
          className="bg-red-500 hover:bg-red-600 ml-auto"
        >
          <PhoneOff className="w-5 h-5" />
        </Button>
      </div>

      {/* 通話品質表示 */}
      <div className="text-xs text-gray-500 text-center">
        <p>接続品質: 良好 | 遅延: 45ms | パケットロス: 0.2%</p>
      </div>
    </div>
  );
}
