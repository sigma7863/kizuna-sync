import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Play, Trash2, Download } from "lucide-react";

interface Recording {
  id: number;
  title: string;
  duration: number;
  participants: string[];
  date: Date;
  fileSize: number;
  url: string;
}

export function VideoRecordingManager() {
  const [recordings, setRecordings] = useState<Recording[]>([
    {
      id: 1,
      title: "Family Video Call - June 5",
      duration: 1800,
      participants: ["Alice", "Bob", "Charlie"],
      date: new Date(Date.now() - 86400000),
      fileSize: 52428800, // 50MB
      url: "#",
    },
    {
      id: 2,
      title: "Weekly Family Meeting",
      duration: 900,
      participants: ["Alice", "Bob"],
      date: new Date(Date.now() - 172800000),
      fileSize: 26214400, // 25MB
      url: "#",
    },
  ]);

  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(1) + " MB";
  };

  const handleDelete = (id: number) => {
    setRecordings(recordings.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Video Call Recordings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedRecording ? (
            <div className="space-y-4">
              {/* ビデオプレイヤー */}
              <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
                <div className="text-center">
                  <Play className="w-12 h-12 text-white mx-auto mb-2" />
                  <p className="text-white text-sm">{selectedRecording.title}</p>
                </div>
              </div>

              {/* 情報 */}
              <div className="space-y-2">
                <h3 className="font-semibold">{selectedRecording.title}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Duration</p>
                    <p className="font-semibold">
                      {formatDuration(selectedRecording.duration)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">File Size</p>
                    <p className="font-semibold">
                      {formatFileSize(selectedRecording.fileSize)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Date</p>
                    <p className="font-semibold">
                      {selectedRecording.date.toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Participants</p>
                    <p className="font-semibold">
                      {selectedRecording.participants.length}
                    </p>
                  </div>
                </div>

                {/* 参加者 */}
                <div>
                  <p className="text-gray-600 text-sm mb-1">Participants</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedRecording.participants.map((p) => (
                      <Badge key={p} variant="secondary">
                        {p}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* アクション */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedRecording(null)}
                >
                  Back
                </Button>
                <Button size="sm" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    handleDelete(selectedRecording.id);
                    setSelectedRecording(null);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {recordings.length > 0 ? (
                recordings.map((recording) => (
                  <div
                    key={recording.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition"
                    onClick={() => setSelectedRecording(recording)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{recording.title}</h4>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                          <span>{formatDuration(recording.duration)}</span>
                          <span>{formatFileSize(recording.fileSize)}</span>
                          <span>{recording.date.toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Play className="w-5 h-5 text-pink-500" />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No recordings yet
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
