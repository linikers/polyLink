// AI estimation engine — provider-agnostic, OpenAI-compatible

export interface AIEstimate {
  probability: number;  // 0-100
  confidence: number;   // 0-100
  reasoning?: string;
}

export interface MarketContext {
  title: string;
  description?: string;
  category?: string;
  volume: number;
  liquidity: number;
  yesPrice: number;  // 0-100
  noPrice: number;   // 0-100
  endDate?: string;
}

const SYSTEM_PROMPT = `You are a prediction market analyst. Your job is to estimate the fair probability of an event resolving to "Yes".

Analyze the market data and use your knowledge of the topic to make an unbiased estimate.

Rules:
1. Return ONLY valid JSON — no markdown, no extra text
2. Format: {"probability": 0-100, "confidence": 0-100, "reasoning": "brief explanation"}
3. probability = your estimated fair chance of Yes (0-100)
4. confidence = how sure you are (0-100). 90+ if very certain, 30- if guessing
5. Consider: market description, volume, liquidity, category, current price
6. Be contrarian when the crowd is clearly wrong, but don't be contrarian for its own sake
7. Markets near 50% should have lower confidence (genuinely uncertain)
8. Markets near 0% or 100% can have higher confidence if the evidence is clear`;

export function buildUserPrompt(market: MarketContext): string {
  return JSON.stringify({
    task: "Estimate fair probability",
    market_title: market.title,
    description: market.description ?? "(none)",
    category: market.category ?? "uncategorized",
    volume_usd: market.volume,
    liquidity_usd: market.liquidity,
    current_yes_price_pct: market.yesPrice,
    current_no_price_pct: market.noPrice,
    end_date: market.endDate ?? "unknown",
  });
}

export function parseEstimate(text: string): AIEstimate {
  // Try direct JSON parse first
  try {
    // Strip markdown code fences if present
    const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return {
      probability: clamp(Number(parsed.probability) || 50, 0, 100),
      confidence: clamp(Number(parsed.confidence) || 0, 0, 100),
      reasoning: String(parsed.reasoning || ""),
    };
  } catch {
    // Fallback: extract numbers via regex
    const probMatch = text.match(/probability[:\s"]+(\d+)/i);
    const confMatch = text.match(/confidence[:\s"]+(\d+)/i);
    return {
      probability: clamp(Number(probMatch?.[1] || 50), 0, 100),
      confidence: clamp(Number(confMatch?.[1] || 0), 0, 100),
      reasoning: text.slice(0, 200),
    };
  }
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
