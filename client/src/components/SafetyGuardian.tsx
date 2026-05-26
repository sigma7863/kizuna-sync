import { useEffect, useState } from "react";
import { MapPin, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";

interface SafeLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
}

interface MemberLocation {
  userId: number;
  userName: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  locationName?: string;
  timestamp: Date;
}

interface SafetyGuardianProps {
  familyGroupId: number;
  memberLocations: MemberLocation[];
  onLocationUpdate?: (location: MemberLocation) => void;
}

/**
 * デジタル・お守りコンポーネント
 * GPS連携により、家族の安全な到着を全員のスマホに静かに通知する見守り機能
 */
export function SafetyGuardian({
  familyGroupId,
  memberLocations,
  onLocationUpdate,
}: SafetyGuardianProps) {
  const [safeLocations, setSafeLocations] = useState<SafeLocation[]>([]);
  const [newLocationName, setNewLocationName] = useState("");
  const [newLocationLat, setNewLocationLat] = useState("");
  const [newLocationLng, setNewLocationLng] = useState("");
  const [newLocationRadius, setNewLocationRadius] = useState("500");
  const [geoWatchId, setGeoWatchId] = useState<number | null>(null);

  // Queries
  const { data: geofences } = trpc.geofence.getByFamilyGroup.useQuery(
    { familyGroupId },
    { enabled: !!familyGroupId }
  );

  // Mutations
  const createGeofenceMutation = trpc.geofence.create.useMutation({
    onSuccess: () => {
      setNewLocationName("");
      setNewLocationLat("");
      setNewLocationLng("");
      setNewLocationRadius("500");
      trpc.useUtils().geofence.getByFamilyGroup.invalidate({ familyGroupId });
    },
  });

  const saveLocationMutation = trpc.location.saveLocation.useMutation();

  // GPS位置情報の取得と監視
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        // 位置情報をサーバーに保存
        saveLocationMutation.mutate({
          familyGroupId,
          latitude,
          longitude,
          accuracy: Math.round(accuracy),
        });

        // ジオフェンスチェック
        if (geofences) {
          geofences.forEach((geofence) => {
            const distance = calculateDistance(
              latitude,
              longitude,
              Number(geofence.latitude),
              Number(geofence.longitude)
            );

            if (distance <= geofence.radiusMeters) {
              // 安全地帯に到着 - 静かに通知
              onLocationUpdate?.({
                userId: 0,
                userName: "You",
                latitude,
                longitude,
                accuracy,
                locationName: geofence.name,
                timestamp: new Date(),
              });
            }
          });
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );

    setGeoWatchId(watchId);

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [familyGroupId, geofences, saveLocationMutation, onLocationUpdate]);

  const handleCreateGeofence = async () => {
    if (!newLocationName || !newLocationLat || !newLocationLng) return;

    await createGeofenceMutation.mutateAsync({
      familyGroupId,
      name: newLocationName,
      latitude: parseFloat(newLocationLat),
      longitude: parseFloat(newLocationLng),
      radiusMeters: parseInt(newLocationRadius),
    });
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000; // 地球の半径（メートル）
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return (
    <div className="space-y-6">
      {/* 安全地帯設定 */}
      <Card className="p-6 bg-white border-0 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-500" />
            安全地帯（デジタル・お守り）
          </h3>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                追加
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>安全地帯を追加</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="location-name">場所の名前</Label>
                  <Input
                    id="location-name"
                    placeholder="例：自宅、学校"
                    value={newLocationName}
                    onChange={(e) => setNewLocationName(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location-lat">緯度</Label>
                    <Input
                      id="location-lat"
                      type="number"
                      step="0.000001"
                      placeholder="35.6762"
                      value={newLocationLat}
                      onChange={(e) => setNewLocationLat(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location-lng">経度</Label>
                    <Input
                      id="location-lng"
                      type="number"
                      step="0.000001"
                      placeholder="139.6503"
                      value={newLocationLng}
                      onChange={(e) => setNewLocationLng(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location-radius">半径（メートル）</Label>
                  <Input
                    id="location-radius"
                    type="number"
                    placeholder="500"
                    value={newLocationRadius}
                    onChange={(e) => setNewLocationRadius(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <Button
                  onClick={handleCreateGeofence}
                  disabled={createGeofenceMutation.isPending}
                  className="w-full bg-green-500 hover:bg-green-600"
                >
                  {createGeofenceMutation.isPending ? "追加中..." : "追加"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {geofences && geofences.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {geofences.map((location) => (
              <div
                key={location.id}
                className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">{location.name}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      半径: {location.radiusMeters}m
                    </p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-sm">
            安全地帯を追加して、家族の到着を見守りましょう
          </p>
        )}
      </Card>

      {/* メンバーの位置情報 */}
      {memberLocations.length > 0 && (
        <Card className="p-6 bg-white border-0 shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-500" />
            家族の位置情報
          </h3>
          <div className="space-y-3">
            {memberLocations.map((location) => (
              <div
                key={location.userId}
                className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-gray-800">{location.userName}</p>
                  {location.locationName && (
                    <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                      <CheckCircle className="w-4 h-4" />
                      {location.locationName}に到着
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {location.timestamp.toLocaleTimeString('ja-JP')}
                  </p>
                </div>
                <MapPin className="w-5 h-5 text-blue-500" />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default SafetyGuardian;
