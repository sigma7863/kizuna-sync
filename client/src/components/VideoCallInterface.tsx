import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';

interface VideoCallInterfaceProps {
  familyGroupId: number;
  onEndCall: () => void;
}

export function VideoCallInterface({ familyGroupId, onEndCall }: VideoCallInterfaceProps) {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [participants, setParticipants] = useState<string[]>(['You']);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    // Initialize WebRTC
    const initializeWebRTC = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('[Video Call] Error accessing media devices:', error);
      }
    };

    initializeWebRTC();

    // Call duration timer
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl bg-gray-900 border-0">
        <div className="relative w-full aspect-video bg-gray-800 rounded-lg overflow-hidden">
          {/* Main video feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Call duration */}
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg text-sm font-semibold">
            {formatDuration(callDuration)}
          </div>

          {/* Participants info */}
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg text-sm">
            {participants.length} 人が参加中
          </div>

          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 flex justify-center gap-4">
            <Button
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              className={`rounded-full w-14 h-14 flex items-center justify-center ${
                isAudioEnabled
                  ? 'bg-gray-600 hover:bg-gray-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isAudioEnabled ? (
                <Mic className="w-6 h-6 text-white" />
              ) : (
                <MicOff className="w-6 h-6 text-white" />
              )}
            </Button>

            <Button
              onClick={() => setIsVideoEnabled(!isVideoEnabled)}
              className={`rounded-full w-14 h-14 flex items-center justify-center ${
                isVideoEnabled
                  ? 'bg-gray-600 hover:bg-gray-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isVideoEnabled ? (
                <Video className="w-6 h-6 text-white" />
              ) : (
                <VideoOff className="w-6 h-6 text-white" />
              )}
            </Button>

            <Button
              onClick={onEndCall}
              className="rounded-full w-14 h-14 flex items-center justify-center bg-red-600 hover:bg-red-700"
            >
              <PhoneOff className="w-6 h-6 text-white" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
