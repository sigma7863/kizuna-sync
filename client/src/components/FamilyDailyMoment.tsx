import { useState } from "react";
import { Camera, ImageIcon, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { getDailyMomentCaption } from "@shared/familyDailyRhythm";

const moods = ["うれしい", "穏やか", "がんばった", "感謝"];

export function FamilyDailyMoment({ familyGroupId }: { familyGroupId: number }) {
  const utils = trpc.useUtils();
  const [note, setNote] = useState("");
  const [moodSign, setMoodSign] = useState(moods[0]);
  const [photoId, setPhotoId] = useState("");
  const { data: moments = [], isLoading } = trpc.dailyMoments.list.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const { data: photos = [] } = trpc.album.list.useQuery({ familyGroupId, favoritesOnly: false }, { enabled: familyGroupId > 0 });
  const create = trpc.dailyMoments.create.useMutation({ onSuccess: async () => { setNote(""); setMoodSign(moods[0]); setPhotoId(""); await utils.dailyMoments.list.invalidate({ familyGroupId }); } });
  const photoById = new Map(photos.map((photo) => [photo.id, photo]));

  return <Card className="border-0 bg-gradient-to-br from-amber-50 via-white to-rose-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-5 w-5 text-amber-600"/>家族の今日の一枚</CardTitle><p className="text-xs text-slate-500">写真・気分・ひとことを、今日の小さな思い出に。</p></CardHeader><CardContent className="space-y-3"><div className="rounded-xl bg-white/80 p-3"><div className="flex flex-wrap gap-1.5">{moods.map((mood) => <button key={mood} type="button" onClick={() => setMoodSign(mood)} className={`rounded-full px-2.5 py-1 text-xs transition ${moodSign === mood ? "bg-amber-100 text-amber-800 ring-2 ring-amber-300" : "bg-slate-50 text-slate-600"}`}>{mood}</button>)}</div><Input className="mt-2" value={note} onChange={(event) => setNote(event.target.value)} placeholder="今日のひとこ と" maxLength={280}/><select value={photoId} onChange={(event) => setPhotoId(event.target.value)} className="mt-2 h-9 w-full rounded-md border bg-white px-3 text-sm"><option value="">写真を選ぶ（任意）</option>{photos.slice(0, 20).map((photo) => <option key={photo.id} value={photo.id}>{photo.description || photo.fileName}</option>)}</select><Button size="sm" className="mt-2 w-full" disabled={!note.trim() || create.isPending} onClick={() => create.mutate({ familyGroupId, note, moodSign, photoId: photoId ? Number(photoId) : undefined })}>{create.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin"/> : <><Camera className="mr-1 h-4 w-4"/>今日の一枚に残す</>}</Button></div>{isLoading ? <p className="py-3 text-center text-xs text-amber-700">思い出を読み込み中です…</p> : <div className="grid gap-2">{moments.slice(0, 4).map((moment) => { const photo = moment.photoId ? photoById.get(moment.photoId) : undefined; return <article key={moment.id} className="flex gap-3 rounded-xl bg-white p-3 shadow-sm">{photo ? <img src={photo.imageUrl} alt={photo.description || photo.fileName} className="h-14 w-14 shrink-0 rounded-lg object-cover"/> : <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-amber-50"><ImageIcon className="h-5 w-5 text-amber-500"/></div>}<div><p className="text-xs font-semibold text-slate-800">{getDailyMomentCaption(moment.moodSign, moment.note)}</p><p className="mt-1 text-[11px] text-slate-500">{new Date(moment.createdAt).toLocaleDateString()}</p></div></article>; })}{moments.length === 0 && <p className="rounded-xl border border-dashed border-amber-200 p-3 text-center text-xs text-slate-500">今日のことを、最初の一枚として残してみましょう。</p>}</div>}</CardContent></Card>;
}
