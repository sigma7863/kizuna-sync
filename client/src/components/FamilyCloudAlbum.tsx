import { useRef, useState } from "react";
import { Download, Heart, ImagePlus, Loader2, Search, Sparkles, Tag, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { MAX_ALBUM_PHOTO_BYTES, isSupportedAlbumMimeType, type AlbumMimeType } from "@shared/album";

type FamilyCloudAlbumProps = { familyGroupId: number };

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("画像を読み込めませんでした"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

export function FamilyCloudAlbum({ familyGroupId }: FamilyCloudAlbumProps) {
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [keyword, setKeyword] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const utils = trpc.useUtils();
  const { data: photos = [], isLoading } = trpc.album.list.useQuery(
    { familyGroupId, favoritesOnly },
    { enabled: familyGroupId > 0 },
  );
  const { data: searchedPhotos = [], isLoading: isSearching } = trpc.album.search.useQuery(
    { familyGroupId, keyword },
    { enabled: familyGroupId > 0 && keyword.trim().length > 0 },
  );
  const displayedPhotos = keyword.trim() ? searchedPhotos : photos;
  const uploadPhoto = trpc.album.upload.useMutation({
    onSuccess: async () => {
      await utils.album.list.invalidate({ familyGroupId, favoritesOnly });
      await utils.album.search.invalidate();
      toast.success("写真をアルバムに追加し、AIタグを付けました");
    },
    onError: (error) => toast.error(error.message),
  });
  const setFavorite = trpc.album.setFavorite.useMutation({
    onSuccess: async () => {
      await utils.album.list.invalidate({ familyGroupId, favoritesOnly });
      await utils.album.search.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const handlePhotoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!isSupportedAlbumMimeType(file.type)) {
      toast.error("JPEG・PNG・WebP形式の画像を選択してください");
      return;
    }
    if (file.size > MAX_ALBUM_PHOTO_BYTES) {
      toast.error("写真は8MB以下にしてください");
      return;
    }
    try {
      const dataUrl = await readAsDataUrl(file);
      await uploadPhoto.mutateAsync({
        familyGroupId,
        dataUrl,
        fileName: file.name,
        mimeType: file.type as AlbumMimeType,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "写真の追加に失敗しました");
    }
  };

  const downloadAll = () => {
    if (displayedPhotos.length === 0) return;
    displayedPhotos.forEach((photo, index) => {
      window.setTimeout(() => {
        const anchor = document.createElement("a");
        anchor.href = photo.imageUrl;
        anchor.download = photo.fileName;
        anchor.rel = "noopener";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
      }, index * 180);
    });
    toast.success(`${displayedPhotos.length}枚の保存を開始しました`);
  };

  return (
    <Card className="border-0 bg-gradient-to-br from-sky-50 via-white to-rose-50 shadow-md">
      <CardHeader className="gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-base text-slate-800">
            <Sparkles className="h-5 w-5 text-violet-500" />
            家族クラウドアルバム
          </CardTitle>
          <p className="mt-1 text-xs text-slate-500">写真を共有すると、AIが思い出をやさしく整理します。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={favoritesOnly ? "default" : "outline"} onClick={() => setFavoritesOnly((current) => !current)}>
            <Heart className={`mr-1.5 h-4 w-4 ${favoritesOnly ? "fill-current" : ""}`} />
            お気に入り
          </Button>
          <Button size="sm" variant="outline" onClick={downloadAll} disabled={displayedPhotos.length === 0}>
            <Download className="mr-1.5 h-4 w-4" />
            まとめて保存
          </Button>
          <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploadPhoto.isPending}>
            {uploadPhoto.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-1.5 h-4 w-4" />}
            写真を追加
          </Button>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoSelect} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2 rounded-xl border bg-white px-3 py-1.5 shadow-sm">
          <Search className="h-4 w-4 text-sky-500" />
          <Input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="AIタグや説明から思い出を探す" className="h-8 border-0 p-0 text-sm shadow-none focus-visible:ring-0" />
          {keyword && <button type="button" className="text-slate-400 hover:text-slate-600" onClick={() => setKeyword("")} aria-label="検索をクリア"><X className="h-4 w-4" /></button>}
        </div>
        {isLoading || isSearching ? (
          <div className="flex min-h-52 items-center justify-center text-sm text-slate-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" />読み込み中…</div>
        ) : displayedPhotos.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-sky-200 bg-white/70 p-8 text-center">
            <ImagePlus className="mb-3 h-9 w-9 text-sky-300" />
            <p className="text-sm font-medium text-slate-700">{keyword ? "一致する思い出が見つかりませんでした" : favoritesOnly ? "お気に入りの写真はまだありません" : "最初の家族写真を追加しましょう"}</p>
            <p className="mt-1 text-xs text-slate-500">AIが説明とタグを付け、思い出を探しやすくします。</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {displayedPhotos.map((photo) => {
              const tags = Array.isArray(photo.tags) ? photo.tags.filter((tag): tag is string => typeof tag === "string") : [];
              return (
                <article key={photo.id} className="group overflow-hidden rounded-2xl border border-white bg-white shadow-sm transition-shadow hover:shadow-md">
                  <div className="relative aspect-square overflow-hidden bg-slate-100">
                    <img src={photo.imageUrl} alt={photo.description || photo.fileName} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <button
                      type="button"
                      aria-label={photo.isFavorite ? "お気に入りから外す" : "お気に入りに追加"}
                      onClick={() => setFavorite.mutate({ familyGroupId, photoId: photo.id, isFavorite: !photo.isFavorite })}
                      className="absolute right-2 top-2 rounded-full bg-white/90 p-2 text-rose-500 shadow-sm transition-transform active:scale-95"
                    >
                      <Heart className={`h-4 w-4 ${photo.isFavorite ? "fill-current" : ""}`} />
                    </button>
                  </div>
                  <div className="space-y-2 p-3">
                    <p className="line-clamp-2 text-xs leading-relaxed text-slate-700">{photo.description || "AIの説明を準備中です"}</p>
                    {tags.length > 0 && <div className="flex flex-wrap gap-1">{tags.slice(0, 3).map((tag) => <Badge key={tag} variant="secondary" className="gap-1 text-[10px]"><Tag className="h-2.5 w-2.5" />{tag}</Badge>)}</div>}
                    <a href={photo.imageUrl} download={photo.fileName} className="inline-flex items-center text-[11px] font-medium text-sky-600 hover:text-sky-700"><Download className="mr-1 h-3 w-3" />保存</a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
