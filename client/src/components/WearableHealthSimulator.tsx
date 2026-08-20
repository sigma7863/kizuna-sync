import { useRef, useState } from "react";
import { Activity, Footprints, HeartPulse, Moon, RotateCcw, Play } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function WearableHealthSimulator({ familyGroupId }: { familyGroupId: number }) {
  const utils = trpc.useUtils();
  const { data: latest, isLoading } = trpc.health.latest.useQuery({ familyGroupId });
  const [isRunning, setIsRunning] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [localSnapshot, setLocalSnapshot] = useState<typeof latest>();
  const [simulationId, setSimulationId] = useState<string | null>(null);
  const stopRequestedRef = useRef(false);
  const simulateMutation = trpc.health.simulate.useMutation({
    onSuccess: (result) => {
      if (result.cancelled || stopRequestedRef.current) return;
      setLocalSnapshot(result as typeof latest);
      void utils.health.latest.invalidate({ familyGroupId });
      void utils.timeline.getFamilyTimeline.invalidate({ familyGroupId });
    },
    onSettled: () => setIsRunning(false),
  });
  const stopMutation = trpc.health.stopSimulation.useMutation();
  const snapshot = localSnapshot ?? latest;

  const simulate = () => {
    stopRequestedRef.current = false;
    setIsStopped(false);
    setIsRunning(true);
    const nextSimulationId = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `simulation-${Date.now()}`;
    setSimulationId(nextSimulationId);
    simulateMutation.mutate({ familyGroupId, seed: Date.now(), simulationId: nextSimulationId });
  };

  const stop = () => {
    stopRequestedRef.current = true;
    if (simulationId) stopMutation.mutate({ simulationId });
    setIsRunning(false);
    setIsStopped(true);
  };

  const reset = () => {
    stopRequestedRef.current = true;
    setIsRunning(false);
    setIsStopped(false);
    setSimulationId(null);
    setLocalSnapshot(undefined);
    void utils.health.latest.invalidate({ familyGroupId });
  };

  return (
    <Card className="border-0 bg-white p-5 shadow-md">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-rose-100 p-3 text-rose-600"><Activity className="h-5 w-5" /></div>
        <div className="flex-1"><h2 className="font-semibold text-gray-800">ウェアラブル体験シミュレーター</h2><p className="mt-1 text-sm leading-relaxed text-gray-500">実機をつながなくても、歩数・心拍・睡眠をタイムラインで体験できます。</p></div>
      </div>
      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">これはデモ用のシミュレーションデータです。医療判断や緊急時の用途には使わないでください。</div>
      {isLoading ? <p className="mt-5 text-sm text-gray-500">データを読み込み中…</p> : snapshot ? <div className="mt-5 grid grid-cols-3 gap-2"><Metric icon={<Footprints className="h-4 w-4" />} label="歩数" value={`${snapshot.steps.toLocaleString()}歩`} tone="blue" /><Metric icon={<HeartPulse className="h-4 w-4" />} label="心拍" value={`${snapshot.heartRate} bpm`} tone="rose" /><Metric icon={<Moon className="h-4 w-4" />} label="睡眠" value={`${Math.floor(snapshot.sleepMinutes / 60)}時間${snapshot.sleepMinutes % 60}分`} tone="indigo" /></div> : <p className="mt-5 text-sm text-gray-500">まだシミュレーション結果がありません。</p>}
      <div className="mt-5 flex gap-2"><Button onClick={isRunning ? stop : simulate} className={`flex-1 text-white ${isRunning ? "bg-gray-600 hover:bg-gray-700" : "bg-rose-500 hover:bg-rose-600"}`}><Play className="mr-2 h-4 w-4" />{isRunning ? "シミュレーションを停止" : isStopped ? "再開してデータを生成" : "データを生成"}</Button><Button variant="outline" onClick={reset} aria-label="シミュレーション表示をリセット"><RotateCcw className="h-4 w-4" /></Button></div>
      {isStopped && <p className="mt-3 text-xs font-medium text-gray-500">シミュレーションは停止中です。未完了の生成結果は表示しません。</p>}
      <p className="mt-3 text-xs text-gray-400">生成したデータは「simulated」印付きで家族タイムラインと絆の波紋に追加されます。</p>
    </Card>
  );
}

function Metric({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: "blue" | "rose" | "indigo" }) {
  const toneClass = { blue: "bg-blue-50 text-blue-600", rose: "bg-rose-50 text-rose-600", indigo: "bg-indigo-50 text-indigo-600" }[tone];
  return <div className={`rounded-xl p-3 ${toneClass}`}><div className="flex items-center gap-1 text-xs opacity-80">{icon}{label}</div><p className="mt-2 text-sm font-bold">{value}</p></div>;
}
