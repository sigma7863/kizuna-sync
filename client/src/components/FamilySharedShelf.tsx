import { useState } from "react";
import { Box, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

const statusLabel = { available: "貸し出し可", borrowed: "貸出中", returned: "返却済み" } as const;

export function FamilySharedShelf({ familyGroupId }: { familyGroupId: number }) {
  const utils = trpc.useUtils();
  const [itemName, setItemName] = useState("");
  const [note, setNote] = useState("");
  const [borrowerDraft, setBorrowerDraft] = useState<Record<number, string>>({});
  const { data: items = [], isLoading } = trpc.sharedShelf.list.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const { data: members = [] } = trpc.family.getMembers.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const create = trpc.sharedShelf.create.useMutation({ onSuccess: async () => { setItemName(""); setNote(""); await utils.sharedShelf.list.invalidate({ familyGroupId }); } });
  const updateStatus = trpc.sharedShelf.updateStatus.useMutation({ onSuccess: () => utils.sharedShelf.list.invalidate({ familyGroupId }) });
  const nameMap = new Map(members.map((member) => [member.users.id, member.users.name ?? "家族"]));

  return <Card className="border-0 bg-gradient-to-br from-amber-50 via-white to-yellow-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Box className="h-5 w-5 text-amber-600"/>家族の持ち物シェア棚</CardTitle><p className="text-xs text-slate-500">貸したい物と返却状況を、家族でゆるく共有。</p></CardHeader><CardContent className="space-y-3"><div className="grid gap-2 rounded-xl bg-white/80 p-3"><Input value={itemName} onChange={(event) => setItemName(event.target.value)} placeholder="例：双眼鏡" maxLength={160}/><Input value={note} onChange={(event) => setNote(event.target.value)} placeholder="メモ（任意）" maxLength={240}/><Button size="sm" disabled={!itemName.trim() || create.isPending} onClick={() => create.mutate({ familyGroupId, itemName, note })}>{create.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin"/> : <><Plus className="mr-1 h-4 w-4"/>持ち物を追加</>}</Button></div>{isLoading ? <p className="py-3 text-center text-xs text-amber-700">持ち物を読み込み中です…</p> : <div className="grid gap-2">{items.map((item) => <div key={item.id} className="rounded-xl bg-white p-3 shadow-sm"><div className="flex items-start justify-between gap-2"><div><p className="text-sm font-semibold text-slate-800">{item.itemName}</p><p className="text-[11px] text-amber-700">{statusLabel[item.status]}</p>{item.note && <p className="mt-1 text-xs text-slate-600">{item.note}</p>}<p className="mt-1 text-[11px] text-slate-500">持ち主: {nameMap.get(item.ownerUserId) ?? "家族"}{item.borrowerUserId ? ` / 借り手: ${nameMap.get(item.borrowerUserId) ?? "家族"}` : ""}</p></div><div className="flex flex-col gap-1">{item.status !== "borrowed" && <Button size="sm" variant="outline" className="bg-white" disabled={updateStatus.isPending} onClick={() => updateStatus.mutate({ familyGroupId, itemId: item.id, borrowerUserId: borrowerDraft[item.id] ? Number(borrowerDraft[item.id]) : undefined, status: "borrowed" })}>貸す</Button>}{item.status !== "available" && <Button size="sm" variant="outline" className="bg-white" disabled={updateStatus.isPending} onClick={() => updateStatus.mutate({ familyGroupId, itemId: item.id, status: item.status === "borrowed" ? "returned" : "available" })}>{item.status === "borrowed" ? "返却済み" : "棚に戻す"}</Button>}</div></div><select value={borrowerDraft[item.id] ?? ""} onChange={(event) => setBorrowerDraft((current) => ({ ...current, [item.id]: event.target.value }))} className="mt-2 h-9 w-full rounded-md border bg-white px-3 text-sm"><option value="">借りる人を選択（任意）</option>{members.map((member) => <option key={member.users.id} value={member.users.id}>{member.users.name ?? "家族"}</option>)}</select></div>)}{items.length === 0 && <p className="rounded-xl border border-dashed border-amber-200 p-3 text-center text-xs text-slate-500">貸したい持ち物を追加してみましょう。</p>}</div>}</CardContent></Card>;
}
