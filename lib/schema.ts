// lib/schema.ts
import { z } from "zod";

export const StopSchema = z.object({
  name: z.string().min(1),
  time_of_day: z.enum(["morning", "afternoon", "evening"]),
  category: z.enum(["sight", "food", "transit", "rest", "activity"]),
  description: z.string().min(1),
  duration_minutes: z.number().positive(),
});

export const DaySchema = z.object({
  day: z.number(),
  label: z.string().min(1),
  stops: z.array(StopSchema).min(1),
});

export const ItinerarySchema = z.object({
  destination: z.string().min(1),
  days: z.array(DaySchema).min(1),
});

export type RawItinerary = z.infer<typeof ItinerarySchema>;
export type RawStop = z.infer<typeof StopSchema>;

/**
 * Safely parse a raw string from the LLM into a validated itinerary.
 * Handles markdown fences, leading/trailing whitespace, and structural validation.
 */
export function safeParseItinerary(raw: string) {
  try {
    // Strip markdown code fences the model sometimes adds despite instructions
    const cleaned = raw
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/, "")
      .trim();

    const json = JSON.parse(cleaned);
    return ItinerarySchema.safeParse(json);
  } catch {
    return { success: false as const, error: null };
  }
}
