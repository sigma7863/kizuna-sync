import { useState } from "react";
import { Check, Loader2, Plus, ShoppingBasket } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

export function FamilyShoppingList({ familyGroupId }: { familyGroupId: number }) {
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const utils = trpc.useUtils();
  const { data: items = [], isLoading } = trpc.shopping.list.useQuery({ familyGroupId }, { enabled: familyGroupId > 0, refetchInterval: 30_000 });
  const refresh = () => utils.shopping.list.invalidate({ familyGroupId });
  const create = trpc.shopping.create.useMutation({ onSuccess: async () => { setItemName(""); setQuantity(""); await refresh(); toast.success("買い物メモに追加しました"); }, onError: (error) => toast.error(error.message) });
  const toggle = trpc.shopping.toggle.useMutation({ onSuccess: refresh, onError: (error) => toast.error(error.message) });
  return <Card className="border-0 bg-gradient-to-br from-lime-50 via-white to-emerald-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base text-slate-800"><ShoppingBasket className="h-5 w-5 text-lime-600" />家族の買い物メモ</CardTitle><p className="text-xs text-slate-500">必要なものをゆるく共有して、買えたらチェック。</p></CardHeader><CardContent className="space-y-3"><div className="flex gap-2"><Input value={itemName} onChange={(event) => setItemName(event.target.value)} maxLength={160} placeholder="牛乳、電池など" /><Input value={quantity} onChange={(event) => setQuantity(event.target.value)} maxLength={80} className="w-24" placeholder="1個" /><Button size="icon" disabled={!itemName.trim() || create.isPending} onClick={() => create.mutate({ familyGroupId, itemName, quantity: quantity || undefined })}>{create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}</Button></div>{isLoading ? <div className="flex justify-center py-6 text-xs text-slate-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" />読み込み中…</div> : <div className="space-y-2">{items.length === 0 ? <p className="rounded-xl border border-dashed border-lime-200 p-4 text-center text-xs text-slate-500">いま必要なものはありません。</p> : items.map((item) => <button key={item.id} type="button" onClick={() => toggle.mutate({ familyGroupId, itemId: item.id, isPurchased: !item.isPurchased })} className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-transform active:scale-[0.99] ${item.isPurchased ? "bg-emerald-50 text-slate-400" : "bg-white shadow-sm"}`}><span className={`grid h-5 w-5 place-items-center rounded-full border ${item.isPurchased ? "border-emerald-500 bg-emerald-500 text-white" : "border-lime-400"}`}>{item.isPurchased && <Check className="h-3.5 w-3.5" />}</span><span className={`text-sm font-medium ${item.isPurchased ? "line-through" : "text-slate-800"}`}>{item.itemName}</span>{item.quantity && <span className="ml-auto text-xs text-slate-500">{item.quantity}</span>}</button>)}</div>}</CardContent></Card>;
}
