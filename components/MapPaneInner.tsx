"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { Stop } from "@/types/itinerary";
import { categoryConfig } from "@/lib/utils";

interface MapPaneInnerProps {
  stops: Stop[];
  destination: string;
  activeStopId?: string;
  onStopFocus?: (stopId: string) => void;
}

// Static coordinates for popular destinations
const DESTINATION_COORDS: Record<string, [number, number]> = {
  kyoto: [35.0116, 135.7681],
  tokyo: [35.6762, 139.6503],
  barcelona: [41.3851, 2.1734],
  paris: [48.8566, 2.3522],
  london: [51.5074, -0.1278],
  rome: [41.9028, 12.4964],
  amsterdam: [52.3676, 4.9041],
  "new york": [40.7128, -74.006],
  dubai: [25.2048, 55.2708],
  singapore: [1.3521, 103.8198],
  bangkok: [13.7563, 100.5018],
  bali: [-8.3405, 115.092],
  istanbul: [41.0082, 28.9784],
  prague: [50.0755, 14.4378],
  vienna: [48.2082, 16.3738],
  berlin: [52.52, 13.405],
  sydney: [-33.8688, 151.2093],
  "san francisco": [37.7749, -122.4194],
  "los angeles": [34.0522, -118.2437],
  "new zealand": [-40.9006, 174.886],
  lisbon: [38.7167, -9.1333],
  madrid: [40.4168, -3.7038],
  florence: [43.7696, 11.2558],
  milan: [45.4654, 9.1859],
  athens: [37.9838, 23.7275],
  cairo: [30.0444, 31.2357],
  mumbai: [19.076, 72.8777],
  delhi: [28.6139, 77.209],
  "kuala lumpur": [3.139, 101.6869],
  "hong kong": [22.3193, 114.1694],
  seoul: [37.5665, 126.978],
  osaka: [34.6937, 135.5023],
  "mexico city": [19.4326, -99.1332],
  "rio de janeiro": [-22.9068, -43.1729],
  "buenos aires": [-34.6037, -58.3816],
};

function getDestinationCoords(destination?: string): [number, number] {
  if (!destination) return [20, 0];
  const key = destination.toLowerCase();
  for (const [name, coords] of Object.entries(DESTINATION_COORDS)) {
    if (key.includes(name)) return coords;
  }
  return [20, 0];
}

function getStopCoords(
  center: [number, number],
  index: number,
  total: number
): [number, number] {
  const spread = 0.018;
  const angle = (index / Math.max(total, 1)) * Math.PI * 2 + Math.PI / 4;
  const dist = spread * (0.4 + (index % 3) * 0.3);
  return [
    center[0] + Math.sin(angle) * dist,
    center[1] + Math.cos(angle) * dist,
  ];
}

export default function MapPaneInner({
  stops,
  destination,
  activeStopId,
  onStopFocus,
}: MapPaneInnerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<import("leaflet").Map | null>(null);
  const markersRef = useRef<import("leaflet").Marker[]>([]);
  const prevStopsKeyRef = useRef<string>("");

  useEffect(() => {
    if (!mapRef.current) return;

    const stopsKey = stops.map((s) => s.id).join(",") + destination;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      // Fix leaflet icon paths in Next.js
      const iconProto = L.Icon.Default.prototype as unknown as Record<string, unknown>;
      delete iconProto._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const center = getDestinationCoords(destination);

      if (!leafletMapRef.current) {
        const map = L.map(mapRef.current!, {
          center,
          zoom: 14,
          zoomControl: true,
          attributionControl: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(map);

        leafletMapRef.current = map;
      } else {
        leafletMapRef.current.setView(center, 14);
      }

      // Skip re-adding markers if stops didn't change
      if (prevStopsKeyRef.current === stopsKey) return;
      prevStopsKeyRef.current = stopsKey;

      const map = leafletMapRef.current;

      // Clear existing markers and lines
      if ((leafletMapRef.current as any).routeLine) {
        (leafletMapRef.current as any).routeLine.remove();
      }
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      const routeCoords: [number, number][] = [];

      // Add markers for each stop
      stops.forEach((stop, i) => {
        const cat = categoryConfig[stop.category] ?? categoryConfig.sight;
        const coords = getStopCoords(center, i, stops.length);
        routeCoords.push(coords);

        const icon = L.divIcon({
          html: `
            <div style="
              width: 36px; height: 36px;
              background: linear-gradient(135deg, #7c5cf6, #5b3fcf);
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 2px solid rgba(255,255,255,0.2);
              box-shadow: 0 4px 16px rgba(124,92,246,0.5);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="transform: rotate(45deg); font-size: 14px; line-height: 1;">
                ${cat.icon}
              </div>
            </div>
          `,
          className: "",
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -38],
        });

        const marker = L.marker(coords, { icon }).addTo(map);
        marker.bindPopup(
          `<div style="min-width:180px;font-family:Inter,system-ui,sans-serif;">
            <div style="font-size:11px;color:#8b90a8;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.05em;">
              ${cat.icon} ${cat.label}
            </div>
            <div style="font-weight:600;font-size:14px;margin-bottom:6px;color:#f0f2ff;">${stop.name}</div>
            <div style="font-size:12px;color:#8b90a8;line-height:1.5;">${stop.description}</div>
          </div>`,
          { maxWidth: 260, className: "wayfarer-popup" }
        );

        marker.on("click", () => {
          onStopFocus?.(stop.id);
        });

        markersRef.current.push(marker);
      });

      // Add Route Line
      if (routeCoords.length > 1) {
        const routeLine = L.polyline(routeCoords, {
          color: '#7c5cf6',
          weight: 3,
          dashArray: '10, 15',
          opacity: 0.8,
          className: 'animated-route'
        }).addTo(map);
        (leafletMapRef.current as any).routeLine = routeLine;
      }
    };

    initMap();
  }, [stops, destination, onStopFocus]);

  // Pan to active stop
  useEffect(() => {
    if (!leafletMapRef.current || !activeStopId) return;
    const activeIndex = stops.findIndex((s) => s.id === activeStopId);
    if (activeIndex === -1) return;

    const center = getDestinationCoords(destination);
    const coords = getStopCoords(center, activeIndex, stops.length);

    leafletMapRef.current.panTo(coords, { animate: true, duration: 0.6 });

    const marker = markersRef.current[activeIndex];
    if (marker) marker.openPopup();
  }, [activeStopId, stops, destination]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-white/6">
      <div ref={mapRef} className="w-full h-full" />
      {/* Stop count overlay */}
      <div className="absolute top-3 left-3 z-[400] glass rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
        <span className="text-xs text-[var(--text-secondary)]">
          {stops.length} stop{stops.length !== 1 ? "s" : ""} on map
        </span>
      </div>
    </div>
  );
}
