// app/api/refine/route.ts
import { NextRequest, NextResponse } from "next/server";
import { safeParseItinerary } from "@/lib/schema";
import { RawItinerary } from "@/lib/schema";

const SYSTEM_PROMPT = `You are a travel itinerary editor. You will receive an existing itinerary as JSON and an edit instruction from the user.
Return the FULL itinerary in the same exact JSON schema, with ONLY the requested change applied. 
Do NOT regenerate unrelated days or stops. Preserve all existing stop details unless specifically asked to change them.

The itinerary schema is:
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

Return ONLY valid JSON. No prose, no markdown fences, no extra keys.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { instruction, itinerary } = body as {
      instruction: string;
      itinerary: RawItinerary;
    };

    if (!instruction || typeof instruction !== "string" || instruction.trim().length === 0) {
      return NextResponse.json({ error: "invalid_instruction" }, { status: 400 });
    }

    if (!itinerary || !itinerary.days) {
      return NextResponse.json({ error: "invalid_itinerary" }, { status: 400 });
    }

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "server_misconfigured" }, { status: 500 });
    }

    const userMessage = `Current itinerary:\n${JSON.stringify(itinerary, null, 2)}\n\nEdit instruction: ${instruction.trim()}`;

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
          { role: "user", content: userMessage },
        ],
        temperature: 0.5,
        max_tokens: 4000,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("xAI API error on refine:", res.status, errText);
      return NextResponse.json({ error: "upstream_error" }, { status: 502 });
    }

    const data = await res.json();
    const raw: string = data?.choices?.[0]?.message?.content ?? "";

    if (!raw) {
      return NextResponse.json({ error: "empty_response" }, { status: 422 });
    }

    const parsed = safeParseItinerary(raw);

    if (!parsed.success) {
      console.error("Refinement validation failed for raw:", raw.slice(0, 500));
      return NextResponse.json({ error: "malformed_or_wrong_shape" }, { status: 422 });
    }

    return NextResponse.json(parsed.data);
  } catch (err) {
    console.error("Unexpected error in /api/refine:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
