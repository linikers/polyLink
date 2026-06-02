import { NextRequest, NextResponse } from "next/server";
import { buildUserPrompt, parseEstimate, type MarketContext } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const market: MarketContext = await request.json();

    // Validate required fields
    if (!market.title || market.yesPrice === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: title, yesPrice" },
        { status: 400 }
      );
    }

    // Get config from env
    const apiKey = process.env.AI_API_KEY;
    const baseUrl = process.env.AI_API_BASE_URL || "https://api.deepseek.com";
    const model = process.env.AI_MODEL || "deepseek-chat";

    if (!apiKey) {
      return NextResponse.json(
        { error: "AI_API_KEY not configured. Set it in .env.local" },
        { status: 500 }
      );
    }

    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: `You are a prediction market analyst. Your job is to estimate the fair probability of an event resolving to "Yes".

Analyze the market data and use your knowledge of the topic to make an unbiased estimate.

Rules:
1. Return ONLY valid JSON — no markdown, no extra text
2. Format: {"probability": 0-100, "confidence": 0-100, "reasoning": "brief explanation"}
3. probability = your estimated fair chance of Yes (0-100)
4. confidence = how sure you are (0-100). 90+ if very certain, 30- if guessing
5. Consider: market description, volume, liquidity, category, current price
6. Be contrarian when the crowd is clearly wrong, but don't be contrarian for its own sake
7. Markets near 50% should have lower confidence (genuinely uncertain)
8. Markets near 0% or 100% can have higher confidence if the evidence is clear` },
          { role: "user", content: buildUserPrompt(market) },
        ],
        temperature: 0.3,
        max_tokens: 300,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => "Unknown error");
      return NextResponse.json(
        { error: `AI API error: ${response.status} ${response.statusText}`, detail: errBody.slice(0, 500) },
        { status: 502 }
      );
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      return NextResponse.json(
        { error: "Empty response from AI API" },
        { status: 502 }
      );
    }

    const estimate = parseEstimate(text);

    return NextResponse.json({ success: true, estimate });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
