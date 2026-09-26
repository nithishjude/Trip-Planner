// app/api/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { safeParseItinerary } from "@/lib/schema";

const SYSTEM_PROMPT = `You are a travel itinerary assistant. Return ONLY valid JSON matching this exact shape — no prose, no markdown fences, no extra keys:

{
  "destination": string,
  "days": [
    {
      "day": number,
      "label": string,
      "stops": [
        {
          "name": string,
          "time_of_day": "morning" | "afternoon" | "evening",
          "category": "sight" | "food" | "transit" | "rest" | "activity",
          "description": string,
          "duration_minutes": number
        }
      ]
    }
  ]
}

Rules:
- "label" should be descriptive, e.g. "Day 1 — Arrival & First Impressions"
- Each day should have 3–6 stops
- "description" should be 1–2 informative sentences per stop
- "duration_minutes" should be a realistic positive integer
- Every stop must have "time_of_day" set to exactly one of: morning, afternoon, evening
- Every stop must have "category" set to exactly one of: sight, food, transit, rest, activity
- Return nothing outside the JSON object`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "invalid_prompt" },
        { status: 400 }
      );
    }

    if (prompt.trim().length > 1000) {
      return NextResponse.json(
        { error: "prompt_too_long" },
        { status: 400 }
      );
    }

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      console.error("XAI_API_KEY is not set");
      return NextResponse.json(
        { error: "server_misconfigured" },
        { status: 500 }
      );
    }

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt.trim() },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("xAI API error:", res.status, errText);
      return NextResponse.json(
        { error: "upstream_error" },
        { status: 502 }
      );
    }

    const data = await res.json();
    const raw: string = data?.choices?.[0]?.message?.content ?? "";

    if (!raw) {
      return NextResponse.json(
        { error: "empty_response" },
        { status: 422 }
      );
    }

    const parsed = safeParseItinerary(raw);

    if (!parsed.success) {
      console.error("Validation failed for raw:", raw.slice(0, 500));
      return NextResponse.json(
        { error: "malformed_or_wrong_shape" },
        { status: 422 }
      );
    }

    return NextResponse.json(parsed.data);
  } catch (err) {
    console.error("Unexpected error in /api/generate:", err);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 }
    );
  }
}
