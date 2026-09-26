"use client";

// MapPane uses Leaflet which requires the browser window.
// We export a lazy-loaded version to avoid SSR issues.

import dynamic from "next/dynamic";
import { Stop } from "@/types/itinerary";

// The actual implementation
function MapPaneImpl({
  stops,
  destination,
  activeStopId,
  onStopFocus,
}: MapPaneProps) {
  return null; // placeholder — real impl below
}

export interface MapPaneProps {
  stops: Stop[];
  destination: string;
  activeStopId?: string;
  onStopFocus?: (stopId: string) => void;
}

// Dynamic import with SSR disabled
const MapPaneDynamic = dynamic(() => import("./MapPaneInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full rounded-xl bg-white/3 flex items-center justify-center border border-white/6">
      <div className="text-[var(--text-muted)] text-sm flex flex-col items-center gap-2">
        <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-white/30 animate-spin" />
        <span>Loading map…</span>
      </div>
    </div>
  ),
});

export default function MapPane(props: MapPaneProps) {
  return <MapPaneDynamic {...props} />;
}
