import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { MapView } from "@/components/Map";
import { Card } from "@/components/ui/card";

interface LocationPoint {
  userId: number;
  userName: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: Date;
}

interface GeofencePoint {
  id: number;
  name: string;
  latitude: string | number;
  longitude: string | number;
  radiusMeters: number;
}

export function FamilyLocationMap({ locations, geofences }: { locations: LocationPoint[]; geofences: GeofencePoint[] }) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const overlays = useRef<Array<google.maps.marker.AdvancedMarkerElement | google.maps.Circle>>([]);
  const firstPoint = locations[0] ?? geofences[0];
  const center = firstPoint
    ? { lat: Number(firstPoint.latitude), lng: Number(firstPoint.longitude) }
    : { lat: 35.681236, lng: 139.767125 };

  useEffect(() => {
    if (!map) return;
    overlays.current.forEach((overlay) => {
      if (overlay instanceof google.maps.Circle) overlay.setMap(null);
      else overlay.map = null;
    });
    overlays.current = [];

    for (const location of locations) {
      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: Number(location.latitude), lng: Number(location.longitude) },
        title: location.userName,
      });
      overlays.current.push(marker);
    }
    for (const geofence of geofences) {
      const circle = new google.maps.Circle({
        map,
        center: { lat: Number(geofence.latitude), lng: Number(geofence.longitude) },
        radius: geofence.radiusMeters,
        fillColor: "#34d399",
        fillOpacity: 0.16,
        strokeColor: "#059669",
        strokeOpacity: 0.75,
        strokeWeight: 2,
      });
      overlays.current.push(circle);
    }

    return () => {
      overlays.current.forEach((overlay) => {
        if (overlay instanceof google.maps.Circle) overlay.setMap(null);
        else overlay.map = null;
      });
      overlays.current = [];
    };
  }, [map, locations, geofences]);

  return (
    <Card className="overflow-hidden border-0 bg-white shadow-md">
      <div className="flex items-center gap-2 border-b border-blue-100 px-4 py-3">
        <MapPin className="h-5 w-5 text-blue-500" />
        <div>
          <h3 className="font-semibold text-gray-800">家族の位置情報マップ</h3>
          <p className="text-xs text-gray-500">最新地点と安全地帯をリアルタイム表示</p>
        </div>
      </div>
      <MapView
        className="h-[360px]"
        initialCenter={center}
        initialZoom={14}
        onMapReady={setMap}
      />
    </Card>
  );
}
