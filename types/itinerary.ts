// types/itinerary.ts
export type TimeOfDay = "morning" | "afternoon" | "evening";
export type Category = "sight" | "food" | "transit" | "rest" | "activity";
export type StopStatus = "suggested" | "kept" | "edited";

export type Stop = {
  id: string;                    // stable client-side id, assigned after parse
  name: string;
  time_of_day: TimeOfDay;
  category: Category;
  description: string;           // 1–2 sentences, model-generated
  duration_minutes: number;
  status: StopStatus;            // the "honesty rule" state
  lat?: number;                  // optional: geocoded coordinates
  lng?: number;
};

export type Day = {
  day: number;
  label: string;                 // e.g. "Day 1 — Arrival & Gion"
  stops: Stop[];
};

export type Itinerary = {
  destination: string;
  days: Day[];
};

export type AppStatus =
  | "landing"
  | "empty"
  | "loading"
  | "ready"
  | "error"
  | "refining";
