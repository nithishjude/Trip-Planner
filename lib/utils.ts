// lib/utils.ts
import { RawItinerary } from "./schema";
import { Itinerary, Stop } from "@/types/itinerary";

let _counter = 0;

function generateId(): string {
  return `stop_${Date.now()}_${++_counter}`;
}

/**
 * Assign stable client-side IDs and default "suggested" status to all stops.
 * This is called once after successful API response, never again.
 */
export function assignStopIds(raw: RawItinerary): Itinerary {
  return {
    destination: raw.destination,
    days: raw.days.map((day) => ({
      day: day.day,
      label: day.label,
      stops: day.stops.map((stop) => ({
        ...stop,
        id: generateId(),
        status: "suggested" as const,
      })),
    })),
  };
}

/**
 * Given an itinerary, get all stops in a flat list (preserving day context).
 */
export function getAllStops(itinerary: Itinerary): (Stop & { dayIndex: number })[] {
  return itinerary.days.flatMap((day, dayIndex) =>
    day.stops.map((stop) => ({ ...stop, dayIndex }))
  );
}

/**
 * Category icon mapping
 */
export const categoryConfig: Record<
  string,
  { icon: string; color: string; bgColor: string; label: string }
> = {
  sight: {
    icon: "🏛️",
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    label: "Sightseeing",
  },
  food: {
    icon: "🍜",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    label: "Food & Drink",
  },
  transit: {
    icon: "🚆",
    color: "text-sky-400",
    bgColor: "bg-sky-500/10",
    label: "Transit",
  },
  rest: {
    icon: "🏨",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    label: "Rest",
  },
  activity: {
    icon: "🎯",
    color: "text-rose-400",
    bgColor: "bg-rose-500/10",
    label: "Activity",
  },
};

export const timeOfDayConfig: Record<string, { icon: string; label: string; color: string }> = {
  morning: { icon: "🌅", label: "Morning", color: "text-amber-300" },
  afternoon: { icon: "☀️", label: "Afternoon", color: "text-orange-300" },
  evening: { icon: "🌙", label: "Evening", color: "text-indigo-300" },
};

export const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  suggested: {
    label: "Suggested",
    color: "text-slate-400",
    dot: "bg-slate-400",
  },
  kept: {
    label: "Kept",
    color: "text-emerald-400",
    dot: "bg-emerald-400",
  },
  edited: {
    label: "Edited",
    color: "text-violet-400",
    dot: "bg-violet-400",
  },
};

/**
 * Format duration in minutes to a human-readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/**
 * Get destination map center coordinates using a simple static lookup
 * (No geocoding API needed — we use Nominatim via OSM as a fallback)
 */
export async function geocodeDestination(destination: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Wayfarer/1.0 (trip-planner-app)" },
    });
    const data = await res.json();
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch {
    // fail silently
  }
  return null;
}
